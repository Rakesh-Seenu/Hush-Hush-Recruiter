"""Database models."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# Candidate lifecycle stages (transparent, ordered).
STAGES = ("sourced", "shortlisted", "contacted", "responded", "rejected")
CONSENT_STATES = ("pending", "granted", "declined")
EMAIL_STATES = ("not_sent", "sent", "failed")


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(400), nullable=True)

    source: Mapped[str] = mapped_column(String(40), default="github")
    followers: Mapped[int] = mapped_column(Integer, default=0)
    public_repos: Mapped[int] = mapped_column(Integer, default=0)
    public_gists: Mapped[int] = mapped_column(Integer, default=0)
    languages: Mapped[str] = mapped_column(Text, default="")
    language_count: Mapped[int] = mapped_column(Integer, default=0)

    # Transparent 0-100 score (see services/scoring.py). Not a KMeans cluster id.
    score: Mapped[float] = mapped_column(Float, default=0.0)

    stage: Mapped[str] = mapped_column(String(20), default="sourced")
    consent_status: Mapped[str] = mapped_column(String(20), default="pending")
    email_status: Mapped[str] = mapped_column(String(20), default="not_sent")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="running")  # running|completed|failed
    mode: Mapped[str] = mapped_column(String(20), default="demo")
    triggered_by: Mapped[str] = mapped_column(String(200), default="system")
    sourced_count: Mapped[int] = mapped_column(Integer, default=0)
    shortlisted_count: Mapped[int] = mapped_column(Integer, default=0)
    message: Mapped[str] = mapped_column(Text, default="")

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
