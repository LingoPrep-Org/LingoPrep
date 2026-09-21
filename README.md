# LingoPrep - Nền Tảng Luyện Thi IELTS & Aptis Speaking & Writing Thông Minh Hỗ Trợ Bởi AI

> Hệ thống luyện thi và đánh giá hình thành (Formative Assessment) theo tài liệu đề xuất dự án [Document.docx](file:///a:/Class%20do%20DNTU/LingoPrep/Document.docx) và quy chuẩn AI [AI task rule.md](file:///a:/Class%20do%20DNTU/LingoPrep/AI%20task%20rule.md).  
> Dự án được phân chia thành 2 thư mục độc lập: **`BE`** (Backend FastAPI + PostgreSQL + Pipeline AI) và **`FE`** (Frontend Vite + React + TypeScript + Thiết kế cao cấp).

---

## 📚 TÀI LIỆU KỸ THUẬT CHUYÊN SÂU
- 📘 **[Tài Liệu Chi Tiết Toàn Bộ REST API](docs/API_DOCUMENTATION.md)**: Đặc tả chi tiết 8 nhóm endpoint, request/response schema, mã lỗi, authentication Bearer JWT và ví dụ cURL.
- 🧠 **[Hướng Dẫn Cài Đặt & Chạy Mô Hình AI](docs/AI_SETUP_GUIDE.md)**: Hướng dẫn cài đặt Ollama `qwen3:4b-instruct`, HuggingFace `slplab/wav2vec2-large-robust-L2-english-phoneme-recognition`, `Qwen/Qwen3-ASR-0.6B`, Edge-TTS / Mozilla Web Speech API, kiểm thử qua `/ai-test` và xử lý sự cố.

---

## 🌟 1. Cấu Trúc Thư Mục Dự Án

```
LingoPrep/
├── docs/                             # TÀI LIỆU KỸ THUẬT DỰ ÁN
│   ├── API_DOCUMENTATION.md          # Đặc tả toàn diện 8 nhóm REST API
│   └── AI_SETUP_GUIDE.md             # Hướng dẫn kiến trúc & chạy các mô hình AI
│
├── BE/                               # Backend & Trí tuệ nhân tạo (FastAPI + PostgreSQL)
│   ├── app/
│   │   ├── main.py                   # Khởi chạy FastAPI, CORS, middleware, static files, lifecycle
│   │   ├── config.py                 # Cấu hình Pydantic (.env, Database URL, JWT, AI Keys)
│   │   ├── database.py               # Kết nối SQLAlchemy 2.0 Engine & Session pool
│   │   ├── models/                   # SQLAlchemy Models (User, Question, Submission, Assessment, Review, Chat)
│   │   ├── schemas/                  # Pydantic Schemas request & response validation
│   │   ├── core/                     # JWT Authentication, Bcrypt security & RBAC dependencies
│   │   ├── seeds/                    # Khởi tạo ngân hàng 11+ đề thi và 3 tài khoản demo
│   │   ├── static/
│   │   │   └── ai_test.html          # Giao diện Web Studio kiểm thử toàn diện các mô hình AI
│   │   ├── routers/                  # REST API endpoints
│   │   │   ├── auth.py               # /api/auth (Đăng ký, Đăng nhập, Profile)
│   │   │   ├── questions.py          # /api/questions (Ngân hàng đề thi, bộ lọc, CRUD)
│   │   │   ├── submissions.py        # /api/submissions (Nộp bài viết/nói, chấm AI tự động)
│   │   │   ├── reviews.py            # /api/reviews (Hàng đợi chấm bài cho giáo viên)
│   │   │   ├── dashboard.py          # /api/dashboard (Radar chart, lịch sử điểm, thông báo)
│   │   │   ├── chat.py               # /api/chat (Trợ lý ảo luyện nói theo vai)
│   │   │   ├── admin.py              # /api/admin (Thống kê, quản lý người dùng, phân quyền)
│   │   │   └── ai_test.py            # /api/ai/* (Audio caching, dual-stream speaking, phoneme test, ASR, TTS)
│   │   └── ai/                       # AI ENGINE & MODEL INTEGRATION
│   │       ├── ollama_service.py     # Client kết nối Ollama qwen3:4b-instruct với System Prompts chuẩn
│   │       ├── phoneme_evaluator.py  # Wav2Vec2 L2 phoneme error detection & Word Alignment algorithm
│   │       ├── asr_service.py        # Qwen3-ASR-0.6B chuyển giọng nói sang văn bản, đo WPM
│   │       ├── speaking_evaluator.py # Dual-Stream Speaking Engine tích hợp âm học & ngôn ngữ
│   │       ├── writing_evaluator.py  # Đánh giá bài viết theo tiêu chí Cambridge/Aptis & Academic Paraphraser
│   │       ├── tutor_chatbot.py      # Trợ lý luyện nói tương tác đa vai kèm Micro-Feedback tips
│   │       ├── tts_service.py        # Cấu hình Mozilla Web Speech API & Edge-TTS server-side synthesis
│   │       ├── cefr_mapper.py        # Quy đổi chuẩn xác giữa IELTS Band (4.0 - 9.0) và CEFR (A1 - C2)
│   │       ├── stt_service.py        # Xử lý âm thanh & trích xuất nhịp điệu (WPM)
│   │       └── gateway.py            # AI Gateway dự phòng kết nối Gemini/OpenAI
│   ├── uploads/                      # Lưu trữ tệp ghi âm của thí sinh và file âm thanh TTS
│   ├── tests/                        # Bộ kiểm thử tự động
│   │   ├── test_ai_pipeline.py       # Kiểm thử chuyên sâu pipeline AI (Dual-Stream, Ollama, Wav2Vec2, ASR)
│   │   └── test_api.py               # Kiểm thử tích hợp toàn bộ luồng nghiệp vụ API
│   ├── requirements.txt              # Danh sách thư viện Python
│   └── run_be.py                     # Script chạy nhanh backend
│
├── FE/                               # Frontend Web Application (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/               # Navbar, AudioRecorder, ScoreBadge, RadarChart, HistoryChart
│   │   ├── context/                  # AuthContext (quản lý phiên, đổi role nhanh 1-click, theme)
│   │   ├── pages/                    # 9 màn hình chức năng: Home, QuestionBank, Speaking, Writing, Assessment,...
│   │   ├── services/                 # api.ts (fetch client kết nối backend port 8000)
│   │   ├── styles/index.css          # Design System: Glassmorphism, Dark/Light mode, animations
│   │   └── types/index.ts            # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml                # Chạy trọn gói PostgreSQL, BE và FE
├── start_backend.bat                 # Script 1-click khởi động BE trên Windows
└── start_frontend.bat                # Script 1-click khởi động FE trên Windows
```

---

## 🚀 2. Hướng Dẫn Khởi Động Nhanh

### Bước 1: Cơ sở dữ liệu PostgreSQL
Hệ thống kết nối đến cơ sở dữ liệu PostgreSQL `lingoprep`:
- Docker container đang chạy trên port `5433`: `postgresql://postgres:postgres@localhost:5433/lingoprep`.
- Hoặc chỉnh sửa đường dẫn trong file `BE/.env` để trỏ vào PostgreSQL cục bộ port `5432`.

### Bước 2: Khởi động Backend (BE)
Mở terminal tại thư mục `BE/`:
```bash
cd BE
python -m pip install -r requirements.txt
python run_be.py
# Hoặc chạy script có sẵn:
# ..\start_backend.bat
```
- *Backend API hoạt động tại:* **`http://localhost:8000`**
- *Tài liệu trực quan Swagger UI:* **`http://localhost:8000/docs`**
- *Giao diện thử nghiệm AI Studio:* **`http://localhost:8000/ai-test`**

### Bước 3: Khởi động Frontend (FE)
Mở terminal tại thư mục `FE/`:
```bash
cd FE
npm install
npm run dev
# Hoặc chạy script có sẵn:
# ..\start_frontend.bat
```
*Giao diện người dùng chạy tại:* **`http://localhost:5173`**.

---

## 🤖 3. Hướng Dẫn Vận Hành AI Cục Bộ (Ollama & HuggingFace)

Hệ thống ưu tiên chạy cục bộ (Local-First), bảo mật và không tốn chi phí token.

### 3.1. Cài đặt và kích hoạt Ollama (`qwen3:4b-instruct`)
1. Tải và cài đặt Ollama từ [https://ollama.com](https://ollama.com).
2. Kéo mô hình về máy:
   ```bash
   ollama pull qwen3:4b-instruct
   ```
3. Khởi chạy dịch vụ Ollama (mặc định tại `http://localhost:11434`):
   ```bash
   ollama serve
   ```

### 3.2. Cài đặt mô hình Âm học & ASR (HuggingFace)
Trong môi trường Python của `BE/`:
```bash
# Cài đặt PyTorch và thư viện âm thanh:
pip install torch torchvision torchaudio
pip install transformers librosa soundfile edge-tts
```

### 3.3. Thử nghiệm AI tức thì
- **Cách 1: Giao diện Web Studio:** Truy cập **`http://localhost:8000/ai-test`** trên trình duyệt để ghi âm trực tiếp, kiểm tra bộ nhớ đệm nghe lại, thử nghiệm mô hình Wav2Vec2 và xem kết quả Dual-Stream.
- **Cách 2: Chạy kiểm thử tự động PyTest:**
  ```bash
  cd BE
  pytest tests/test_ai_pipeline.py -v -s
  ```

*(Xem hướng dẫn chi tiết về cấu hình, tham số và cơ chế fallback tại **[docs/AI_SETUP_GUIDE.md](docs/AI_SETUP_GUIDE.md)**).*

---

## 📡 4. Tóm Tắt Danh Mục REST API

Toàn bộ API đều được tiền tố hóa với `/api`. Chi tiết đầy đủ tham số và ví dụ tại **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**.

| Nhóm Chức Năng | Endpoint | Phương Thức | Quyền Hạn | Mô Tả |
|:---|:---|:---:|:---:|:---|
| **Xác thực** | `/api/auth/register` | `POST` | Public | Đăng ký tài khoản học viên/giáo viên |
| | `/api/auth/login` | `POST` | Public | Đăng nhập lấy JWT Bearer Token |
| | `/api/auth/me` | `GET` | User | Lấy thông tin tài khoản đăng nhập |
| **Ngân hàng đề** | `/api/questions` | `GET` | Public | Danh sách đề thi kèm bộ lọc và tìm kiếm |
| | `/api/questions/{id}` | `GET` | Public | Xem nội dung chi tiết đề thi |
| | `/api/questions` | `POST` | Admin | Tạo đề thi mới (IELTS/Aptis) |
| **Nộp bài & Chấm AI** | `/api/submissions/writing` | `POST` | Learner | Nộp bài viết & kích hoạt AI chấm tự động |
| | `/api/submissions/speaking` | `POST` | Learner | Nộp bài nói & kích hoạt Dual-Stream AI |
| | `/api/submissions` | `GET` | User | Xem lịch sử các bài đã làm của tôi |
| | `/api/submissions/{id}` | `GET` | User | Xem chi tiết bài nộp và báo cáo phân tích AI |
| | `/api/submissions/{id}/request-review` | `POST` | Learner | Gửi yêu cầu giáo viên chấm và nhận xét lại |
| **Giáo viên chấm bài** | `/api/reviews/queue` | `GET` | Teacher | Danh sách bài làm trong hàng đợi chấm |
| | `/api/reviews/{submission_id}` | `POST` | Teacher | Nộp điểm số và nhận xét của giáo viên |
| **Tiến độ học tập** | `/api/dashboard/learner` | `GET` | Learner | Dữ liệu Radar Chart 6 kỹ năng & xu hướng Band |
| | `/api/dashboard/notifications` | `GET` | User | Danh sách thông báo kết quả bài thi/chấm bài |
| **Trợ lý luyện nói AI** | `/api/chat/sessions` | `POST` | User | Tạo phiên luyện nói theo vai (Examiner/Aptis/Alex) |
| | `/api/chat/sessions/{id}/messages` | `POST` | User | Gửi câu nói, nhận phản hồi & Micro-feedback |
| **Quản trị hệ thống** | `/api/admin/stats` | `GET` | Admin | Thống kê số lượng người dùng, bài làm, Band trung bình |
| | `/api/admin/users/{id}/role` | `PUT` | Admin | Phân quyền vai trò (Learner / Teacher / Admin) |
| **Phòng thu AI Studio** | `/api/ai/speaking/cache` | `POST` | Public | Lưu tạm audio để thí sinh nghe lại trước khi nộp |
| | `/api/ai/speaking/evaluate` | `POST` | Public | Đánh giá Dual-Stream độc lập qua cache hoặc audio |
| | `/api/ai/test/phoneme-recognition` | `POST` | Public | Kiểm thử độc lập Wav2Vec2 L2 Phoneme Model |
| | `/api/ai/test/asr-transcription` | `POST` | Public | Kiểm thử độc lập Qwen3-ASR-0.6B |
| | `/api/ai/writing/improve` | `POST` | Public | Nâng cấp câu văn lên trình độ C1/C2 |
| | `/api/ai/tts/config` | `GET` | Public | Lấy cấu hình giọng đọc Mozilla Web Speech API |

---

## 🔑 5. Tài Khoản Demo Khởi Tạo Sẵn

Trên thanh điều hướng (Navbar) góc trên bên phải của giao diện Frontend, có nút **"Role"** cho phép chuyển đổi tức thì giữa các vai trò mà không cần nhập mật khẩu:

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng nổi bật |
| :--- | :--- | :--- | :--- |
| **Learner (Học viên)** | `learner@lingoprep.com` | `123456` | Luyện Speaking & Writing, xem báo cáo AI, xem tiến độ, chat trợ lý ảo |
| **Teacher (Giáo viên)** | `teacher@lingoprep.com` | `123456` | Truy cập mục **Teacher Review**, duyệt bài, ghi nhận xét, điều chỉnh điểm |
| **Admin (Quản trị)** | `admin@lingoprep.com` | `123456` | Truy cập mục **Admin**, thêm câu hỏi vào Question Bank, phân quyền |

---

## 💡 6. Các Tính Năng Đã Hoàn Thiện

1. **F01 Authentication & RBAC**: Đăng nhập, đăng ký, JWT Token, phân quyền chặt chẽ Learner / Teacher / Admin.
2. **F02 Question Bank**: Ngân hàng đề IELTS Speaking (Part 1, 2, 3), IELTS Writing (Task 1, 2) và Aptis Speaking (Part 1, 2, 3, 4), Aptis Writing (Part 2, 4) kèm hình ảnh mô tả.
3. **F03 Speaking Practice**: Ghi âm trực tiếp trên trình duyệt (Web Audio API), hiển thị sóng âm sống động (Canvas Waveform), đồng hồ đếm ngược, chuyển giọng nói thành văn bản thời gian thực (Speech-to-Text).
4. **F04 Writing Practice**: Trình soạn thảo tập trung (Zen Mode), đếm số từ trực tiếp, chỉ báo tiến độ số từ tối thiểu, đếm ngược thời gian làm bài và tự động lưu bản nháp (Autosave).
5. **F05/F06/F07 Dual-Stream AI Assessment Pipeline**: Phân tích chuyên sâu 4 tiêu chí chuẩn Cambridge & British Council:
   - **Stream A Âm học:** Định vị chính xác từ và âm vị bị lỗi phát âm (`slplab/wav2vec2-large-robust-L2-english-phoneme-recognition`).
   - **Stream B Nội dung & Tốc độ:** Nhận diện văn bản, đo tốc độ WPM (`Qwen/Qwen3-ASR-0.6B`). Xử lý audio lỗi/ngắn với thông báo chuẩn `"không rõ âm thanh hoặc độ dài chưa đủ"`.
   - **Lập luận & Chấm điểm:** Đánh giá điểm chi tiết 4 tiêu chí, chỉ ra lỗi sai inline so sánh trực quan, bài mẫu Band 8.5+ (`ollama qwen3:4b-instruct`).
6. **F08 CEFR & Band Mapping**: Quy đổi chuẩn xác giữa IELTS Band (4.0 - 9.0) và Khung tham chiếu CEFR (A1 - C2).
7. **F09 Progress Dashboard**: Biểu đồ mạng nhện (Radar Chart) 6 trục kỹ năng, biểu đồ đường xu hướng phát triển điểm số theo thời gian, chuỗi ngày luyện tập liên tục (Streak).
8. **F10 Teacher Review Module**: Hàng đợi bài làm cần giáo viên chấm lại, giao diện đối chiếu bài làm học viên cạnh kết quả AI, nhập nhận xét và điều chỉnh điểm số.
9. **F11 AI Tutor Chatbot**: Phòng luyện nói tương tác theo vai (Giám khảo IELTS, Phỏng vấn viên Aptis, Bạn giao tiếp tiếng Anh) có hỗ trợ nhận diện giọng nói (Voice Input) và phát âm bản xứ (Mozilla Web Speech API).
10. **F12 Administration & Monitoring**: Quản lý người dùng, thêm câu hỏi mới vào kho đề, giám sát hệ thống.
11. **F13 Interactive AI Test Studio**: Trang kiểm thử trực quan tích hợp tại `/ai-test` phục vụ thử nghiệm độc lập tất cả các mô hình AI.
