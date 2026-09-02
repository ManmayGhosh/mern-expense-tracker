# Ledger — AI Expense Tracker

Full-stack expense tracker: MERN app + a Python ML microservice for
auto-categorizing transactions and forecasting next month's spend.

```
expense-tracker/
├── backend/       Express + MongoDB API (auth, expenses, aggregation)
├── ml-service/    FastAPI service (categorization model + spend prediction)
└── frontend/      React + Vite dashboard
```

## How it fits together

```
React (5173) → Express API (5000) → MongoDB
                     │
                     └──→ FastAPI ML service (8000)
```

The Node backend is the only thing the frontend talks to. It proxies
`/categorize` and `/predict` calls to the Python service and degrades
gracefully (manual categorization still works) if that service isn't running.
So you can run just backend + frontend first, confirm the CRUD app works,
then bring up the ML service afterwards.

## 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI if not using local default, set a real JWT_SECRET
npm install
npm run dev                # http://localhost:5000
```

Needs a running MongoDB — either install it locally or use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its
connection string into `MONGO_URI`.

## 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Register an account, then in a real app you'd add a settings screen to set
`monthlyBudget` — for now you can set it via a quick API call:

```bash
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your token>" \
  -H "Content-Type: application/json" \
  -d '{"monthlyBudget": 20000}'
```

(Grab `<your token>` from `localStorage.getItem("token")` in the browser console
after logging in.)

## 3. ML service (categorization + prediction)

Works out of the box with a keyword-based fallback categorizer — no dataset
needed to try it. For the real trained model:

```bash
cd ml-service
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
```

Then download the dataset (**manual step, Kaggle needs a login**):

1. https://www.kaggle.com/datasets/prasad22/daily-transactions-dataset
2. Download → unzip → copy the CSV to `ml-service/data/transactions.csv`
3. `python train.py` — trains and saves `model/categorizer.pkl`

Run the service:

```bash
uvicorn app:app --reload --port 8000
```

Once running, the Ledger page's note field will auto-suggest categories as
you type, and the Overview page will show a real ML-forecasted next month
instead of a flat estimate.

## Running everything in Docker

**Note:** this section is for local development/testing. For deploying to
production as separate hosted services (Render, Vercel, Atlas, etc.) instead
of one compose stack, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

This spins up all four pieces — MongoDB, the Express API, the FastAPI ML
service, and the React app served by nginx — with one command.

```bash
cp .env.example .env        # set a real JWT_SECRET
docker compose up --build
```

Then open **http://localhost:8080** — that's the whole app.

What's running and why each port is exposed:

| Service     | Container port | Host port | Why exposed on host                          |
|-------------|-----------------|-----------|-----------------------------------------------|
| frontend    | 80 (nginx)      | 8080      | This is the app — open it in your browser     |
| backend     | 5000            | 5000      | Optional, for hitting the API directly/curl   |
| ml-service  | 8000            | 8000      | Optional, for testing `/categorize` directly  |
| mongo       | 27017           | 27017     | Optional, for connecting MongoDB Compass      |

The frontend container never calls `backend:5000` or `ml-service:8000`
directly from the browser — those hostnames only resolve *inside* the
Docker network. Instead, nginx inside the frontend container proxies any
`/api/...` request to `http://backend:5000/...` server-side (see
`frontend/nginx.conf`), so the browser only ever talks to `localhost:8080`.
That also means there's no CORS to configure — same origin the whole way.

**Training the ML model inside Docker:** the compose file mounts
`ml-service/data` and `ml-service/model` from your host into the container,
so you don't need to rebuild the image to train it:

```bash
# after downloading transactions.csv into ml-service/data/ (see ml-service/data/README.md)
docker compose exec ml-service python train.py
docker compose restart ml-service   # picks up the new model on startup
```

**Useful commands:**

```bash
docker compose up --build     # rebuild images after changing code, then start
docker compose up -d          # start in the background
docker compose logs -f backend    # tail logs for one service
docker compose down           # stop everything
docker compose down -v        # stop everything AND wipe the Mongo volume (fresh DB)
```

**Note:** I don't have Docker available in the sandbox I built this in, so
I wrote and reasoned through these Dockerfiles/compose file carefully but
couldn't actually run `docker compose up` to verify it end-to-end. The
individual pieces (backend, ml-service, frontend) were tested and work; if
something's off in the Docker wiring specifically, tell me the error and
I'll fix it fast.

## What "God-level" actually means here

Being upfront about scope: this is a strong, resume-worthy full-stack + ML
project — real auth, real aggregation pipelines, a genuine trained
classifier with a graceful fallback, and a forecast model — but it's not
infinite. Things intentionally left out that you could add to go further:
recurring transactions, multi-currency support, shared/family accounts,
push notifications on budget overrun, a proper settings UI instead of the
curl command above, and Docker Compose to run all three services with one
command. Happy to build any of those next if you want to extend it.
