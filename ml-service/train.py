"""
Trains the transaction-note -> category classifier.

Input:  data/transactions.csv  (Kaggle "Daily Transactions Dataset" by prasad22
        — see data/README.md for the manual download steps)
Output: model/categorizer.pkl  (a pipeline: TF-IDF vectorizer + Logistic Regression)

Run:
    python train.py
"""
import os
import sys
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "transactions.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "categorizer.pkl")

# The app's own category set — the Kaggle dataset's categories get mapped
# onto these so predictions line up with what the frontend/backend expect.
CATEGORY_MAP = {
    "food": "Food", "beverages": "Food", "food and drinks": "Food", "groceries": "Food",
    "transportation": "Transportation", "public provident fund": "Investment",
    "rent": "Housing", "household": "Housing", "housing": "Housing",
    "utilities": "Utilities", "recharge": "Utilities", "telephone bill": "Utilities",
    "entertainment": "Entertainment", "culture": "Entertainment", "festivals": "Entertainment",
    "health": "Health", "medical": "Health", "beauty": "Health",
    "shopping": "Shopping", "apparel": "Shopping", "clothing": "Shopping",
    "education": "Education", "tuition fees": "Education",
    "tourism": "Travel", "travel": "Travel",
    "investment": "Investment", "self-development": "Investment",
    "salary": "Income", "income": "Income", "awards": "Income",
    "other": "Other", "gift": "Other", "social life": "Other",
    "money transfer": "Other", "documents": "Other", "subscription": "Entertainment",
}


def normalize_category(raw: str) -> str:
    key = str(raw).strip().lower()
    return CATEGORY_MAP.get(key, "Other")


def main():
    if not os.path.exists(DATA_PATH):
        print(f"Dataset not found at {DATA_PATH}")
        print("Follow data/README.md to download it from Kaggle first.")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)

    # The Kaggle CSV has 'Note' (free-text description) and 'Category' columns.
    df = df.dropna(subset=["Note", "Category"])
    df = df[df["Note"].str.strip().str.len() > 0]

    df["category_norm"] = df["Category"].apply(normalize_category)

    X = df["Note"].astype(str)
    y = df["category_norm"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() > 1 else None
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(lowercase=True, ngram_range=(1, 2), min_df=2, max_features=5000)),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])

    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    print(classification_report(y_test, preds, zero_division=0))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
