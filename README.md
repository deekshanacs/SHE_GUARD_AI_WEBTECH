# SHE-GUARD AI

AI-Powered Cyber Forensic Platform for Detecting Image Manipulation and Supporting Cybercrime Reporting.

**Live URLs (after Render deploy)**
- Frontend: https://sheguard-app.onrender.com
- Backend API: https://sheguard-api.onrender.com

---

## Project Structure

```
/                           ← React + TypeScript frontend
├── src/
│   ├── App.tsx             ← Route definitions
│   ├── main.tsx            ← React entry point
│   ├── index.css           ← Tailwind + custom CSS vars
│   ├── config.ts           ← API_BASE_URL (single source of truth)
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── UploadPage.tsx      ← Image analysis UI
│   │   ├── EvidenceReport.tsx  ← Status-conditional report
│   │   ├── DashboardPage.tsx   ← PIN-protected case history
│   │   ├── ReportPage.tsx      ← Victim incident form
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AnimatedBackground.tsx
│   │   ├── GlowCursor.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── utils.ts        ← cn() helper
│       └── mockApi.ts      ← Shared TypeScript interfaces
├── index.html
├── vite.config.ts          ← Dev proxy /api → localhost:7860
├── tailwind.config.ts
├── render.yaml             ← Render Blueprint (one-click deploy)
├── .env.example
└── backend/
    ├── main.py             ← FastAPI app (CORS, rate limit, routes)
    ├── database.py         ← SQLAlchemy + Postgres/SQLite switching
    ├── models.py           ← ORM models
    ├── forensics.py        ← ELA, Noise, EXIF, Face analysis engine
    └── requirements.txt
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- (Optional) PostgreSQL — SQLite is used automatically if DATABASE_URL is not set

### Frontend
```bash
npm install
npm run dev
# Runs on http://localhost:8080
# /api/* is proxied to http://localhost:7860 automatically
```

### Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 7860
# API runs on http://localhost:7860
# Swagger docs at http://localhost:7860/docs
```

No `.env` file is needed for local development.
SQLite is used automatically — a `sheguard.db` file is created in `backend/`.

---

## Deploy to Render (Recommended: Blueprint)

### One-click deploy
1. Push this entire repo to GitHub.
2. Go to https://dashboard.render.com → **New** → **Blueprint**.
3. Connect your GitHub repo.
4. Render reads `render.yaml` and creates 3 resources automatically:
   - `sheguard-api` — Python web service (backend)
   - `sheguard-app` — React static site (frontend)
   - `sheguard-db`  — Postgres 15 database
5. Click **Apply**. Wait ~5 minutes for first build.

### After deploy — set DASHBOARD_PIN
Render auto-generates a random `DASHBOARD_PIN` (see `render.yaml`).
To use a specific PIN:
1. Dashboard → `sheguard-api` → **Environment** → edit `DASHBOARD_PIN`.
2. Click **Save Changes** → **Manual Deploy**.

---

## Deploy to Render (Manual Steps)

### Step 1 — Create Postgres database
1. Render Dashboard → **New → PostgreSQL**
2. Name: `sheguard-db`, Plan: Free, Region: Oregon
3. Copy the **Internal Database URL**

### Step 2 — Deploy backend
1. **New → Web Service** → connect repo
2. Settings:
   | Field | Value |
   |---|---|
   | Name | `sheguard-api` |
   | Root directory | `backend` |
   | Runtime | Python 3 |
   | Build command | `pip install -r requirements.txt && pip install -e forensic_ai \|\| true` |
   | Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | Plan | Free |
3. Environment variables:
   | Key | Value |
   |---|---|
   | `ALLOWED_ORIGINS` | `https://sheguard-app.onrender.com` |
   | `DATABASE_URL` | *(paste Internal DB URL from Step 1)* |
   | `DASHBOARD_PIN` | *(choose a strong PIN)* |

### Step 3 — Deploy frontend
1. **New → Static Site** → connect same repo
2. Settings:
   | Field | Value |
   |---|---|
   | Name | `sheguard-app` |
   | Root directory | *(leave blank)* |
   | Build command | `npm install && npm run build` |
   | Publish dir | `dist` |
3. Environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://sheguard-api.onrender.com` |
4. Redirects/Rewrites (add in order):
   | Source | Destination | Type |
   |---|---|---|
   | `/api/*` | `https://sheguard-api.onrender.com/api/*` | Rewrite |
   | `/*` | `/index.html` | Rewrite |

---

## How Frontend ↔ Backend Connectivity Works

```
Browser
  ↓  fetch(`${API_BASE_URL}/api/analyze`)
     In dev:  API_BASE_URL = "" → Vite proxy → localhost:7860
     In prod: API_BASE_URL = "https://sheguard-api.onrender.com"

Render CDN (sheguard-app.onrender.com)
  ↓  Rewrite rule: /api/* → https://sheguard-api.onrender.com/api/*

FastAPI (sheguard-api.onrender.com)
  ↓  CORS: only allows requests from sheguard-app.onrender.com
  ↓  Returns JSON

Browser renders results ✓
```

**Key rule**: Never hard-code `https://sheguard-api.onrender.com` in any `.tsx` file.
Always use `import { API_BASE_URL } from "@/config"`.

---

## Common Problems

| Symptom | Cause | Fix |
|---|---|---|
| "Analysis Server Offline" on Render | `VITE_API_BASE_URL` not set | Add env var to static site, redeploy |
| CORS error in browser console | `ALLOWED_ORIGINS` wrong | Update env var on backend, redeploy |
| DB connection error on startup | `DATABASE_URL` missing or `postgres://` prefix | `database.py` auto-fixes prefix; check env var is set |
| First request takes 30s | Free tier cold start | Normal — service sleeps after 15min idle |
| `pip install -e forensic_ai` fails | No checkpoints | `\|\| true` in build command ignores this — classical pipeline used |
