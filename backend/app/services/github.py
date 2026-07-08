"""Candidate sourcing.

Two sources behind one interface:

* demo (default) - deterministic, bundled sample profiles. No network, no PII,
  safe to run anywhere, and what CI uses.
* live           - the real GitHub REST API (requires GITHUB_TOKEN for a usable
  rate limit).

Returns plain dicts; the pipeline is responsible for persistence and scoring.
"""
from __future__ import annotations

import logging

import httpx

from ..config import settings
from .sample_data import SAMPLE_PROFILES

logger = logging.getLogger("hush.github")


def _language_count(languages: str) -> int:
    return len([x for x in languages.split(",") if x.strip()])


def _normalize(raw: dict) -> dict:
    languages = raw.get("languages", "")
    return {
        "username": raw["username"],
        "name": raw.get("name"),
        "email": raw.get("email"),
        "avatar_url": raw.get("avatar_url"),
        "source": "github",
        "followers": int(raw.get("followers") or 0),
        "public_repos": int(raw.get("public_repos") or 0),
        "public_gists": int(raw.get("public_gists") or 0),
        "languages": languages,
        "language_count": _language_count(languages),
    }


def _fetch_demo() -> list[dict]:
    return [_normalize(p) for p in SAMPLE_PROFILES]


def _fetch_live() -> list[dict]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Hush-Hush-Recruiter",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    else:
        logger.warning("No GITHUB_TOKEN set; live sourcing will hit tight rate limits.")

    logins: list[str] = []
    with httpx.Client(headers=headers, timeout=30.0) as client:
        since = settings.github_since
        for _ in range(settings.github_pages):
            resp = client.get(
                "https://api.github.com/users",
                params={"per_page": 100, "since": since},
            )
            resp.raise_for_status()
            batch = resp.json()
            if not batch:
                break
            logins.extend(u["login"] for u in batch)
            since = batch[-1]["id"]

        results: list[dict] = []
        for login in logins[: settings.github_max_users]:
            try:
                user = client.get(f"https://api.github.com/users/{login}")
                user.raise_for_status()
                u = user.json()

                repos = client.get(f"https://api.github.com/users/{login}/repos")
                repos.raise_for_status()
                languages = sorted({r["language"] for r in repos.json() if r.get("language")})

                results.append(
                    _normalize(
                        {
                            "username": u["login"],
                            "name": u.get("name"),
                            "email": u.get("email"),
                            "avatar_url": u.get("avatar_url"),
                            "followers": u.get("followers", 0),
                            "public_repos": u.get("public_repos", 0),
                            "public_gists": u.get("public_gists", 0),
                            "languages": ", ".join(languages),
                        }
                    )
                )
            except httpx.HTTPError as exc:
                logger.warning("Skipping %s: %s", login, exc)
    return results


def source_candidates(mode: str | None = None) -> list[dict]:
    mode = mode or settings.pipeline_mode
    if mode == "live":
        logger.info("Sourcing candidates from the live GitHub API.")
        return _fetch_live()
    logger.info("Sourcing candidates from bundled demo data.")
    return _fetch_demo()
