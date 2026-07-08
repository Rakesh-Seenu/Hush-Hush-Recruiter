"""The autonomous recruiting pipeline: source -> score -> shortlist.

Idempotent and safe to re-run. Candidates are upserted by username, the whole
batch is re-scored together (scoring is relative), and the top N are moved to the
``shortlisted`` stage. Nothing here sends email - outreach is a separate,
consent-gated, admin-triggered action.

Runs synchronously (used by tests and the scheduler) or in the background via
FastAPI. A module-level lock prevents overlapping runs.
"""
from __future__ import annotations

import logging
import threading

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..db import SessionLocal
from ..models import Candidate, PipelineRun
from . import github
from .scoring import ScorableCandidate, score_batch

logger = logging.getLogger("hush.pipeline")

_run_lock = threading.Lock()


def is_running() -> bool:
    return _run_lock.locked()


def _upsert(db: Session, sourced: list[dict]) -> list[Candidate]:
    candidates: list[Candidate] = []
    for row in sourced:
        existing = db.scalar(select(Candidate).where(Candidate.username == row["username"]))
        if existing is None:
            existing = Candidate(username=row["username"], stage="sourced")
            db.add(existing)
        # Refresh sourced signals but never clobber consent/stage decisions.
        existing.name = row.get("name")
        existing.email = row.get("email") or existing.email
        existing.avatar_url = row.get("avatar_url")
        existing.source = row.get("source", "github")
        existing.followers = row["followers"]
        existing.public_repos = row["public_repos"]
        existing.public_gists = row["public_gists"]
        existing.languages = row["languages"]
        existing.language_count = row["language_count"]
        candidates.append(existing)
    db.flush()
    return candidates


def _apply_scores_and_shortlist(db: Session, candidates: list[Candidate]) -> int:
    scores = score_batch(
        [
            ScorableCandidate(
                username=c.username,
                followers=c.followers,
                public_repos=c.public_repos,
                public_gists=c.public_gists,
                language_count=c.language_count,
            )
            for c in candidates
        ]
    )
    for c in candidates:
        c.score = scores.get(c.username, 0.0)

    ranked = sorted(candidates, key=lambda c: c.score, reverse=True)
    shortlisted = 0
    for rank, c in enumerate(ranked):
        qualifies = rank < settings.shortlist_size and c.score >= settings.score_threshold
        if qualifies:
            shortlisted += 1
            # Don't demote someone already further along the funnel.
            if c.stage in ("sourced", "shortlisted"):
                c.stage = "shortlisted"
        elif c.stage == "shortlisted":
            c.stage = "sourced"
    return shortlisted


def run_pipeline(*, triggered_by: str = "system", mode: str | None = None) -> PipelineRun:
    """Run one full pipeline pass. Returns the persisted PipelineRun record."""
    mode = mode or settings.pipeline_mode
    if not _run_lock.acquire(blocking=False):
        raise RuntimeError("A pipeline run is already in progress.")

    db = SessionLocal()
    run = PipelineRun(status="running", mode=mode, triggered_by=triggered_by)
    db.add(run)
    db.commit()
    db.refresh(run)

    try:
        sourced = github.source_candidates(mode)
        candidates = _upsert(db, sourced)
        shortlisted = _apply_scores_and_shortlist(db, candidates)

        run.status = "completed"
        run.sourced_count = len(sourced)
        run.shortlisted_count = shortlisted
        run.message = f"Sourced {len(sourced)}, shortlisted {shortlisted} (mode={mode})."
        from datetime import datetime, timezone

        run.finished_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(run)
        logger.info(run.message)
        return run
    except Exception as exc:
        logger.exception("Pipeline run failed")
        run.status = "failed"
        run.message = f"Pipeline failed: {exc}"
        from datetime import datetime, timezone

        run.finished_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(run)
        return run
    finally:
        db.close()
        _run_lock.release()


def latest_run(db: Session) -> PipelineRun | None:
    return db.scalar(select(PipelineRun).order_by(PipelineRun.id.desc()).limit(1))
