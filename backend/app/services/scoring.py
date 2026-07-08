"""Transparent candidate scoring.

The old pipeline ran KMeans and then hardcoded ``cluster in [2, 3]``. Cluster ids
are arbitrary and unstable across refits, so that "selection" was effectively
random and impossible to explain to a candidate or an auditor.

This replaces it with an explainable, deterministic 0-100 score: a weighted blend
of normalized signals. Weights live in one place and sum to 1.0. Counts are
log-compressed first so a handful of mega-accounts don't flatten everyone else,
then min-max normalized across the current batch.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

# Signal -> weight. Must sum to 1.0 (asserted below).
WEIGHTS: dict[str, float] = {
    "followers": 0.30,
    "public_repos": 0.30,
    "public_gists": 0.15,
    "language_count": 0.25,
}
assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9, "scoring weights must sum to 1.0"


@dataclass
class ScorableCandidate:
    username: str
    followers: int = 0
    public_repos: int = 0
    public_gists: int = 0
    language_count: int = 0


def _log_compress(value: float) -> float:
    return math.log1p(max(0.0, float(value)))


def _min_max(values: list[float]) -> list[float]:
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return [0.0 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]


def score_batch(candidates: list[ScorableCandidate]) -> dict[str, float]:
    """Return ``{username: score}`` where score is 0-100.

    Scoring is relative to the batch: normalization needs the full population, so
    always score all sourced candidates together.
    """
    if not candidates:
        return {}

    normalized: dict[str, list[float]] = {}
    for signal in WEIGHTS:
        raw = [_log_compress(getattr(c, signal)) for c in candidates]
        normalized[signal] = _min_max(raw)

    scores: dict[str, float] = {}
    for i, c in enumerate(candidates):
        blended = sum(WEIGHTS[signal] * normalized[signal][i] for signal in WEIGHTS)
        scores[c.username] = round(blended * 100.0, 2)
    return scores


def explain_weights() -> dict[str, float]:
    """Expose the weights so the UI can show *why* a candidate ranked where it did."""
    return dict(WEIGHTS)
