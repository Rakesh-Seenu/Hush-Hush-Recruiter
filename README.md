# Hush-Hush-Recruiter

A consent-aware, transparently-scored recruiting pipeline with **two frontends**:

- **Recruiter Console** (`apps/admin`) — run & monitor the autonomous pipeline, review ranked candidates, send consent-gated outreach.
- **Candidate Portal** (`apps/candidate`) — every candidate sees exactly what data is held about them, their status in the funnel, and can grant or withdraw consent at any time.

Both are React + TypeScript (Vite) apps sharing one design system, talking to a **FastAPI** backend.

> **v2 rebuild.** This replaces the original prototype (raw `http.server`, unenforced auth, arbitrary KMeans cluster selection, unsolicited cold emails). See [What changed](#what-changed-from-v1).

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Recruiter      │     │  Candidate       │     apps/admin  (Vite+TS, :5173)
│  Console :5173  │     │  Portal :5174    │     apps/candidate (Vite+TS, :5174)
└────────┬────────┘     └────────┬─────────┘     packages/shared (design system,
         │      @hush/shared      │                                API client, auth)
         └───────────┬────────────┘
                     ▼
          ┌──────────────────────┐
          │  FastAPI  :8000       │   backend/app
          │  auth · roles · CORS  │   • Firebase/demo auth, roles enforced server-side
          │  pipeline · scoring   │   • source → score → shortlist (autonomous)
          │  SQLite (SQLAlchemy)  │   • consent-aware, safe-by-default outreach
          └──────────────────────┘
```

## Quick start

### Option A — Docker (one command)

```bash
cp .env.example .env      # optional; safe demo defaults work as-is
docker compose up
```

- API → http://localhost:8000 (interactive docs at `/docs`)
- Recruiter Console → http://localhost:5173
- Candidate Portal → http://localhost:5174

### Option B — Local dev

Prereqs: Node 18+, Python 3.10+.

```bash
# 1. Backend
cd backend
python -m venv .venv && . .venv/Scripts/activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. Frontends (from repo root, in another terminal)
npm install
npm run dev            # starts BOTH apps (admin :5173, candidate :5174)
# or individually: npm run dev:admin / npm run dev:candidate
```

## Run in the cloud — no local tools, no admin rights

Don't have Docker/Node/Python locally? Run the whole thing in the browser.

### Option C — GitHub Codespaces (recommended, fastest)

A full dev environment in your browser. Nothing installed on your machine.

1. Push this branch to GitHub (done).
2. On the repo page: **Code ▸ Codespaces ▸ Create codespace** on `rebuild/modern-pipeline-v2`.
3. Wait for it to build (installs Node deps + Python deps automatically via `.devcontainer/`).
4. In the terminal: `bash scripts/dev-all.sh` — starts the backend + both frontends.
5. Open the **Ports** tab and click the 🌐 on **5173** (admin) and **5174** (candidate).

Each frontend calls the backend **same-origin** through the Vite `/api` proxy, so it works despite Codespaces' forwarded-origin URLs. Keep forwarded ports **Private** (the default).

### Option D — Deploy to public URLs (Render + Vercel/Netlify)

All free tiers. **Deploy the backend first** — the frontends bake the backend URL in at build time.

1. **Backend → Render.** Dashboard ▸ **New + ▸ Blueprint**, pick this repo. It reads [`render.yaml`](render.yaml). When prompted, set `DEMO_ADMIN_TOKEN` (any strong random string) and a temporary `CORS_ORIGINS`. Copy the service URL, e.g. `https://hush-backend.onrender.com`, and check `…/api/health`.
2. **Frontends → Vercel or Netlify.** Import the repo **twice** (once per app):
   - Vercel: set **Root Directory** to `apps/admin` (then again `apps/candidate`); [`vercel.json`](apps/admin/vercel.json) handles the rest.
   - Netlify: set **Package directory** to `apps/admin` (then `apps/candidate`), leave Base directory blank; [`netlify.toml`](apps/admin/netlify.toml) handles the rest.
   - For **both**, add env var `VITE_API_BASE_URL` = your Render URL (no trailing slash) and `VITE_AUTH_MODE=demo`.
3. **Wire CORS.** Back in Render, set `CORS_ORIGINS` to the two deployed frontend origins (comma-separated, no trailing slash). It redeploys.
4. Changing `VITE_API_BASE_URL` later? Rebuild the frontends (it's baked in at build time).

> ⚠️ **Security — public demo auth.** In `AUTH_MODE=demo` the backend trusts the sign-in header, so **on a public URL anyone could claim admin**. Mitigations already wired in: the demo uses only **synthetic data**, `EMAIL_MODE=console` (nothing is actually sent), outreach is off, and **`DEMO_ADMIN_TOKEN`** locks admin behind a secret you type as the password. For anything with real data, switch to `AUTH_MODE=firebase` (see [Enabling real Firebase auth](#enabling-real-firebase-auth)).

## Demo accounts

The app ships in **demo mode** — no Firebase, no external calls, no real emails. On first boot the backend seeds ~18 sample candidates by running the pipeline once.

| Portal            | Sign in as             | Password    |
| ----------------- | ---------------------- | ----------- |
| Recruiter Console | `admin@doodle.com`     | any value   |
| Candidate Portal  | `candidate@doodle.com` | any value   |

Roles are decided **on the backend** from `ADMIN_EMAILS` — the browser can't grant itself admin. (On a public deploy where `DEMO_ADMIN_TOKEN` is set, the admin **password must equal that token**; candidates still use any password.)

## The pipeline

`source → score → shortlist`, triggered from the console (or on a timer via `AUTOPILOT_INTERVAL_MINUTES`).

- **Source** — bundled sample profiles (`PIPELINE_MODE=demo`) or the live GitHub API (`PIPELINE_MODE=live`, set `GITHUB_TOKEN`).
- **Score** — a transparent, explainable 0–100 blend of normalized signals (weights are shown in the UI and served from `/api/scoring/weights`):

  | Signal          | Weight |
  | --------------- | ------ |
  | followers       | 30%    |
  | public repos    | 30%    |
  | language breadth| 25%    |
  | public gists    | 15%    |

  Counts are log-compressed then min-max normalized across the batch — no arbitrary KMeans cluster ids.
- **Shortlist** — top `SHORTLIST_SIZE` above `SCORE_THRESHOLD` move to the `shortlisted` stage.

## Consent & outreach (safe by default)

- A candidate who **declines** is never emailed.
- Outreach is blocked unless `ALLOW_OUTREACH=true`.
- `EMAIL_MODE=console` (default) logs emails instead of sending. Only `EMAIL_MODE=smtp` + valid creds sends for real.
- Candidates manage their own consent from the portal.

## Configuration

Everything is env-driven — see [`.env.example`](.env.example). Key toggles: `AUTH_MODE`, `PIPELINE_MODE`, `EMAIL_MODE`, `ALLOW_OUTREACH`, `ADMIN_EMAILS`, `AUTOPILOT_INTERVAL_MINUTES`.

### Enabling real Firebase auth

```bash
pip install -r backend/requirements-firebase.txt
# backend: AUTH_MODE=firebase, FIREBASE_PROJECT_ID=..., FIREBASE_CREDENTIALS_FILE=...
# frontend: VITE_AUTH_MODE=firebase, VITE_FIREBASE_* (see .env.example)
```

The frontend obtains a Firebase ID token; the backend verifies it with the Admin SDK and derives the role.

## Testing

```bash
cd backend && pip install -r requirements.txt && pytest        # backend (11 tests)
npm run typecheck                                              # both frontends (strict TS)
npm run build                                                  # production builds
```

## Project structure

```
backend/
  app/
    main.py            # FastAPI app, CORS, lifespan, autopilot, seeding
    config.py          # typed settings (all env-driven)
    auth.py            # Firebase/demo auth + server-side role enforcement
    db.py  models.py  schemas.py
    routers/           # me, candidates, pipeline
    services/          # github (source), scoring, emailer, pipeline, sample_data
  tests/               # pytest
packages/shared/       # @hush/shared — design system, typed API client, auth context
apps/admin/            # Recruiter Console (Vite + React + TS + Tailwind)
apps/candidate/        # Candidate Portal (Vite + React + TS + Tailwind)
docker-compose.yml
```

## What changed from v1

| v1 (prototype)                                   | v2 (this)                                            |
| ------------------------------------------------ | ---------------------------------------------------- |
| Raw `http.server`, hand-rolled routing           | FastAPI — validation, async, OpenAPI docs            |
| No API auth; admin role baked into the JS bundle | Roles enforced server-side on every protected route  |
| `ProtectedRoute` role gate silently disabled     | Gating verified by tests (401/403)                   |
| KMeans `cluster in [2,3]` (arbitrary)            | Transparent, explainable 0–100 score                 |
| Cold-emails scraped users; missing emails → a random Gmail | Consent-aware; safe demo mode; outreach off by default |
| CRA + react-router v5, unused Redux/webcam deps  | Vite + React 18 + TS + react-router v6, lean deps    |
| `Database.db` & `kmeans_model.pkl` committed     | Data/models gitignored                               |
| Single mixed app                                 | Two focused frontends + shared design system         |
