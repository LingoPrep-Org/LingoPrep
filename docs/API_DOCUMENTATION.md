# 📘 Tài Liệu Kỹ Thuật REST API - Hệ Thống LingoPrep

> **Phiên bản:** 1.0.0  
> **Backend Framework:** FastAPI (Python 3.11+) + SQLAlchemy 2.0 + Pydantic v2  
> **Cơ sở dữ liệu:** PostgreSQL 16 (Port `5433` hoặc `5432`)  
> **Base URL:** `http://localhost:8000/api`  
> **Tài liệu trực quan Swagger UI:** `http://localhost:8000/docs`  
> **Tài liệu ReDoc:** `http://localhost:8000/redoc`  
> **AI Test Studio UI:** `http://localhost:8000/ai-test`

---

## 📑 Mục Lục
1. [Quy Chuẩn Chung & Xác Thực (Authentication & RBAC)](#1-quy-chuẩn-chung--xác-thực)
2. [Tài Khoản Mẫu Phục Vụ Thử Nghiệm (Demo Accounts)](#2-tài-khoản-mẫu-phục-vụ-thử-nghiệm)
3. [Nhóm 1: Xác Thực Người Dùng (Authentication)](#3-nhóm-1-xác-thực-người-dùng-authentication)
4. [Nhóm 2: Ngân Hàng Câu Hỏi (Question Bank)](#4-nhóm-2-ngân-hàng-câu-hỏi-question-bank)
5. [Nhóm 3: Nộp Bài & Đánh Giá AI (Submissions & AI Assessment)](#5-nhóm-3-nộp-bài--đánh-giá-ai-submissions--ai-assessment)
6. [Nhóm 4: Duyệt Bài & Chấm Điểm Giáo Viên (Teacher Review Module)](#6-nhóm-4-duyệt-bài--chấm-điểm-giáo-viên-teacher-review-module)
7. [Nhóm 5: Thống Kê Tiến Độ & Thông Báo (Dashboard & Analytics)](#7-nhóm-5-thống-kê-tiến-độ--thông-báo-dashboard--analytics)
8. [Nhóm 6: Trợ Lý Ảo Luyện Nói (AI Tutor Chatbot)](#8-nhóm-6-trợ-lý-ảo-luyện-nói-ai-tutor-chatbot)
9. [Nhóm 7: Quản Trị Hệ Thống (Administration & Monitoring)](#9-nhóm-7-quản-trị-hệ-thống-administration--monitoring)
10. [Nhóm 8: AI Testing & Model Studio Endpoints](#10-nhóm-8-ai-testing--model-studio-endpoints)
11. [Mã Lỗi Thường Gặp (Error Handling)](#11-mã-lỗi-thường-gặp)

---

## 1. Quy Chuẩn Chung & Xác Thực

### Headers Mặc Định
Đối với các endpoint yêu cầu xác thực, client phải đính kèm Header:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```
*(Đối với upload file âm thanh multipart/form-data, Content-Type sẽ do trình duyệt hoặc HTTP client tự sinh kèm boundary).*

### Phân Quyền Vai Trò (Role-Based Access Control - RBAC)
Hệ thống quản lý 3 cấp vai trò người dùng trong `UserRole`:
- `LEARNER` (Học viên): Luyện tập Speaking & Writing, nhận kết quả AI, theo dõi tiến độ, chat trợ lý ảo.
- `TEACHER` (Giáo viên): Duyệt hàng đợi bài làm, chấm điểm lại bài làm học viên, ghi chú nhận xét chuyên sâu.
- `ADMIN` (Quản trị viên): Toàn quyền thêm/sửa/xóa đề thi, phân quyền người dùng, theo dõi trạng thái hệ thống.

---

## 2. Tài Khoản Mẫu Phục Vụ Thử Nghiệm

Hệ thống đã nạp sẵn 3 tài khoản mẫu với mật khẩu chung là `123456`:

| Vai Trò | Email | Password | Quyền Hạn Nổi Bật |
|:---|:---|:---|:---|
| **Learner** | `learner@lingoprep.com` | `123456` | Luyện thi, nộp bài, xem phân tích radar, chat với AI |
| **Teacher** | `teacher@lingoprep.com` | `123456` | Truy cập `/api/reviews/queue`, duyệt và chấm lại bài |
| **Admin** | `admin@lingoprep.com` | `123456` | Quản trị đề thi, phân vai trò người dùng, xem thống kê |

---

## 3. Nhóm 1: Xác Thực Người Dùng (Authentication)
**Prefix:** `/api/auth`

### 3.1. Đăng ký tài khoản mới
- **Endpoint:** `POST /api/auth/register`
- **Quyền:** Public
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123@",
  "full_name": "Nguyen Van A",
  "role": "LEARNER",
  "target_exam": "IELTS",
  "target_score": "7.5"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 4,
    "email": "user@example.com",
    "full_name": "Nguyen Van A",
    "role": "LEARNER",
    "target_exam": "IELTS",
    "target_score": "7.5",
    "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=Nguyen%20Van%20A",
    "is_active": true,
    "created_at": "2026-09-21T10:00:00"
  }
}
```

### 3.2. Đăng nhập hệ thống
- **Endpoint:** `POST /api/auth/login`
- **Quyền:** Public
- **Request Body:**
```json
{
  "email": "learner@lingoprep.com",
  "password": "123456"
}
```
- **Response (200 OK):** Trả về token JWT và thông tin user tương tự endpoint đăng ký.

### 3.3. Lấy thông tin tài khoản hiện tại
- **Endpoint:** `GET /api/auth/me`
- **Quyền:** Authenticated (Bearer Token)
- **Response (200 OK):** `UserResponse` thông tin chi tiết người dùng đăng nhập.

---

## 4. Nhóm 2: Ngân Hàng Câu Hỏi (Question Bank)
**Prefix:** `/api/questions`

### 4.1. Danh sách câu hỏi có bộ lọc
- **Endpoint:** `GET /api/questions`
- **Quyền:** Public / Authenticated
- **Query Parameters:**
  - `exam_type` *(tùy chọn)*: `IELTS` | `APTIS`
  - `skill` *(tùy chọn)*: `SPEAKING` | `WRITING`
  - `part` *(tùy chọn)*: Ví dụ `Part 1`, `Part 2`, `Task 1`, `Task 2`
  - `difficulty` *(tùy chọn)*: `Easy` | `Medium` | `Hard`
  - `search` *(tùy chọn)*: Tìm kiếm từ khóa theo tiêu đề, prompt hoặc chủ đề.
- **Response (200 OK):** Mảng các `QuestionResponse`:
```json
[
  {
    "id": 1,
    "title": "IELTS Speaking Part 1 - Hometown",
    "exam_type": "IELTS",
    "skill": "SPEAKING",
    "part": "Part 1",
    "difficulty": "Easy",
    "topic": "Hometown & Background",
    "prompt": "Let's talk about your hometown. Where is your hometown located, and what do you like most about living there?",
    "image_url": null,
    "preparation_time_seconds": 0,
    "response_time_seconds": 60,
    "min_words": null,
    "is_active": true,
    "created_at": "2026-09-21T08:00:00"
  }
]
```

### 4.2. Xem chi tiết câu hỏi
- **Endpoint:** `GET /api/questions/{question_id}`
- **Quyền:** Public / Authenticated
- **Response (200 OK):** Đối tượng câu hỏi chi tiết.

### 4.3. Tạo câu hỏi mới
- **Endpoint:** `POST /api/questions`
- **Quyền:** `ADMIN`
- **Request Body:** `QuestionCreate` (tiêu đề, exam_type, skill, part, difficulty, prompt, response_time_seconds, min_words,...).

### 4.4. Cập nhật câu hỏi
- **Endpoint:** `PUT /api/questions/{question_id}`
- **Quyền:** `ADMIN`

### 4.5. Xóa câu hỏi (Soft Delete)
- **Endpoint:** `DELETE /api/questions/{question_id}`
- **Quyền:** `ADMIN`

---

## 5. Nhóm 3: Nộp Bài & Đánh Giá AI (Submissions & AI Assessment)
**Prefix:** `/api/submissions`

### 5.1. Nộp bài viết (Writing Submission)
- **Endpoint:** `POST /api/submissions/writing`
- **Quyền:** `LEARNER`
- **Mô tả:** Tự động kích hoạt pipeline đánh giá bài viết bằng mô hình `ollama qwen3:4b-instruct`.
- **Request Body (application/json):**
```json
{
  "question_id": 4,
  "content_text": "In modern society, some argue that unpaid community service should be compulsory in high school. In my opinion, volunteering fosters empathy and civic responsibility, preparing students for real-world collaboration."
}
```
- **Response (200 OK):** `SubmissionResponse` bao gồm kết quả đánh giá chi tiết `assessment`:
```json
{
  "id": 12,
  "user_id": 1,
  "question_id": 4,
  "submission_type": "WRITING",
  "content_text": "In modern society...",
  "word_count": 32,
  "duration_seconds": 0,
  "status": "EVALUATED",
  "created_at": "2026-09-21T10:15:00",
  "assessment": {
    "id": 12,
    "overall_band": 6.5,
    "overall_cefr": "B2",
    "task_response_score": 6.5,
    "coherence_score": 6.5,
    "lexical_score": 6.5,
    "grammar_score": 6.0,
    "criteria_breakdown": {
      "task_response": {"score": 6.5, "feedback": "Clear position stated with relevant points."},
      "coherence": {"score": 6.5, "feedback": "Good progression of ideas with connecting devices."},
      "lexical": {"score": 6.5, "feedback": "Adequate vocabulary with some academic terms."},
      "grammar": {"score": 6.0, "feedback": "Accurate sentence frames with minor punctuation slips."}
    },
    "strengths": ["Clear stance", "Logical idea flow"],
    "weaknesses": ["Word count is below minimum requirement"],
    "inline_feedback": [
      {
        "original": "unpaid community service should be compulsory",
        "improved": "mandatory civic participation should be integrated into secondary curricula",
        "explanation": "Elevates register to advanced academic prose.",
        "category": "Academic Style"
      }
    ],
    "model_answer": "In contemporary educational discourse, the proposition that secondary school curricula...",
    "recommendations": [
      "Expand arguments with concrete empirical examples.",
      "Ensure minimum length of 150-250 words is fulfilled."
    ]
  }
}
```

### 5.2. Nộp bài nói (Speaking Submission)
- **Endpoint:** `POST /api/submissions/speaking`
- **Quyền:** `LEARNER`
- **Content-Type:** `multipart/form-data`
- **Form Data Parameters:**
  - `question_id`: `int` (bắt buộc)
  - `duration_seconds`: `int` (mặc định: 60)
  - `transcript`: `string` *(tùy chọn: văn bản do Web Speech API trình duyệt chuyển trước)*
  - `audio_file`: `file` *(tùy chọn: tệp ghi âm WebM/WAV/MP3 của thí sinh)*
- **Mô tả:** Hệ thống tự động kích hoạt kiến trúc **Dual-Stream Speaking Pipeline**:
  1. **Stream A (Âm học):** Chuyển trực tiếp waveform vào model `slplab/wav2vec2-large-robust-L2-english-phoneme-recognition` để định vị từ và âm vị bị phát âm sai.
  2. **Stream B (Nội dung):** Sử dụng `Qwen3-ASR-0.6B` để chuyển thành văn bản và đo tốc độ nói WPM.
  3. **Đánh giá logic & ngôn ngữ:** `qwen3:4b-instruct` tổng hợp cả 2 luồng để chấm điểm FC, LR, GRA, PR, CEFR và đưa ra bài mẫu.
- **Response (200 OK):** `SubmissionResponse` có chứa đầy đủ phân tích âm học và điểm 4 tiêu chí.

### 5.3. Xem lịch sử nộp bài của tôi
- **Endpoint:** `GET /api/submissions`
- **Quyền:** Authenticated

### 5.4. Xem chi tiết bài nộp & kết quả đánh giá
- **Endpoint:** `GET /api/submissions/{submission_id}`
- **Quyền:** Authenticated

### 5.5. Yêu cầu giáo viên chấm lại (Request Teacher Review)
- **Endpoint:** `POST /api/submissions/{submission_id}/request-review`
- **Quyền:** `LEARNER`
- **Response (200 OK):**
```json
{
  "message": "Teacher review requested successfully",
  "status": "REVIEW_REQUESTED"
}
```

---

## 6. Nhóm 4: Duyệt Bài & Chấm Điểm Giáo Viên (Teacher Review Module)
**Prefix:** `/api/reviews`

### 6.1. Lấy danh sách bài trong hàng đợi chấm
- **Endpoint:** `GET /api/reviews/queue`
- **Quyền:** `TEACHER`
- **Mô tả:** Trả về danh sách bài làm đang chờ giáo viên chấm (`REVIEW_REQUESTED`) và các bài đã nộp gần đây, sắp xếp ưu tiên bài được yêu cầu review.
- **Response (200 OK):** Mảng các `SubmissionResponse` kèm câu hỏi và kết quả AI đối chiếu.

### 6.2. Nộp kết quả chấm và nhận xét của giáo viên
- **Endpoint:** `POST /api/reviews/{submission_id}`
- **Quyền:** `TEACHER`
- **Request Body:**
```json
{
  "overall_band": 7.0,
  "overall_cefr": "C1",
  "criteria_scores": {
    "fluency": 7.0,
    "lexical": 7.0,
    "grammar": 6.5,
    "pronunciation": 7.5
  },
  "teacher_notes": "Em duy trì nhịp điệu nói rất tự nhiên. Cần lưu ý cách phát âm các âm đuôi /s/ và /ed/. Phần phản xạ rất linh hoạt."
}
```
- **Response (200 OK):**
```json
{
  "id": 1,
  "submission_id": 5,
  "teacher_id": 2,
  "teacher_name": "Sarah Jenkins (Examiner)",
  "overall_band": 7.0,
  "overall_cefr": "C1",
  "criteria_scores": {
    "fluency": 7.0,
    "lexical": 7.0,
    "grammar": 6.5,
    "pronunciation": 7.5
  },
  "teacher_notes": "Em duy trì nhịp điệu nói rất tự nhiên...",
  "is_overridden": true,
  "reviewed_at": "2026-09-21T10:30:00"
}
```

---

## 7. Nhóm 5: Thống Kê Tiến Độ & Thông Báo (Dashboard & Analytics)
**Prefix:** `/api/dashboard`

### 7.1. Lấy dữ liệu bảng theo dõi học viên (Learner Dashboard)
- **Endpoint:** `GET /api/dashboard/learner`
- **Quyền:** `LEARNER`
- **Response (200 OK):**
```json
{
  "total_submissions": 8,
  "speaking_count": 4,
  "writing_count": 4,
  "average_band": 6.5,
  "highest_band": 7.5,
  "cefr_level": "B2",
  "current_streak_days": 4,
  "total_practiced_minutes": 85,
  "skill_radar": [
    {"skill_name": "Fluency", "score": 6.5},
    {"skill_name": "Coherence", "score": 7.0},
    {"skill_name": "Lexical Resource", "score": 7.0},
    {"skill_name": "Grammar", "score": 6.0},
    {"skill_name": "Pronunciation", "score": 6.5},
    {"skill_name": "Task Response", "score": 7.0}
  ],
  "trend_history": [
    {"date": "Sep 15", "band": 6.0, "type": "WRITING"},
    {"date": "Sep 18", "band": 6.5, "type": "SPEAKING"},
    {"date": "Sep 21", "band": 7.0, "type": "WRITING"}
  ],
  "recommended_questions": [...]
}
```

### 7.2. Lấy danh sách thông báo
- **Endpoint:** `GET /api/dashboard/notifications`
- **Quyền:** Authenticated

### 7.3. Đánh dấu thông báo đã đọc
- **Endpoint:** `PUT /api/dashboard/notifications/{notification_id}/read`
- **Quyền:** Authenticated

---

## 8. Nhóm 6: Trợ Lý Ảo Luyện Nói (AI Tutor Chatbot)
**Prefix:** `/api/chat`

### 8.1. Khởi tạo phiên luyện nói mới
- **Endpoint:** `POST /api/chat/sessions`
- **Quyền:** Authenticated
- **Request Body:**
```json
{
  "title": "IELTS Part 1 Warm-up",
  "persona": "IELTS_EXAMINER"
}
```
*Hỗ trợ 4 Persona:*
- `IELTS_EXAMINER`: Giám khảo IELTS Cambridge chuẩn mực, lịch thi thực tế.
- `APTIS_INTERVIEWER`: Phỏng vấn viên Aptis ESOL của British Council.
- `CONVERSATION_PARTNER`: Bạn bản xứ London giao tiếp tự nhiên, thân thiện.
- `GRAMMAR_COACH`: Huấn luyện viên chỉnh sửa ngữ pháp và từ vựng chuyên sâu.

### 8.2. Danh sách các phiên trò chuyện
- **Endpoint:** `GET /api/chat/sessions`
- **Quyền:** Authenticated

### 8.3. Xem nội dung và lịch sử tin nhắn của phiên
- **Endpoint:** `GET /api/chat/sessions/{session_id}`
- **Quyền:** Authenticated

### 8.4. Gửi tin nhắn và nhận phản hồi tức thì từ AI
- **Endpoint:** `POST /api/chat/sessions/{session_id}/messages`
- **Quyền:** Authenticated
- **Request Body:**
```json
{
  "content": "Well, I currently reside in Hanoi and I have been living here for around 5 years.",
  "audio_path": null
}
```
- **Response (200 OK):**
```json
{
  "id": 15,
  "session_id": 2,
  "role": "assistant",
  "content": "That is interesting. How has Hanoi transformed since you first moved there?",
  "corrections": {
    "tip": "Upgrade 'around 5 years' to 'approximately half a decade' or 'for the past five years'.",
    "type": "Vocabulary Upgrade"
  },
  "created_at": "2026-09-21T10:45:00"
}
```

---

## 9. Nhóm 7: Quản Trị Hệ Thống (Administration & Monitoring)
**Prefix:** `/api/admin`

### 9.1. Lấy số liệu thống kê tổng quan
- **Endpoint:** `GET /api/admin/stats`
- **Quyền:** `ADMIN`
- **Response (200 OK):**
```json
{
  "total_users": 150,
  "total_questions": 24,
  "total_submissions": 380,
  "average_band": 6.4,
  "ai_gateway_provider": "local",
  "gemini_configured": false,
  "openai_configured": false
}
```

### 9.2. Danh sách toàn bộ tài khoản
- **Endpoint:** `GET /api/admin/users`
- **Quyền:** `ADMIN`

### 9.3. Phân vai trò người dùng (Change Role)
- **Endpoint:** `PUT /api/admin/users/{user_id}/role?role=TEACHER`
- **Quyền:** `ADMIN`

---

## 10. Nhóm 8: AI Testing & Model Studio Endpoints
**Prefix:** `/api/ai` & Web UI: `/ai-test`

Đây là tập hợp các API chuyên dụng để kiểm thử độc lập từng thành phần trong hệ sinh thái AI, hỗ trợ phòng thu thử nghiệm trực tiếp trên trình duyệt.

### 10.1. Caching Audio Speaking để Thí Sinh Nghe Lại
- **Endpoint:** `POST /api/ai/speaking/cache`
- **Content-Type:** `multipart/form-data`
- **Form Param:** `audio_file` (File audio WebM/WAV)
- **Mục đích:** Lưu tạm bản ghi vào server cache để thí sinh nghe lại bài nói của mình. Nếu thấy ưng ý mới nộp chấm.
- **Response (200 OK):**
```json
{
  "cache_id": "cache_a1b2c3d4e5",
  "audio_url": "/uploads/cache_a1b2c3d4e5.webm",
  "size_bytes": 65420,
  "message": "Audio cached successfully. Candidate may listen back before submitting for assessment."
}
```

### 10.2. Chấm Điểm Speaking Trực Tiếp Bằng Cache hoặc File Audio (Dual-Stream)
- **Endpoint:** `POST /api/ai/speaking/evaluate`
- **Content-Type:** `multipart/form-data`
- **Form Params:**
  - `cache_id`: `string` *(id lấy từ endpoint cache phía trên)*
  - `audio_file`: `file` *(hoặc upload trực tiếp)*
  - `exam_type`: `IELTS` | `APTIS`
  - `part`: `Part 1` | `Part 2` | `Part 3`
  - `prompt`: Câu hỏi của đề
  - `client_transcript`: *(tùy chọn) Transcript từ client*
- **Response (200 OK):** Chi tiết phân tích âm học và điểm số toàn diện.

### 10.3. Thử Nghiệm Mô Hình Âm Vị `slplab/wav2vec2-large-robust-L2-english-phoneme-recognition`
- **Endpoint:** `POST /api/ai/test/phoneme-recognition`
- **Content-Type:** `multipart/form-data`
- **Form Params:** `audio_file` (file âm thanh), `transcript` (câu nói dự kiến)
- **Response (200 OK):**
```json
{
  "model_used": "slplab/wav2vec2-large-robust-L2-english-phoneme-recognition",
  "status": "success",
  "total_phonemes": 38,
  "error_count": 2,
  "phoneme_error_rate_pct": 5.3,
  "acoustic_pronunciation_score": 78.5,
  "ielts_pronunciation_band": 7.0,
  "word_level_errors": [
    {
      "word": "technology",
      "word_index": 4,
      "position_label": "Từ thứ 4 trong lời nói",
      "sentence_context": "... fundamentally transformed [technology] across society ...",
      "error_token": "ch_err",
      "target_sound": "/tʃ/",
      "sound_type": "consonant",
      "example_words": "'ch'ur'ch', ma'tch'",
      "diagnostic": "Phát âm sai âm /tʃ/ trong từ 'technology' (vị trí từ thứ 4 trong câu). Lưu ý: phát âm chuẩn âm /tʃ/ như trong ''ch'ur'ch', ma'tch''."
    }
  ]
}
```

### 10.4. Thử Nghiệm Mô Hình ASR `Qwen/Qwen3-ASR-0.6B`
- **Endpoint:** `POST /api/ai/test/asr-transcription`
- **Content-Type:** `multipart/form-data`
- **Form Param:** `audio_file`
- **Xử lý đặc biệt:** Nếu audio dưới 0.8 giây hoặc không phát hiện được tiếng nói, trả về:
```json
{
  "transcript": "không rõ âm thanh hoặc độ dài chưa đủ",
  "word_count": 0,
  "duration_seconds": 0.3,
  "speaking_rate_wpm": 0.0,
  "is_unclear": true
}
```

### 10.5. Đánh Giá Bài Viết Bằng `ollama qwen3:4b-instruct`
- **Endpoint:** `POST /api/ai/writing/evaluate`
- **Request Body:**
```json
{
  "exam_type": "IELTS",
  "part": "Task 2",
  "prompt": "Some people believe that university education should be free for everyone. To what extent do you agree or disagree?",
  "essay_text": "In contemporary society, higher education represents a crucial foundation for economic growth...",
  "min_words": 150
}
```

### 10.6. Nâng Cấp Văn Phong Viết Sang Chuẩn C1/C2 (Text Improvement)
- **Endpoint:** `POST /api/ai/writing/improve`
- **Request Body:**
```json
{
  "text": "I think that online learning is very good because students have a lot of free time."
}
```
- **Response (200 OK):**
```json
{
  "original_text": "I think that online learning is very good because students have a lot of free time.",
  "improved_text": "From an academic standpoint, digital pedagogy offers exceptional flexibility, granting learners substantial autonomy over their schedules.",
  "cefr_estimated": "B1 -> C1",
  "vocabulary_upgrades": [
    {"basic": "very good", "advanced": "exceptional / highly advantageous", "context": "Academic emphasis"},
    {"basic": "a lot of free time", "advanced": "substantial temporal autonomy", "context": "Sophisticated register"}
  ],
  "grammar_enhancements": [
    {"original": "I think that...", "corrected": "From an academic standpoint,...", "reason": "Objective discourse framing"}
  ],
  "summary_of_changes": "Elevated register from colloquial speech to formal academic prose."
}
```

### 10.7. Cấu Hình Mozilla Web Speech API
- **Endpoint:** `GET /api/ai/tts/config?voice_profile=ielts_examiner_british_female`
- **Mô tả:** Cung cấp thông số cấu hình client và đoạn code mẫu JavaScript sẵn sàng chạy cho trình duyệt theo tiêu chuẩn Mozilla Web Speech API.

### 10.8. Tổng Hợp Giọng Đọc Phía Server (Edge-TTS Fallback)
- **Endpoint:** `POST /api/ai/tts/synthesize`
- **Request Body:**
```json
{
  "text": "Good morning. Please take a seat and tell me your full name.",
  "voice_profile": "ielts_examiner_british_female"
}
```
- **Response (200 OK):** Trả về đường dẫn tệp âm thanh MP3 `/uploads/tts_xxxx.mp3`.

### 10.9. Giao Diện Kiểm Thử Web Trực Quan
- **URL:** `GET http://localhost:8000/ai-test`
- **Mô tả:** Trang web giao diện tương tác độc lập (HTML5 + Web Audio API) tích hợp trực tiếp trong Backend. Cho phép:
  - Ghi âm trực tiếp bằng microphone và visualizer sóng âm.
  - Test phát lại bản ghi vừa thu (audio caching).
  - Bấm nút test tức thì Wav2Vec2 L2 Phoneme Recognition, Qwen3-ASR và Dual-Stream Evaluation.
  - Test Writing Evaluator, Paraphraser và Chatbot.

---

## 11. Mã Lỗi Thường Gặp

| Mã HTTP | Tên Lỗi | Nguyên Nhân Thường Gặp | Hướng Xử Lý |
|:---|:---|:---|:---|
| **400 Bad Request** | `Email is already registered` | Email đã tồn tại khi đăng ký | Đăng nhập hoặc dùng email khác |
| **400 Bad Request** | `Either cached audio or audio_file must be provided` | Thiếu file audio hoặc cache_id khi chấm speaking | Kiểm tra lại dữ liệu upload |
| **401 Unauthorized** | `Incorrect email or password` | Sai thông tin đăng nhập | Kiểm tra lại email/password |
| **401 Unauthorized** | `Could not validate credentials` | Token JWT hết hạn hoặc không hợp lệ | Đăng nhập lại để lấy token mới |
| **403 Forbidden** | `Action requires TEACHER role` hoặc `ADMIN role` | Người dùng không đủ quyền | Đổi sang tài khoản có vai trò phù hợp |
| **404 Not Found** | `Question not found` / `Submission not found` | ID truyền vào không tồn tại | Kiểm tra lại ID trong cơ sở dữ liệu |
| **500 Internal Error**| `Evaluation failed` | Xảy ra lỗi ngoại lệ trong quá trình AI xử lý | Kiểm tra trạng thái Ollama hoặc log backend |
