# Dataset — manual download required

The category-classifier model is trained on the **"Daily Transactions Dataset"**
by `prasad22` on Kaggle. Kaggle requires a logged-in account to download, so
this can't be fetched automatically — grab it yourself:

1. Go to: https://www.kaggle.com/datasets/prasad22/daily-transactions-dataset
2. Sign in (or create a free Kaggle account)
3. Click **Download** (top right) — you'll get `archive.zip`
4. Unzip it and find the CSV inside (usually `Daily Household Transactions.csv`)
5. Copy that CSV into this folder and rename it to:

   ```
   ml-service/data/transactions.csv
   ```

Expected columns (the dataset ships with these — no renaming needed):
`Date, Mode, Category, Subcategory, Note, Amount, Income/Expense, Currency`

Once the file is in place, train the model:

```bash
cd ml-service
python train.py
```

This produces `model/categorizer.pkl`. Until you do this, the `/categorize`
endpoint still works — it falls back to a keyword-rule classifier (see
`fallback.py`) so the app isn't broken out of the box, it's just less
accurate than the trained model.
