"""Admin/recruiter endpoints for reviewing and contacting candidates.

Every route here depends on :func:`require_admin`, so role enforcement lives on
the server, not in the browser.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import CurrentUser, require_admin
from ..db import get_db
from ..models import Candidate
from ..schemas import (
    ActionResult,
    CandidateList,
    CandidateOut,
    MetricsOut,
    PipelineRunOut,
)
from ..services.emailer import send_outreach
from ..services.pipeline import latest_run
from ..services.scoring import explain_weights

router = APIRouter(tags=["candidates"], dependencies=[Depends(require_admin)])


@router.get("/candidates", response_model=CandidateList)
def list_candidates(
    db: Session = Depends(get_db),
    stage: str | None = Query(default=None),
    min_score: float = Query(default=0.0, ge=0.0, le=100.0),
) -> CandidateList:
    stmt = select(Candidate).where(Candidate.score >= min_score)
    if stage:
        stmt = stmt.where(Candidate.stage == stage)
    stmt = stmt.order_by(Candidate.score.desc())
    rows = list(db.scalars(stmt))
    return CandidateList(candidates=rows, total=len(rows))


@router.get("/candidates/{username}", response_model=CandidateOut)
def get_candidate(username: str, db: Session = Depends(get_db)) -> Candidate:
    candidate = db.scalar(select(Candidate).where(Candidate.username == username))
    if candidate is None:
        raise HTTPException(status_code=404, detail=f"Candidate '{username}' not found.")
    return candidate


@router.post("/candidates/{username}/send-email", response_model=ActionResult)
def send_email(username: str, db: Session = Depends(get_db)) -> ActionResult:
    candidate = db.scalar(select(Candidate).where(Candidate.username == username))
    if candidate is None:
        raise HTTPException(status_code=404, detail=f"Candidate '{username}' not found.")

    outcome = send_outreach(
        recipient=candidate.email,
        name=candidate.name,
        consent_status=candidate.consent_status,
    )
    if outcome.success:
        candidate.email_status = "sent"
        if candidate.stage in ("sourced", "shortlisted"):
            candidate.stage = "contacted"
    else:
        candidate.email_status = "failed"
    db.commit()
    return ActionResult(success=outcome.success, message=outcome.message)


@router.get("/metrics", response_model=MetricsOut)
def metrics(db: Session = Depends(get_db)) -> MetricsOut:
    def count(*conds) -> int:
        stmt = select(func.count()).select_from(Candidate)
        for c in conds:
            stmt = stmt.where(c)
        return db.scalar(stmt) or 0

    run = latest_run(db)
    return MetricsOut(
        total=count(),
        shortlisted=count(Candidate.stage == "shortlisted"),
        contacted=count(Candidate.stage == "contacted"),
        consent_granted=count(Candidate.consent_status == "granted"),
        emails_sent=count(Candidate.email_status == "sent"),
        last_run=PipelineRunOut.model_validate(run) if run else None,
    )


@router.get("/scoring/weights")
def scoring_weights() -> dict[str, float]:
    return explain_weights()
