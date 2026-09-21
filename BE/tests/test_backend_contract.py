import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def login(email: str, password: str = "123456") -> dict:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_openapi_contract_exposes_core_tags_and_security_scheme():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()

    tag_names = {tag["name"] for tag in spec["tags"]}
    assert {
        "Authentication",
        "Question Bank",
        "Submissions & Assessments",
        "Teacher Review Module",
        "Dashboard & Analytics",
        "Administration & Monitoring",
    }.issubset(tag_names)
    assert "OAuth2PasswordBearer" in spec["components"]["securitySchemes"]
    assert spec["info"]["title"] == "LingoPrep API"


def test_admin_metadata_endpoints_cover_rubrics_profiles_jobs_and_audit_logs():
    headers = login("admin@lingoprep.com")

    stats = client.get("/api/admin/stats", headers=headers)
    assert stats.status_code == 200, stats.text
    stats_json = stats.json()
    assert stats_json["total_rubrics"] >= 2
    assert stats_json["total_ai_profiles"] >= 1
    assert "pending_assessment_jobs" in stats_json

    rubrics = client.get("/api/admin/rubrics", headers=headers)
    assert rubrics.status_code == 200, rubrics.text
    assert any(item["skill"] == "WRITING" for item in rubrics.json())

    profiles = client.get("/api/admin/ai-profiles", headers=headers)
    assert profiles.status_code == 200, profiles.text
    assert any(item["provider"] == "local" for item in profiles.json())

    jobs = client.get("/api/admin/assessment-jobs", headers=headers)
    assert jobs.status_code == 200, jobs.text
    assert isinstance(jobs.json(), list)

    audit_logs = client.get("/api/admin/audit-logs", headers=headers)
    assert audit_logs.status_code == 200, audit_logs.text
    assert isinstance(audit_logs.json(), list)


def test_learner_cannot_read_other_learners_submission_detail():
    first_headers = login("learner@lingoprep.com")
    created = client.post(
        "/api/auth/register",
        json={
            "email": "contract-other-learner@example.com",
            "password": "123456",
            "full_name": "Contract Other Learner",
            "role": "LEARNER",
        },
    )
    if created.status_code == 400:
        second_headers = login("contract-other-learner@example.com")
    else:
        assert created.status_code == 200, created.text
        second_headers = {"Authorization": f"Bearer {created.json()['access_token']}"}

    submissions = client.get("/api/submissions", headers=first_headers)
    assert submissions.status_code == 200, submissions.text
    assert submissions.json(), "seed data must include at least one learner submission"
    submission_id = submissions.json()[0]["id"]

    response = client.get(f"/api/submissions/{submission_id}", headers=second_headers)
    assert response.status_code == 403
