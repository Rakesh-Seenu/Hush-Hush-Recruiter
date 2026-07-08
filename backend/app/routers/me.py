"""Endpoints for the currently authenticated user (used by both portals)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import CurrentUser, get_current_user
from ..db import get_db
from ..models import Candidate
from ..schemas import CandidateOut, ConsentUpdate, MeOut

router = APIRouter(tags=["me"])


@router.get("/me", response_model=MeOut)
def whoami(user: CurrentUser = Depends(get_current_user)) -> MeOut:
    return MeOut(email=user.email, role=user.role)


def _find_own_candidate(db: Session, user: CurrentUser) -> Candidate:
    candidate = db.scalar(select(Candidate).where(Candidate.email == user.email))
    if candidate is None:
        raise HTTPException(status_code=404, detail="No candidate profile linked to your account.")
    return candidate


@router.get("/me/candidate", response_model=CandidateOut)
def my_candidate(
    user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> Candidate:
    return _find_own_candidate(db, user)


@router.post("/me/consent", response_model=CandidateOut)
def update_my_consent(
    payload: ConsentUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Candidate:
    candidate = _find_own_candidate(db, user)
    candidate.consent_status = payload.status
    db.commit()
    db.refresh(candidate)
    return candidate
