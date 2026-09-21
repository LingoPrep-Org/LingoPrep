# LingoPrep Backend Instruction

This file explains how to build, run, test, and manually verify all backend APIs with Swagger/OpenAPI, plus how the frontend should call the API.

## 1. Required software

For local pip/venv mode:

- Python 3.11
- pip
- Optional PostgreSQL, Redis, MinIO if you want full infrastructure locally

For Docker mode:

- Docker Desktop
- Docker Compose v2

For API testing:

- Browser for Swagger UI
- Optional curl/Postman

## 2. Environment variables and API keys

Copy the example env file:

```bash
cd F:/LingoPrep/BE
copy .env.example .env
```

Important variables:

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `PROJECT_NAME` | yes | `LingoPrep API` | FastAPI project name. |
| `DATABASE_URL` | yes | `postgresql://postgres:postgres@localhost:5433/lingoprep` | If PostgreSQL is unavailable, app falls back to SQLite for local demo. |
| `JWT_SECRET_KEY` | yes | `change-this-secret-in-production` | Required for JWT signing. Change in production. |
| `JWT_ALGORITHM` | yes | `HS256` | JWT algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | yes | `1440` | Token lifetime. |
| `CORS_ORIGINS` | yes | `["http://localhost:5173"]` | Frontend origins allowed. |
| `AI_PROVIDER` | yes | `local` | `local` works without paid AI keys. |
| `OPENAI_API_KEY` | optional | empty or key | Only needed if you wire OpenAI provider. |
| `GEMINI_API_KEY` | optional | empty or key | Only needed if you wire Gemini provider. |
| `UPLOAD_DIR` | yes | `./uploads` | Local audio/TTS artifact fallback. |
| `REDIS_URL` | yes for full stack | `redis://localhost:6379/0` | Redis cache/queue-ready infra. |
| `OBJECT_STORAGE_ENDPOINT` | yes for MinIO | `localhost:9000` | MinIO/S3 endpoint. |
| `OBJECT_STORAGE_ACCESS_KEY` | yes for MinIO | `minioadmin` | MinIO user/access key. |
| `OBJECT_STORAGE_SECRET_KEY` | yes for MinIO | `minioadmin` | MinIO password/secret key. |
| `OBJECT_STORAGE_BUCKET` | yes for MinIO | `lingoprep-uploads` | Bucket auto-created when MinIO is available. |
| `OBJECT_STORAGE_SECURE` | yes | `false` | `true` only for HTTPS object storage. |

Minimum local development without paid keys:

```env
AI_PROVIDER=local
OPENAI_API_KEY=
GEMINI_API_KEY=
```

No paid API key is required for the deterministic local fallback tests.

## 3. Run backend with pip in venv

### 3.1 Create and activate venv

On Windows Git Bash from `F:/LingoPrep/BE`:

```bash
cd F:/LingoPrep/BE
py -3.11 -m venv .venv
. .venv/Scripts/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If you use PowerShell directly outside Hermes/Git Bash:

```powershell
cd F:\LingoPrep\BE
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3.2 Configure env

```bash
copy .env.example .env
```

For quick local demo, you can leave PostgreSQL/Redis/MinIO stopped. Backend will fallback to SQLite for DB and report Redis/MinIO unavailable in infra status. For full local infra without Docker Compose, run PostgreSQL, Redis, and MinIO manually and keep `.env` pointing to them.

### 3.3 Run API

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Alternative:

```bash
python run_be.py
```

Open:

- Swagger: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Health: `http://localhost:8000/api/health`
- AI Test UI: `http://localhost:8000/ai-test`

## 4. Run full stack with Docker Compose

From repository root:

```bash
cd F:/LingoPrep
docker compose up --build
```

Services:

| Service | URL/port |
| --- | --- |
| Backend | `http://localhost:8000` |
| Swagger | `http://localhost:8000/docs` |
| Frontend | `http://localhost:5173` |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6379` |
| MinIO API | `http://localhost:9000` |
| MinIO Console | `http://localhost:9001` |

MinIO console login defaults:

```text
Username: minioadmin
Password: minioadmin
```

Stop services:

```bash
docker compose down
```

Reset DB/object-storage volumes:

```bash
docker compose down -v
```

Validate Compose only:

```bash
docker compose config
```

## 5. Run automated tests

Backend tests:

```bash
cd F:/LingoPrep/BE
py -3.11 -m pytest tests/test_api.py tests/test_backend_contract.py tests/test_infra_contract.py -q
```

Expected result at time of writing:

```text
6 passed
```

Compile check:

```bash
py -3.11 -m compileall app
```

Frontend tests that also validate frontend API-call environment:

```bash
cd F:/LingoPrep/FE
npm install
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

## 6. Swagger authorization flow

1. Open Swagger:

```text
http://localhost:8000/docs
```

2. Run `POST /api/auth/login` with one of the seeded accounts.

Learner:

```json
{
  "email": "learner@lingoprep.com",
  "password": "123456"
}
```

Teacher:

```json
{
  "email": "teacher@lingoprep.com",
  "password": "123456"
}
```

Admin:

```json
{
  "email": "admin@lingoprep.com",
  "password": "123456"
}
```

3. Copy `access_token` from response.

4. Click Swagger `Authorize`.

5. Enter:

```text
Bearer <access_token>
```

6. Click Authorize. Then run protected endpoints.

## 7. Swagger/OpenAPI full API test examples

Use these examples in Swagger `Try it out`. IDs depend on current seed data, but default seed usually has questions and submissions already.

### 7.1 Health

Endpoint:

```http
GET /api/health
```

Expected:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 7.2 Register

Endpoint:

```http
POST /api/auth/register
```

Body:

```json
{
  "email": "new.learner@example.com",
  "password": "123456",
  "full_name": "New Learner",
  "role": "LEARNER",
  "target_exam": "IELTS",
  "target_score": "7.0"
}
```

### 7.3 Login

Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "learner@lingoprep.com",
  "password": "123456"
}
```

### 7.4 Current user

Endpoint:

```http
GET /api/auth/me
```

Header:

```text
Authorization: Bearer <token>
```

### 7.5 List questions

Endpoint:

```http
GET /api/questions?exam_type=IELTS&skill=WRITING
```

No auth required.

### 7.6 Get question detail

Endpoint:

```http
GET /api/questions/1
```

### 7.7 Admin create question

Login as admin first.

Endpoint:

```http
POST /api/questions
```

Body:

```json
{
  "exam_type": "IELTS",
  "skill": "WRITING",
  "part": "Task 2",
  "title": "Remote Work and Productivity",
  "topic": "Work",
  "difficulty": "Medium",
  "prompt": "Some people believe remote work improves productivity, while others think it weakens teamwork. Discuss both views and give your opinion.",
  "instructions": "Write at least 250 words.",
  "prep_time_seconds": 0,
  "time_limit_seconds": 2400,
  "min_words": 250,
  "max_words": 380,
  "rubric_criteria": {
    "task_response": "Clear position and developed arguments",
    "coherence": "Logical paragraphing and linking",
    "lexical": "Topic vocabulary and collocations",
    "grammar": "Complex sentences with accuracy"
  },
  "tags": ["work", "remote", "task2"],
  "is_active": true
}
```

### 7.8 Admin update question

Endpoint:

```http
PUT /api/questions/{question_id}
```

Body:

```json
{
  "difficulty": "Hard",
  "instructions": "Write at least 250 words and include relevant examples.",
  "is_active": true
}
```

### 7.9 Admin delete question soft delete

Endpoint:

```http
DELETE /api/questions/{question_id}
```

### 7.10 Learner submit Writing

Login as learner.

Endpoint:

```http
POST /api/submissions/writing
```

Body:

```json
{
  "question_id": 5,
  "content_text": "In modern society, higher education plays an important role in economic development. Some people believe that university should be free for everyone, while others argue that students should pay because they directly benefit from their degree. In my opinion, a balanced model is better. Governments should support students from disadvantaged backgrounds, but students who can afford tuition should contribute part of the cost. This approach protects fairness while keeping public spending sustainable."
}
```

Expected response includes:

```json
{
  "submission_type": "WRITING",
  "status": "EVALUATED",
  "assessment": {
    "overall_band": 6.5,
    "overall_cefr": "B2"
  }
}
```

Exact band may differ because evaluator logic depends on text.

### 7.11 Learner submit Speaking with transcript only

Endpoint:

```http
POST /api/submissions/speaking
```

Swagger form-data fields:

```text
question_id: 1
duration_seconds: 45
transcript: Well, I am currently a university student, and I enjoy studying software engineering because it allows me to solve practical problems. In the future, I would like to work as a backend developer and build useful educational applications.
audio_file: leave empty
```

### 7.12 Learner submit Speaking with audio

Endpoint:

```http
POST /api/submissions/speaking
```

Swagger form-data fields:

```text
question_id: 1
duration_seconds: 45
transcript: optional browser transcript
audio_file: upload .wav/.webm/.mp3
```

Behavior:

- Saves file under `UPLOAD_DIR`.
- Mirrors to MinIO if MinIO is reachable.
- Falls back to local `/uploads/...` path if MinIO is unavailable.

### 7.13 List my submissions

Endpoint:

```http
GET /api/submissions
```

### 7.14 Get submission detail

Endpoint:

```http
GET /api/submissions/{submission_id}
```

RBAC:

- Learner can read only own submission.
- Teacher/Admin can read any submission.

### 7.15 Request teacher review

Endpoint:

```http
POST /api/submissions/{submission_id}/request-review
```

Expected:

```json
{
  "message": "Teacher review requested successfully",
  "status": "REVIEW_REQUESTED"
}
```

### 7.16 Teacher review queue

Login as teacher.

Endpoint:

```http
GET /api/reviews/queue
```

### 7.17 Teacher submit review

Endpoint:

```http
POST /api/reviews/{submission_id}
```

Body:

```json
{
  "overall_band": 7.0,
  "overall_cefr": "C1",
  "criteria_scores": {
    "fluency": 7,
    "lexical": 7,
    "grammar": 6.5,
    "pronunciation": 7
  },
  "teacher_notes": "Clear response with good structure. Improve pronunciation consistency and add more specific examples."
}
```

### 7.18 Learner dashboard

Endpoint:

```http
GET /api/dashboard/learner
```

Expected fields:

```json
{
  "total_submissions": 1,
  "speaking_count": 0,
  "writing_count": 1,
  "average_band": 6.5,
  "skill_radar": [],
  "trend_history": [],
  "recommended_questions": []
}
```

### 7.19 Notifications

Endpoint:

```http
GET /api/dashboard/notifications
```

### 7.20 Mark notification read

Endpoint:

```http
PUT /api/dashboard/notifications/{notification_id}/read
```

Expected:

```json
{
  "status": "ok"
}
```

### 7.21 Chat create session

Endpoint:

```http
POST /api/chat/sessions
```

Body:

```json
{
  "title": "IELTS Speaking Practice",
  "persona": "IELTS_EXAMINER"
}
```

Supported personas:

- `IELTS_EXAMINER`
- `APTIS_INTERVIEWER`
- `CONVERSATION_PARTNER`

### 7.22 Chat list sessions

Endpoint:

```http
GET /api/chat/sessions
```

### 7.23 Chat session detail

Endpoint:

```http
GET /api/chat/sessions/{session_id}
```

### 7.24 Chat send message

Endpoint:

```http
POST /api/chat/sessions/{session_id}/messages
```

Body:

```json
{
  "content": "Hello examiner, my name is Alex and I am a university student.",
  "audio_path": null
}
```

### 7.25 Admin stats

Login as admin.

Endpoint:

```http
GET /api/admin/stats
```

Expected fields:

```json
{
  "total_users": 3,
  "total_questions": 10,
  "total_submissions": 2,
  "total_rubrics": 2,
  "total_ai_profiles": 2,
  "pending_assessment_jobs": 0,
  "average_band": 7.2,
  "ai_gateway_provider": "local",
  "gemini_configured": false,
  "openai_configured": false
}
```

### 7.26 Admin list users

Endpoint:

```http
GET /api/admin/users
```

### 7.27 Admin update user role

Endpoint:

```http
PUT /api/admin/users/{user_id}/role?role=TEACHER
```

Allowed roles:

- `LEARNER`
- `TEACHER`
- `ADMIN`

### 7.28 Admin infra status

Endpoint:

```http
GET /api/admin/infra/status
```

Expected with Docker full stack:

```json
{
  "redis": {
    "configured": true,
    "url": "redis://redis:6379/0",
    "available": true
  },
  "object_storage": {
    "configured": true,
    "endpoint": "minio:9000",
    "bucket": "lingoprep-uploads",
    "secure": false,
    "available": true
  }
}
```

Local venv without Redis/MinIO may return `available: false`, which is acceptable for fallback development.

### 7.29 Admin create rubric

Endpoint:

```http
POST /api/admin/rubrics
```

Body:

```json
{
  "exam_type": "APTIS",
  "skill": "WRITING",
  "name": "Aptis Writing Rubric v1",
  "version": "1.0",
  "criteria": {
    "task_fulfillment": { "weight": 0.4, "scale": "A1-C2" },
    "language_control": { "weight": 0.3, "scale": "A1-C2" },
    "coherence": { "weight": 0.3, "scale": "A1-C2" }
  },
  "cefr_mapping": {
    "A2": "basic",
    "B1": "adequate",
    "B2": "good",
    "C1": "strong"
  },
  "is_active": true
}
```

### 7.30 Admin update rubric

Endpoint:

```http
PUT /api/admin/rubrics/{rubric_id}
```

Body:

```json
{
  "name": "Aptis Writing Rubric v1.1",
  "is_active": true
}
```

### 7.31 Admin delete/deactivate rubric

Endpoint:

```http
DELETE /api/admin/rubrics/{rubric_id}
```

### 7.32 Admin create AI profile

Endpoint:

```http
POST /api/admin/ai-profiles
```

Body:

```json
{
  "name": "OpenAI Assessment Profile",
  "provider": "openai",
  "model_name": "gpt-4o-mini",
  "purpose": "assessment",
  "config": {
    "temperature": 0.2,
    "structured_output": true
  },
  "is_active": true
}
```

### 7.33 Admin update AI profile

Endpoint:

```http
PUT /api/admin/ai-profiles/{profile_id}
```

Body:

```json
{
  "provider": "local",
  "is_active": false
}
```

### 7.34 Admin delete/deactivate AI profile

Endpoint:

```http
DELETE /api/admin/ai-profiles/{profile_id}
```

### 7.35 Admin assessment jobs

Endpoint:

```http
GET /api/admin/assessment-jobs
```

### 7.36 Admin audit logs

Endpoint:

```http
GET /api/admin/audit-logs
```

### 7.37 AI debug: writing evaluate

Endpoint:

```http
POST /api/ai/writing/evaluate
```

Body:

```json
{
  "exam_type": "IELTS",
  "part": "Task 2",
  "prompt": "Some people believe technology improves education. Discuss both views and give your opinion.",
  "essay_text": "Technology has become an important part of education. Some learners benefit from online resources because they can study anywhere. However, traditional classroom interaction is still valuable because teachers can guide students directly. In my view, the best solution is to combine digital tools with teacher support.",
  "min_words": 150
}
```

### 7.38 AI debug: writing improve

Endpoint:

```http
POST /api/ai/writing/improve
```

Body:

```json
{
  "text": "I think online learning is good because it is easy and cheap."
}
```

### 7.39 AI debug: chat

Endpoint:

```http
POST /api/ai/chat
```

Body:

```json
{
  "persona": "IELTS_EXAMINER",
  "message": "Hello, my name is Alex and I study computer science.",
  "message_history": []
}
```

### 7.40 AI debug: TTS config

Endpoint:

```http
GET /api/ai/tts/config?voice_profile=ielts_examiner_british_female
```

### 7.41 AI debug: TTS synthesize

Endpoint:

```http
POST /api/ai/tts/synthesize
```

Body:

```json
{
  "text": "Welcome to your IELTS speaking practice.",
  "voice_profile": "ielts_examiner_british_female"
}
```

## 8. OpenAPI JSON usage

Live OpenAPI:

```text
http://localhost:8000/openapi.json
```

Export to file:

```bash
cd F:/LingoPrep/BE
py -3.11 -c "import json; from app.main import app; open('openapi.json','w',encoding='utf-8').write(json.dumps(app.openapi(), ensure_ascii=False, indent=2))"
```

Generated file:

```text
F:/LingoPrep/BE/openapi.json
```

Import into Postman/Insomnia:

1. Open Postman.
2. Import file.
3. Select `BE/openapi.json` or paste `http://localhost:8000/openapi.json`.
4. Create environment variable `token`.
5. Set Authorization Bearer token to `{{token}}` after login.

## 9. Frontend API call guide

The frontend service is in:

```text
F:/LingoPrep/FE/src/services/api.ts
```

Base URL:

```ts
const API_BASE = 'http://localhost:8000/api';
```

### 9.1 Login from frontend

```ts
const login = async () => {
  const res = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'learner@lingoprep.com',
      password: '123456',
    }),
  });
  const data = await res.json();
  localStorage.setItem('lingoprep_token', data.access_token);
  localStorage.setItem('lingoprep_user', JSON.stringify(data.user));
};
```

### 9.2 Shared authenticated request helper

```ts
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('lingoprep_token');
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`http://localhost:8000/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API request failed');
  }

  return res.json();
}
```

### 9.3 Get question bank

```ts
const questions = await request('/questions?exam_type=IELTS&skill=WRITING');
```

### 9.4 Submit Writing

```ts
const submission = await request('/submissions/writing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question_id: 5,
    content_text: 'In modern society, higher education plays an important role...',
  }),
});
```

### 9.5 Submit Speaking transcript/audio

```ts
const formData = new FormData();
formData.append('question_id', '1');
formData.append('duration_seconds', '45');
formData.append('transcript', 'Well, I am currently a university student...');

// Optional audio Blob from MediaRecorder:
// formData.append('audio_file', audioBlob, 'recording.webm');

const token = localStorage.getItem('lingoprep_token');
const res = await fetch('http://localhost:8000/api/submissions/speaking', {
  method: 'POST',
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  body: formData,
});
const data = await res.json();
```

Do not set `Content-Type` manually for `FormData`; browser sets multipart boundary automatically.

### 9.6 Request teacher review

```ts
await request(`/submissions/${submissionId}/request-review`, {
  method: 'POST',
});
```

### 9.7 Teacher review from frontend

```ts
await request(`/reviews/${submissionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    overall_band: 7.0,
    overall_cefr: 'C1',
    criteria_scores: {
      fluency: 7,
      lexical: 7,
      grammar: 6.5,
      pronunciation: 7,
    },
    teacher_notes: 'Good structure. Improve pronunciation consistency.',
  }),
});
```

### 9.8 Admin call example

```ts
const stats = await request('/admin/stats');
const infra = await request('/admin/infra/status');
```

### 9.9 Frontend role testing sequence

1. Login learner.
2. Call question bank.
3. Submit writing.
4. Submit speaking.
5. Get dashboard.
6. Request teacher review.
7. Logout/login teacher.
8. Get review queue.
9. Submit teacher review.
10. Logout/login admin.
11. Get stats, users, rubrics, AI profiles, jobs, audit logs, infra status.

## 10. Recommended manual acceptance checklist

- `GET /api/health` returns 200.
- Login returns JWT for all three seeded users.
- Learner can submit Writing and Speaking.
- Learner cannot read another learner's submission.
- Teacher can read review queue and submit review.
- Admin can CRUD questions/rubrics/AI profiles.
- Admin can see Redis/MinIO status.
- Swagger shows all endpoint groups.
- `openapi.json` imports into Postman.
- Pytest passes.
- Docker Compose config is valid.
- Frontend can login, store token, and call protected APIs.
