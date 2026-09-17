import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

def test_full_flow():
    client = TestClient(app)

    # 1. Health
    r = client.get("/api/health")
    assert r.status_code == 200, r.text
    print("1. Health check: PASSED", r.json())

    # 2. Login
    r_login = client.post("/api/auth/login", json={"email": "learner@lingoprep.com", "password": "123456"})
    assert r_login.status_code == 200, r_login.text
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("2. Learner Login: PASSED")

    # 3. Questions
    r_q = client.get("/api/questions", headers=headers)
    assert r_q.status_code == 200, r_q.text
    questions = r_q.json()
    print(f"3. Questions retrieved: {len(questions)} questions found")

    # 4. Writing Submission & AI Evaluation
    writing_q = [q for q in questions if q["skill"] == "WRITING"][0]
    r_sub_w = client.post("/api/submissions/writing", headers=headers, json={
        "question_id": writing_q["id"],
        "content_text": (
            "In modern times, higher education plays an indispensable role in economic prosperity. "
            "However, the costs associated with university tuition have escalated considerably. "
            "While opponents argue that students should pay their own way, empirical evidence demonstrates "
            "that public investment produces substantial societal returns."
        )
    })
    assert r_sub_w.status_code == 200, r_sub_w.text
    sub_w_data = r_sub_w.json()
    band_w = sub_w_data["assessment"]["overall_band"]
    cefr_w = sub_w_data["assessment"]["overall_cefr"]
    print(f"4. AI Writing Evaluation: PASSED! Overall Band: {band_w} ({cefr_w})")

    # 5. Speaking Submission & AI Evaluation
    speaking_q = [q for q in questions if q["skill"] == "SPEAKING"][0]
    r_sub_s = client.post("/api/submissions/speaking", headers=headers, data={
        "question_id": speaking_q["id"],
        "duration_seconds": 45,
        "transcript": "Well, to be honest, I truly enjoy working in software engineering because it allows me to solve challenging algorithmic problems on a daily basis."
    })
    assert r_sub_s.status_code == 200, r_sub_s.text
    sub_s_data = r_sub_s.json()
    band_s = sub_s_data["assessment"]["overall_band"]
    cefr_s = sub_s_data["assessment"]["overall_cefr"]
    print(f"5. AI Speaking Evaluation: PASSED! Overall Band: {band_s} ({cefr_s})")

    # 6. Dashboard
    r_dash = client.get("/api/dashboard/learner", headers=headers)
    assert r_dash.status_code == 200, r_dash.text
    dash_data = r_dash.json()
    print(f"6. Learner Dashboard: PASSED! Submissions: {dash_data['total_submissions']}, Average Band: {dash_data['average_band']}")

    # 7. AI Tutor Chat
    r_chat = client.post("/api/chat/sessions", headers=headers, json={"title": "Speaking Test Prep", "persona": "IELTS_EXAMINER"})
    assert r_chat.status_code == 200, r_chat.text
    session_id = r_chat.json()["id"]
    r_msg = client.post(f"/api/chat/sessions/{session_id}/messages", headers=headers, json={"content": "Hello Examiner, my name is Alex and I am a university student."})
    assert r_msg.status_code == 200, r_msg.text
    print(f"7. AI Tutor Chatbot: PASSED! AI Reply: {r_msg.json()['content'][:50]}...")

    # 8. Teacher Review
    r_teacher_login = client.post("/api/auth/login", json={"email": "teacher@lingoprep.com", "password": "123456"})
    teacher_token = r_teacher_login.json()["access_token"]
    t_headers = {"Authorization": f"Bearer {teacher_token}"}
    r_queue = client.get("/api/reviews/queue", headers=t_headers)
    assert r_queue.status_code == 200, r_queue.text
    print(f"8. Teacher Review Queue: PASSED! {len(r_queue.json())} submissions in queue")

    # 9. Admin Stats
    r_admin_login = client.post("/api/auth/login", json={"email": "admin@lingoprep.com", "password": "123456"})
    admin_token = r_admin_login.json()["access_token"]
    a_headers = {"Authorization": f"Bearer {admin_token}"}
    r_admin = client.get("/api/admin/stats", headers=a_headers)
    assert r_admin.status_code == 200, r_admin.text
    print("9. Admin Stats: PASSED!", r_admin.json())

    print("\n========================================================")
    print("ALL BACKEND API & AI PIPELINE INTEGRATION TESTS PASSED!")
    print("========================================================\n")

if __name__ == "__main__":
    test_full_flow()
