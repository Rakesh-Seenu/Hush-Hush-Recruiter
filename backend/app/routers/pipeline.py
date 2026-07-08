"""Admin endpoints to trigger and monitor the autonomous pipeline."""
from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from ..auth import CurrentUser, require_admin
from ..config import settings
from ..db import get_db
from ..schemas import ActionResult, PipelineTrigger
from ..services import pipeline as pipeline_service

logger = logging.getLogger("hush.pipeline.api")

router = APIRouter(tags=["pipeline"], prefix="/pipeline")


def _run(triggered_by: str, mode: str) -> None:
    try:
        pipeline_service.run_pipeline(triggered_by=triggered_by, mode=mode)
    except RuntimeError as exc:
        logger.warning("Pipeline trigger ignored: %s", exc)


@router.post("/run", response_model=ActionResult)
def trigger_pipeline(
    payload: PipelineTrigger,
    background: BackgroundTasks,
    user: CurrentUser = Depends(require_admin),
) -> ActionResult:
    if pipeline_service.is_running():
        return ActionResult(success=False, message="A pipeline run is already in progress.")
    mode = payload.mode or settings.pipeline_mode
    background.add_task(_run, user.email, mode)
    return ActionResult(success=True, message=f"Pipeline run started (mode={mode}).")


@router.get("/status")
def pipeline_status(
    db: Session = Depends(get_db), user: CurrentUser = Depends(require_admin)
) -> dict:
    run = pipeline_service.latest_run(db)
    return {
        "running": pipeline_service.is_running(),
        "mode": settings.pipeline_mode,
        "autopilot_interval_minutes": settings.autopilot_interval_minutes,
        "last_run": (
            {
                "id": run.id,
                "status": run.status,
                "mode": run.mode,
                "triggered_by": run.triggered_by,
                "sourced_count": run.sourced_count,
                "shortlisted_count": run.shortlisted_count,
                "message": run.message,
                "started_at": run.started_at.isoformat() if run.started_at else None,
                "finished_at": run.finished_at.isoformat() if run.finished_at else None,
            }
            if run
            else None
        ),
    }
