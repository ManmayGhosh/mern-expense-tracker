# Deployment Guide — one service at a time

This deploys the four pieces independently, each to the platform it fits
best. No docker-compose involved here — that file is for local dev only.

Deploy in this order (each step needs the URL from the one before it):

1. **MongoDB Atlas** — the database
2. **ML service** (FastAPI) — Render
3. **Backend** (Express) — Render or Railway
4. **Frontend** (React) — Vercel

---

## 1. MongoDB Atlas

1. Go to https://cloud.mongodb.com → sign up (free)
2. Create a cluster → pick the **free M0 tier**
3. **Database Access** → add a database user (username + password — save these)
4. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — fine for a
   project like this; for something real you'd restrict this to your
   backend host's IP)
5. **Connect** → "Drivers" → copy the connection string, it looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```
   Fill in your actual username/password and keep `/expense_tracker` as the
   database name.

Keep this string — it's your `MONGO_URI`.

---

## 2. ML service → Render

1. Push your repo to GitHub if you haven't already
2. https://render.com → **New +** → **Web Service** → connect your repo
3. Settings:
   - **Root Directory:** `ml-service`
   - **Runtime:** Docker (it'll pick up `ml-service/Dockerfile` automatically)
   - **Instance type:** Free is fine to start

### Getting the trained model onto Render

Render's filesystem is ephemeral — anything not in your repo or produced at
build time disappears on every redeploy. Two options:

**Option A — train at build time (recommended):** commit the dataset CSV to
your repo (it's small, a few hundred KB) so Render can retrain fresh on
every deploy:

```bash
git add -f ml-service/data/transactions.csv   # -f because it's gitignored by default
```

Then in Render, set:
- **Build Command:** `pip install -r requirements.txt && python train.py`
- **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

**Option B — commit the trained model directly:** if you'd rather not ship
the raw dataset, train locally, then commit just the `.pkl`:

```bash
git add -f ml-service/model/categorizer.pkl
```

Build Command stays `pip install -r requirements.txt`, no retraining needed.

Either way, once deployed, note the public URL Render gives you, e.g.
`https://ledger-ml.onrender.com`. Test it:

```bash
curl https://ledger-ml.onrender.com/health
```

Should return `{"status":"ok","model_loaded":true}`.

**Free tier heads-up:** Render's free web services spin down after 15
minutes of inactivity and take ~30-60s to wake back up on the next request.
The backend's categorize/predict proxy already has a 3-second timeout and
degrades gracefully, so a cold ML service won't crash anything — but the
first auto-categorize after idle time may just silently not apply (falls
back to manual). Fine for a demo/portfolio project; for always-on behavior
you'd need a paid instance.

---

## 3. Backend → Render (or Railway)

1. **New +** → **Web Service** → same repo
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node (or Docker — either works, `backend/Dockerfile` exists too)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. **Environment variables:**
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string from step 1 |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ML_SERVICE_URL` | your Render ML service URL from step 2 (no trailing slash) |
   | `CLIENT_URL` | leave blank for now — you'll add this after step 4 |
   | `PORT` | Render sets this automatically, don't set it yourself |

Deploy, then test:

```bash
curl https://ledger-api.onrender.com/api/health
```

Should return `{"status":"ok"}`.

---

## 4. Frontend → Vercel

1. https://vercel.com → **Add New** → **Project** → import your repo
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (should auto-detect)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment variable:**
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://ledger-api.onrender.com/api` (your backend URL from step 3, with `/api`) |

Deploy. You'll get a URL like `https://ledger-xyz.vercel.app`.

---

## 5. Close the loop — CORS

Now go back to your **backend's** environment variables on Render and set:

```
CLIENT_URL=https://ledger-xyz.vercel.app
```

(your actual Vercel URL, no trailing slash) and redeploy the backend. This
is what makes `cors()` in `server.js` accept requests from your live
frontend instead of rejecting them.

---

## Sanity checklist after deploying all four

- [ ] `curl https://<ml-service-url>/health` → `model_loaded: true`
- [ ] `curl https://<backend-url>/api/health` → `{"status":"ok"}`
- [ ] Open the Vercel frontend URL, register an account
- [ ] Add an expense with a note like "swiggy dinner" — category auto-suggests
- [ ] Overview page charts populate

If step 3 (register) fails with a network error, it's almost always the
`CLIENT_URL` / CORS step above, or `VITE_API_URL` missing the `/api` suffix.
