def test_health_is_public(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_candidates_requires_auth(client):
    assert client.get("/api/candidates").status_code == 401


def test_candidate_role_is_forbidden_from_admin_routes(client, candidate):
    # This is the bug the old frontend had: role must be enforced server-side.
    assert client.get("/api/candidates", headers=candidate).status_code == 403


def test_admin_can_list_seeded_candidates(client, admin):
    r = client.get("/api/candidates", headers=admin)
    assert r.status_code == 200
    body = r.json()
    assert body["total"] > 0
    scores = [c["score"] for c in body["candidates"]]
    assert scores == sorted(scores, reverse=True)  # returned ranked


def test_shortlist_stage_present(client, admin):
    r = client.get("/api/candidates", headers=admin, params={"stage": "shortlisted"})
    assert r.status_code == 200
    assert r.json()["total"] > 0


def test_outreach_blocked_by_default(client, admin):
    # ALLOW_OUTREACH=false -> send is refused even for a valid candidate.
    listing = client.get("/api/candidates", headers=admin).json()["candidates"]
    with_email = next(c for c in listing if c["email"])
    r = client.post(f"/api/candidates/{with_email['username']}/send-email", headers=admin)
    assert r.status_code == 200
    assert r.json()["success"] is False


def test_candidate_can_read_and_update_own_consent(client, candidate):
    me = client.get("/api/me", headers=candidate)
    assert me.status_code == 200
    assert me.json()["role"] == "candidate"

    mine = client.get("/api/me/candidate", headers=candidate)
    assert mine.status_code == 200

    upd = client.post("/api/me/consent", headers=candidate, json={"status": "granted"})
    assert upd.status_code == 200
    assert upd.json()["consent_status"] == "granted"


def test_pipeline_status(client, admin):
    r = client.get("/api/pipeline/status", headers=admin)
    assert r.status_code == 200
    assert r.json()["last_run"] is not None
