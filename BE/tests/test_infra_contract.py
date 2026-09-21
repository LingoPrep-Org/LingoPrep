import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def login_admin() -> dict:
    response = client.post("/api/auth/login", json={"email": "admin@lingoprep.com", "password": "123456"})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_admin_infra_status_reports_redis_and_minio():
    headers = login_admin()
    response = client.get("/api/admin/infra/status", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "redis" in data
    assert "object_storage" in data
    assert "configured" in data["redis"]
    assert "configured" in data["object_storage"]
    assert "bucket" in data["object_storage"]


def test_admin_can_crud_rubric_and_ai_profile():
    headers = login_admin()

    rubric_payload = {
        "exam_type": "APTIS",
        "skill": "WRITING",
        "name": "Contract Aptis Writing Rubric",
        "version": "1.0-test",
        "criteria": {"task_fulfillment": {"weight": 0.5}, "language_control": {"weight": 0.5}},
        "cefr_mapping": {"B1": "adequate", "B2": "good"},
        "is_active": True,
    }
    created_rubric = client.post("/api/admin/rubrics", headers=headers, json=rubric_payload)
    assert created_rubric.status_code == 201, created_rubric.text
    rubric_id = created_rubric.json()["id"]

    updated_rubric = client.put(
        f"/api/admin/rubrics/{rubric_id}",
        headers=headers,
        json={"name": "Contract Aptis Writing Rubric Updated", "is_active": False},
    )
    assert updated_rubric.status_code == 200, updated_rubric.text
    assert updated_rubric.json()["name"] == "Contract Aptis Writing Rubric Updated"
    assert updated_rubric.json()["is_active"] is False

    profile_payload = {
        "name": "Contract Redis Queue Profile",
        "provider": "openai",
        "model_name": "gpt-test",
        "purpose": "assessment",
        "config": {"temperature": 0.1},
        "is_active": True,
    }
    created_profile = client.post("/api/admin/ai-profiles", headers=headers, json=profile_payload)
    assert created_profile.status_code == 201, created_profile.text
    profile_id = created_profile.json()["id"]

    updated_profile = client.put(
        f"/api/admin/ai-profiles/{profile_id}",
        headers=headers,
        json={"provider": "local", "is_active": False},
    )
    assert updated_profile.status_code == 200, updated_profile.text
    assert updated_profile.json()["provider"] == "local"
    assert updated_profile.json()["is_active"] is False

    delete_profile = client.delete(f"/api/admin/ai-profiles/{profile_id}", headers=headers)
    assert delete_profile.status_code == 200, delete_profile.text

    delete_rubric = client.delete(f"/api/admin/rubrics/{rubric_id}", headers=headers)
    assert delete_rubric.status_code == 200, delete_rubric.text
