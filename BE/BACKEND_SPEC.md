# LingoPrep Backend Spec

## 1. Requirement summary from Document.docx

Project: AI English Practice & Assessment Platform for IELTS/Aptis Speaking & Writing.

MVP scope:
- Learner practices IELTS/Aptis Speaking and Writing.
- Learner submits text/audio and receives AI formative feedback.
- Result stores rubric criteria, band/CEFR mapping, strengths, weaknesses, inline feedback, model answer, recommendations.
- Teacher can inspect a review queue, override AI output, and leave final feedback.
- Admin manages users, roles, question bank, rubrics, AI profiles, jobs, monitoring, and audit evidence.
- System keeps history/progress dashboard and notifications.

Non-goals for MVP:
- Official certification/scoring.
- Full IELTS/Aptis Listening/Reading.
- Enterprise SSO/billing/multi-tenant marketplace.
- Commercial-grade pronunciation scoring without teacher review.

## 2. Tech stack

Backend:
- Python 3.11
- FastAPI
- SQLAlchemy 2.x ORM
- Pydantic v2 schemas
- JWT Bearer authentication with bcrypt password hashing
- PostgreSQL for Docker/production-like mode
- SQLite fallback for local development when PostgreSQL is unavailable
- Redis for cache/queue-ready infrastructure and health visibility
- MinIO/S3-compatible object storage for uploaded speaking audio artifacts

AI integration:
- Local-first heuristic fallback for deterministic demo and tests
- Ollama/Qwen profile for JSON feedback when available
- Optional ASR/phoneme dependencies loaded lazily so backend can still boot without heavy ML packages

DevOps:
- Dockerfile for backend
- docker-compose for PostgreSQL + Redis + MinIO + backend + frontend
- SQL init/migration files under `BE/db` and `BE/migrations`
- Swagger/OpenAPI at `/docs` and exported `BE/openapi.json`
- GitHub Actions CI for backend Pytest, frontend build/Jest/Playwright, and Docker Compose config validation

## 3. Architecture

```
Frontend React/Vite
    -> FastAPI REST API
        -> Auth/RBAC dependencies
        -> Routers: auth, questions, submissions, reviews, dashboard, chat, admin, ai_test
        -> AI services: writing evaluator, speaking evaluator, STT/ASR, TTS, gateway
        -> SQLAlchemy models
    -> PostgreSQL/SQLite
    -> uploads directory for audio/TTS artifacts
```

Key workflow:
1. Learner logs in with JWT.
2. Learner filters question bank by exam, skill, part, difficulty, topic/search.
3. Learner submits Writing text or Speaking transcript/audio.
4. Backend creates `submissions` row and an `assessment_jobs` row.
5. AI evaluator returns structured criteria feedback.
6. Backend stores `assessments`, marks job succeeded/failed, creates notifications/audit logs.
7. Learner views result and dashboard.
8. Learner may request teacher review.
9. Teacher reviews/overrides final score; backend stores `teacher_reviews`, audit trail, and notification.
10. Admin monitors users, rubrics, AI profiles, assessment jobs, and audit logs.

## 4. Database schema

Core tables:
- `users`: email, hashed password, role, target exam/score, status.
- `questions`: exam type, skill, part, title, prompt, instructions, timers, word limits, rubric criteria, tags.
- `submissions`: user/question relation, type, text/transcript, audio path, word count, duration, workflow status.
- `assessments`: AI result, band/CEFR, criteria scores, breakdown JSON, strengths/weaknesses, inline feedback, model answer, recommendations.
- `teacher_reviews`: teacher override/final feedback.
- `chat_sessions`, `chat_messages`: AI tutor practice.
- `notifications`: learner/admin in-app events.
- `rubrics`: versioned scoring criteria and CEFR mapping.
- `ai_profiles`: provider/model/purpose/config for model abstraction.
- `assessment_jobs`: queue/job monitor metadata for async-capable processing.
- `audit_logs`: append-only action trail for role changes, submissions, review requests, bootstrapping.

Infrastructure services:
- Redis configured through `REDIS_URL`; admin health at `GET /api/admin/infra/status`.
- MinIO configured through `OBJECT_STORAGE_*`; speaking uploads are written to local `/uploads` and mirrored to object storage when available.

SQL files:
- `BE/db/init.sql`: database extensions and init hook for Docker PostgreSQL.
- `BE/migrations/001_initial_schema.sql`: full PostgreSQL schema for a fresh database.
- Runtime currently also uses `Base.metadata.create_all` for quick academic/demo startup.

## 5. REST API feature map

Authentication:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Question bank:
- `GET /api/questions`
- `GET /api/questions/{question_id}`
- `POST /api/questions` admin
- `PUT /api/questions/{question_id}` admin
- `DELETE /api/questions/{question_id}` admin soft delete

Practice/assessment:
- `POST /api/submissions/writing`
- `POST /api/submissions/speaking`
- `GET /api/submissions`
- `GET /api/submissions/{submission_id}` owner/teacher/admin only
- `POST /api/submissions/{submission_id}/request-review`

Teacher review:
- `GET /api/reviews/queue`
- `POST /api/reviews/{submission_id}`

Dashboard:
- `GET /api/dashboard/learner`
- `GET /api/dashboard/notifications`
- `PUT /api/dashboard/notifications/{notification_id}/read`

AI tutor/chat:
- `POST /api/chat/sessions`
- `GET /api/chat/sessions`
- `GET /api/chat/sessions/{session_id}`
- `POST /api/chat/sessions/{session_id}/messages`

Admin/monitoring:
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PUT /api/admin/users/{user_id}/role`
- `GET /api/admin/rubrics`
- `GET /api/admin/ai-profiles`
- `GET /api/admin/assessment-jobs`
- `GET /api/admin/audit-logs`
- `GET /api/admin/infra/status`
- `POST /api/admin/rubrics`
- `PUT /api/admin/rubrics/{rubric_id}`
- `DELETE /api/admin/rubrics/{rubric_id}`
- `POST /api/admin/ai-profiles`
- `PUT /api/admin/ai-profiles/{profile_id}`
- `DELETE /api/admin/ai-profiles/{profile_id}`

AI Studio/debug:
- `/api/ai/*` endpoints remain available for speaking cache/evaluate, phoneme, ASR, writing improve, TTS.

## 6. Implementation phases completed

Phase 1: Requirement analysis and backend contract tests.
Phase 2: Schema extension for rubrics, AI profiles, assessment jobs, audit logs.
Phase 3: API/admin monitoring endpoints and owner security check for submission detail.
Phase 4: Job/audit writes in Writing/Speaking submission workflows.
Phase 5: OpenAPI metadata, Docker compose, SQL init/migration docs, and verification tests.
Phase 6: Redis + MinIO infrastructure wiring, admin CRUD for rubrics/AI profiles, Jest/Playwright setup, and GitHub Actions CI.

## 7. Verification

Run from `F:/LingoPrep/BE`:

```
py -3.11 -m pytest tests/test_backend_contract.py -q
```

Expected result: 3 tests pass.

Swagger:
- Live: `http://localhost:8000/docs`
- JSON: `http://localhost:8000/openapi.json`
- Exported file: `BE/openapi.json`
