"""Test configuration. Sets a throwaway SQLite DB and demo auth BEFORE the app
(and its cached settings) are imported."""
from __future__ import annotations

import os
import pathlib
import tempfile

os.environ.setdefault("AUTH_MODE", "demo")
os.environ.setdefault("ADMIN_EMAILS", "admin@doodle.com")
os.environ.setdefault("PIPELINE_MODE", "demo")
os.environ.setdefault("EMAIL_MODE", "console")
os.environ.setdefault("ALLOW_OUTREACH", "false")

_tmp = tempfile.mkdtemp(prefix="hush-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{pathlib.Path(_tmp, 'test.db').as_posix()}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:  # runs lifespan -> seeds demo data
        yield c


@pytest.fixture
def admin() -> dict[str, str]:
    return {"X-Demo-Email": "admin@doodle.com"}


@pytest.fixture
def candidate() -> dict[str, str]:
    return {"X-Demo-Email": "candidate@doodle.com"}
