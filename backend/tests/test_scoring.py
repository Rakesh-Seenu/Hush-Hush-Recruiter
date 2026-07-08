from app.services.scoring import ScorableCandidate, WEIGHTS, score_batch


def test_weights_sum_to_one():
    assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


def test_scores_are_bounded_and_ranked():
    batch = [
        ScorableCandidate("weak", followers=1, public_repos=1, public_gists=0, language_count=1),
        ScorableCandidate("mid", followers=200, public_repos=30, public_gists=10, language_count=3),
        ScorableCandidate("strong", followers=5000, public_repos=90, public_gists=40, language_count=6),
    ]
    scores = score_batch(batch)
    assert set(scores) == {"weak", "mid", "strong"}
    for v in scores.values():
        assert 0.0 <= v <= 100.0
    assert scores["strong"] > scores["mid"] > scores["weak"]


def test_empty_batch():
    assert score_batch([]) == {}
