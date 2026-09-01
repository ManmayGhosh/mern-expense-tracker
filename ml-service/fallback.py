"""
Rule-based fallback categorizer.

Used when no trained model exists yet (model/categorizer.pkl missing) so the
app is fully functional the moment it's cloned, before anyone downloads the
Kaggle dataset. Once train.py produces a real model, app.py prefers that
instead — this is only ever the fallback.
"""

KEYWORD_MAP = {
    "Food": ["restaurant", "cafe", "coffee", "lunch", "dinner", "breakfast", "swiggy",
             "zomato", "pizza", "grocery", "groceries", "snack", "food", "tea", "meal"],
    "Transportation": ["uber", "ola", "taxi", "cab", "metro", "bus", "fuel", "petrol",
                        "diesel", "parking", "toll", "train", "flight", "auto"],
    "Housing": ["rent", "landlord", "maintenance", "mortgage", "society"],
    "Utilities": ["electricity", "water bill", "gas bill", "internet", "wifi", "broadband",
                  "mobile recharge", "phone bill", "dth"],
    "Entertainment": ["movie", "netflix", "spotify", "concert", "game", "cinema",
                       "prime video", "hotstar", "youtube premium"],
    "Health": ["doctor", "medicine", "pharmacy", "hospital", "clinic", "gym", "dentist",
               "insurance premium"],
    "Shopping": ["amazon", "flipkart", "myntra", "clothes", "shoes", "mall", "shopping"],
    "Education": ["course", "tuition", "book", "udemy", "coursera", "college fee", "school fee"],
    "Travel": ["hotel", "airbnb", "vacation", "trip", "holiday", "tourism"],
    "Investment": ["mutual fund", "stock", "sip", "fd", "fixed deposit", "crypto", "shares"],
    "Income": ["salary", "stipend", "refund", "bonus", "interest credited", "freelance payment"],
}


def fallback_categorize(text: str):
    t = text.lower()
    for category, keywords in KEYWORD_MAP.items():
        for kw in keywords:
            if kw in t:
                return category, 0.55  # moderate confidence — it's a keyword match, not learned
    return "Other", 0.2
