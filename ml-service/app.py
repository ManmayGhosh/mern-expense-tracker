"""
ML microservice for the expense tracker.

Endpoints:
  POST /categorize  { text }              -> { category, confidence, source }
  POST /predict      { history: [...] }   -> { predicted_amount, method }

Runs independently of the Node/Express backend, which proxies to this
service and degrades gracefully if it's offline.
"""
import os
from typing import List, Optional

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fallback import fallback_categorize

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "categorizer.pkl")

app = FastAPI(title="Expense Tracker ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
if os.path.exists(MODEL_PATH):
    _model = joblib.load(MODEL_PATH)


class CategorizeRequest(BaseModel):
    text: str


class CategorizeResponse(BaseModel):
    category: Optional[str]
    confidence: float
    source: str  # "ml" or "fallback"


class MonthPoint(BaseModel):
    month: str
    total: float


class PredictRequest(BaseModel):
    history: List[MonthPoint]


class PredictResponse(BaseModel):
    predicted_amount: float
    method: str


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/categorize", response_model=CategorizeResponse)
def categorize(req: CategorizeRequest):
    text = (req.text or "").strip()
    if not text:
        return CategorizeResponse(category=None, confidence=0.0, source="none")

    if _model is not None:
        proba = _model.predict_proba([text])[0]
        classes = _model.classes_
        best_idx = int(np.argmax(proba))
        return CategorizeResponse(
            category=str(classes[best_idx]),
            confidence=float(proba[best_idx]),
            source="ml",
        )

    # No trained model yet — use the keyword fallback so the feature still works
    category, confidence = fallback_categorize(text)
    return CategorizeResponse(category=category, confidence=confidence, source="fallback")


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    totals = [p.total for p in req.history if p.total is not None]

    if len(totals) < 2:
        # Not enough history — best guess is just the last known month, or 0
        amount = totals[-1] if totals else 0.0
        return PredictResponse(predicted_amount=amount, method="last_value")

    # Simple linear trend forecast over the trailing months (robust with small
    # data, no external time-series deps needed). Falls back to a weighted
    # moving average if the trend fit looks unstable.
    x = np.arange(len(totals))
    y = np.array(totals, dtype=float)

    try:
        slope, intercept = np.polyfit(x, y, 1)
        next_x = len(totals)
        predicted = slope * next_x + intercept
        # Guard against wild extrapolation — clamp to a sane band around recent history
        recent_avg = np.mean(y[-3:]) if len(y) >= 3 else np.mean(y)
        lower, upper = recent_avg * 0.4, recent_avg * 1.8
        predicted = float(np.clip(predicted, max(lower, 0), upper if upper > 0 else predicted))
        method = "linear_trend"
    except Exception:
        weights = np.linspace(1, 2, min(3, len(y)))
        predicted = float(np.average(y[-len(weights):], weights=weights))
        method = "weighted_moving_average"

    return PredictResponse(predicted_amount=max(predicted, 0.0), method=method)
