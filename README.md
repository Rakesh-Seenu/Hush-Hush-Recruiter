# Hush-Hush-Recruiter

A privacy-first recruitment workflow demo with:
- Firebase login
- Separate admin and candidate dashboards
- Shortlisted candidate table for admins
- Per-candidate "Send Email" action for next round

## Architecture

- Frontend: React + React Router
- Auth: Firebase Authentication
- Backend API: Python HTTP server ([backend/api.py](backend/api.py))
- Storage: SQLite ([Database.db](Database.db))
- Mail: SMTP via environment variables

## Important Compliance Note

For Germany/EU compliance, do not scrape candidate data without consent.
This project now supports running with existing database data and consent-based flows.

## 1) Prerequisites

- Node.js 18+
- Python 3.10+
- A Firebase project with Email/Password sign-in enabled

## 2) Environment Setup

1. Copy [.env.example](.env.example) to `.env`.
2. Fill in Firebase values:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`
3. Set admin emails in `REACT_APP_ADMIN_EMAILS` (comma-separated).
4. Set mail credentials:
   - `DOODLE_EMAIL_SENDER`
   - `DOODLE_EMAIL_PASSWORD`

## 3) Install Dependencies

### Python

```bash
pip install -r requirements.txt
```

### Frontend

```bash
npm install
```

## 4) Start the Project

Run these in separate terminals from project root.

### One-command start

```bash
npm run dev
```

This launches the backend API and the React app together.

If you want to start them separately:

```bash
python -m backend.api
```

```bash
npm start
```

Frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:8000`.

## 5) How Login and Roles Work

- Any user can register/login with Firebase Email/Password.
- Role is derived from `REACT_APP_ADMIN_EMAILS`.
  - If user email is in that list -> admin dashboard (`/admin`)
  - Otherwise -> candidate dashboard (`/candidate`)

## 6) Admin Flow (Email Button)

1. Login with an admin email.
2. Open dashboard (`/admin`).
3. View matched candidates from SQLite.
4. Click **Send Email** for any candidate row.

Endpoints used:
- `GET /api/selected-candidates`
- `POST /api/selected-candidates/{username}/send-email`

## 7) Optional Pipeline Run

If you still want to run the old selection pipeline manually:

```bash
python -m backend.pipeline
```

This runs selection + insert + bulk send. It is no longer executed on import.

## 8) Troubleshooting

- `react-scripts is not recognized`
  - Run `npm install` again in project root.
- Login not working
  - Verify Firebase config values in `.env`.
  - Confirm Email/Password provider enabled in Firebase Console.
- Admin dashboard redirects to candidate dashboard
  - Add your login email to `REACT_APP_ADMIN_EMAILS`.
- Send Email fails
  - Verify `DOODLE_EMAIL_PASSWORD` and SMTP permissions.
