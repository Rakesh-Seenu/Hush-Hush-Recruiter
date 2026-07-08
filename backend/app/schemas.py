"""Pydantic request/response schemas (the API contract)."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class CandidateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str | None
    email: str | None
    avatar_url: str | None
    source: str
    followers: int
    public_repos: int
    public_gists: int
    languages: str
    language_count: int
    score: float
    stage: str
    consent_status: str
    email_status: str
    created_at: datetime
    updated_at: datetime


class CandidateList(BaseModel):
    candidates: list[CandidateOut]
    total: int


class ActionResult(BaseModel):
    success: bool
    message: str


class ConsentUpdate(BaseModel):
    status: Literal["granted", "declined", "pending"]


class PipelineRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    mode: str
    triggered_by: str
    sourced_count: int
    shortlisted_count: int
    message: str
    started_at: datetime
    finished_at: datetime | None


class PipelineTrigger(BaseModel):
    mode: Literal["demo", "live"] | None = None


class MeOut(BaseModel):
    email: str
    role: str


class MetricsOut(BaseModel):
    total: int
    shortlisted: int
    contacted: int
    consent_granted: int
    emails_sent: int
    last_run: PipelineRunOut | None
