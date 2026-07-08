"""Central, typed configuration loaded from the environment.

Every tunable lives here so nothing is hardcoded across the codebase. Values are
read once at import time from environment variables (and an optional .env file).
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(ROOT_DIR / ".env", ROOT_DIR / "backend" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App -----------------------------------------------------------------
    app_name: str = "Hush-Hush-Recruiter API"
    app_env: str = "development"
    api_prefix: str = "/api"

    # Comma-separated list of allowed CORS origins (the two frontends).
    cors_origins: str = "http://localhost:5173,http://localhost:5174"

    # --- Database ------------------------------------------------------------
    # SQLite by default; point at Postgres in production via DATABASE_URL.
    database_url: str = f"sqlite:///{(DATA_DIR / 'hush.db').as_posix()}"

    # --- Auth ----------------------------------------------------------------
    # "demo"     -> trust decoded (unverified) tokens / X-Demo-Email header.
    #               Convenient for local dev; NEVER use in production.
    # "firebase" -> verify Firebase ID tokens with the Admin SDK.
    auth_mode: str = "demo"
    firebase_project_id: str = ""
    # Path to a Firebase service-account JSON (only needed for auth_mode=firebase).
    firebase_credentials_file: str = ""
    # Whoever is in this list is treated as an admin/recruiter.
    admin_emails: str = "admin@doodle.com"
    # Optional shared secret that gates ADMIN access in demo mode. Leave empty
    # for frictionless local dev / Codespaces. SET IT for any PUBLIC demo deploy
    # so that not just anyone can claim admin via an X-Demo-Email header.
    demo_admin_token: str = ""

    # --- Pipeline ------------------------------------------------------------
    # "demo" -> use bundled sample data (no network, no cold emails).
    # "live" -> actually query the GitHub REST API.
    pipeline_mode: str = "demo"
    github_token: str = ""
    github_since: int = 8000
    github_pages: int = 3
    github_max_users: int = 60

    # Selection: shortlist the top N by transparent score (see services/scoring.py).
    shortlist_size: int = 15
    score_threshold: float = 0.0  # also require score >= this (0 disables)

    # Autopilot: if > 0, run the pipeline automatically every N minutes.
    autopilot_interval_minutes: int = 0

    # --- Email ---------------------------------------------------------------
    # "console" -> log the email instead of sending (safe default).
    # "smtp"    -> actually send via SMTP.
    email_mode: str = "console"
    # Outreach is blocked unless explicitly enabled, and never sent to a
    # candidate who declined consent.
    allow_outreach: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    email_sender: str = "no.reply.doodlerecruiter@gmail.com"
    email_password: str = ""
    apply_url: str = "http://localhost:5174"

    @property
    def admin_email_set(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails.split(",") if e.strip()}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def role_for(self, email: str | None) -> str:
        if email and email.strip().lower() in self.admin_email_set:
            return "admin"
        return "candidate"


@lru_cache
def get_settings() -> Settings:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return Settings()


settings = get_settings()
