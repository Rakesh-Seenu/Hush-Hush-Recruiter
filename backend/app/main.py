"""FastAPI application entrypoint."""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from . import __version__
from .config import settings
from .db import SessionLocal, init_db
from .models import Candidate
from .routers import candidates, me, pipeline
from .services import pipeline as pipeline_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("hush")


def _seed_if_empty() -> None:
    with SessionLocal() as db:
        count = db.scalar(select(func.count()).select_from(Candidate)) or 0
    if count == 0:
        logger.info("Empty database -> running an initial demo pipeline pass to seed data.")
        try:
            pipeline_service.run_pipeline(triggered_by="seed", mode="demo")
        except RuntimeError:
            pass


async def _autopilot() -> None:
    interval = settings.autopilot_interval_minutes
    logger.info("Autopilot enabled: running the pipeline every %s minute(s).", interval)
    while True:
        await asyncio.sleep(interval * 60)
        try:
            await asyncio.to_thread(
                pipeline_service.run_pipeline, triggered_by="autopilot", mode=settings.pipeline_mode
            )
        except RuntimeError as exc:
            logger.warning("Autopilot skipped a cycle: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _seed_if_empty()
    task: asyncio.Task | None = None
    if settings.autopilot_interval_minutes > 0:
        task = asyncio.create_task(_autopilot())
    try:
        yield
    finally:
        if task:
            task.cancel()


app = FastAPI(
    title=settings.app_name,
    version=__version__,
    description="Consent-aware, transparently-scored recruiting pipeline.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(me.router, prefix=settings.api_prefix)
app.include_router(candidates.router, prefix=settings.api_prefix)
app.include_router(pipeline.router, prefix=settings.api_prefix)


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "version": __version__,
        "auth_mode": settings.auth_mode,
        "pipeline_mode": settings.pipeline_mode,
        "email_mode": settings.email_mode,
    }
