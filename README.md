# LingoPrep - Nền Tảng Luyện Thi IELTS & Aptis Speaking & Writing Thông Minh Hỗ Trợ Bởi AI

> Hệ thống luyện thi và đánh giá hình thành (Formative Assessment) theo tài liệu đề xuất dự án [Document.docx](file:///a:/Class%20do%20DNTU/LingoPrep/Document.docx).
> Dự án được phân chia thành 2 thư mục độc lập: **`BE`** (Backend FastAPI + PostgreSQL + Pipeline AI) và **`FE`** (Frontend Vite + React + TypeScript + Thiết kế cao cấp).

---

## 🌟 1. Cấu Trúc Thư Mục Dự Án

```
LingoPrep/
├── BE/                               # Backend & Trí tuệ nhân tạo (FastAPI + PostgreSQL)
│   ├── app/
│   │   ├── main.py                   # Điểm khởi chạy FastAPI, CORS, middleware, static files
│   │   ├── config.py                 # Cấu hình Pydantic (.env, Database URL, JWT, AI Keys)
│   │   ├── database.py               # Kết nối SQLAlchemy 2.0 Engine & Session pool
│   │   ├── models/                   # SQLAlchemy Models (User, Question, Submission, Assessment, Review, Chat)
│   │   ├── schemas/                  # Pydantic Schemas request & response validation
│   │   ├── core/                     # JWT Authentication, Bcrypt security & RBAC dependencies
│   │   ├── seeds/                    # Khởi tạo ngân hàng 11+ đề thi và 3 tài khoản demo
│   │   ├── routers/                  # REST API endpoints (/auth, /questions, /submissions, /reviews, /dashboard, /chat, /admin)
│   │   └── ai/                       # AI PIPELINE TÍCH HỢP TRONG BE
│   │       ├── gateway.py            # AI Gateway: kết nối Gemini/OpenAI hoặc bộ NLP phân tích chuẩn band
│   │       ├── stt_service.py        # Speech-to-Text, phân tích WPM, độ trôi chảy & ngập ngừng
│   │       ├── writing_evaluator.py  # Đánh giá IELTS Writing (TR, CC, LR, GRA) & Aptis CEFR
│   │       ├── speaking_evaluator.py # Đánh giá IELTS Speaking (FC, LR, GRA, PR) & Aptis CEFR
│   │       ├── cefr_mapper.py        # Quy đổi chuẩn xác Band 4.0 - 9.0 và CEFR A1 - C2
│   │       └── tutor_chatbot.py      # Trợ lý luyện nói tương tác theo vai (Examiner / Aptis / Friend)
│   ├── uploads/                      # Lưu trữ audio ghi âm và hình ảnh
│   ├── requirements.txt              # Danh sách thư viện Python
│   └── run_be.py                     # Script chạy nhanh backend
│
├── FE/                               # Frontend Web Application (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/               # Navbar, AudioRecorder, ScoreBadge, RadarChart, HistoryChart
│   │   ├── context/                  # AuthContext (quản lý phiên, đổi role nhanh 1-click, dark/light theme)
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Trang chủ, so sánh format thi IELTS vs Aptis, quy trình 4 bước
│   │   │   ├── QuestionBank.tsx      # Ngân hàng câu hỏi, bộ lọc Exam, Skill, Part, Difficulty, tìm kiếm
│   │   │   ├── SpeakingPractice.tsx  # Phòng thi Speaking: Audio visualizer, ghi âm, đếm giờ, STT preview
│   │   │   ├── WritingPractice.tsx   # Phòng thi Writing: Bộ đếm từ live, Zen mode, autosave draft, đếm giờ
│   │   │   ├── AssessmentResult.tsx  # Báo cáo AI: Band score, CEFR, biểu đồ mạng nhện, inline diff sửa lỗi, bài mẫu Band 8.5+
│   │   │   ├── ProgressDashboard.tsx # Bảng theo dõi tiến độ: Radar 6 kỹ năng, streak, lịch sử điểm số
│   │   │   ├── TeacherQueue.tsx      # Hàng đợi chấm bài của giáo viên: Xem bài làm, chấm điểm, ghi nhận xét
│   │   │   ├── AiTutorChat.tsx       # Phòng hội thoại AI: Đóng vai giám khảo, nhận diện giọng nói & đọc phát âm
│   │   │   ├── AdminDashboard.tsx    # Quản trị: Thêm đề thi, phân quyền người dùng, theo dõi trạng thái AI
│   │   │   └── Login.tsx             # Đăng nhập, đăng ký và 3 nút đăng nhập nhanh Demo
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
```
*Backend API chạy tại:* **`http://localhost:8000`** (Swagger docs: `http://localhost:8000/docs`).

### Bước 3: Khởi động Frontend (FE)
Mở terminal tại thư mục `FE/`:
```bash
cd FE
npm install
npm run dev
```
*Giao diện người dùng chạy tại:* **`http://localhost:5173`**.

---

## 🔑 3. Tài Khoản Demo Khởi Tạo Sẵn

Trên thanh điều hướng (Navbar) góc trên bên phải, có nút **"Role"** cho phép chuyển đổi tức thì giữa các vai trò mà không cần nhập mật khẩu:

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng nổi bật |
| :--- | :--- | :--- | :--- |
| **Learner (Học viên)** | `learner@lingoprep.com` | `123456` | Luyện Speaking & Writing, xem báo cáo AI, xem tiến độ, chat trợ lý ảo |
| **Teacher (Giáo viên)** | `teacher@lingoprep.com` | `123456` | Truy cập mục **Teacher Review**, duyệt bài, ghi nhận xét, điều chỉnh điểm |
| **Admin (Quản trị)** | `admin@lingoprep.com` | `123456` | Truy cập mục **Admin**, thêm câu hỏi vào Question Bank, phân quyền |

---

## 💡 4. Các Tính Năng Đã Hoàn Thiện

1. **F01 Authentication & RBAC**: Đăng nhập, đăng ký, JWT Token, phân quyền chặt chẽ Learner / Teacher / Admin.
2. **F02 Question Bank**: Ngân hàng đề IELTS Speaking (Part 1, 2, 3), IELTS Writing (Task 1, 2) và Aptis Speaking (Part 1, 2, 3, 4), Aptis Writing (Part 2, 4) kèm hình ảnh mô tả.
3. **F03 Speaking Practice**: Ghi âm trực tiếp trên trình duyệt (Web Audio API), hiển thị sóng âm sống động (Canvas Waveform), đồng hồ đếm ngược, chuyển giọng nói thành văn bản thời gian thực (Speech-to-Text).
4. **F04 Writing Practice**: Trình soạn thảo tập trung (Zen Mode), đếm số từ trực tiếp, chỉ báo tiến độ số từ tối thiểu, đếm ngược thời gian làm bài và tự động lưu bản nháp (Autosave).
5. **F05/F06/F07 AI Assessment Pipeline**: Phân tích chuyên sâu 4 tiêu chí chuẩn Cambridge & British Council:
   - Điểm từng tiêu chí (Task Response, Coherence, Lexical Resource, Grammar / Fluency, Pronunciation).
   - Chỉ ra lỗi ngữ pháp và từ vựng cụ thể theo dạng so sánh trực quan (Diff Highlights đỏ/xanh).
   - Đưa ra bài mẫu điểm cao (Band 8.5+ Model Answer) và lộ trình khắc phục điểm yếu.
6. **F08 CEFR & Band Mapping**: Quy đổi chuẩn xác giữa IELTS Band (4.0 - 9.0) và Khung tham chiếu CEFR (A1 - C2).
7. **F09 Progress Dashboard**: Biểu đồ mạng nhện (Radar Chart) 6 trục kỹ năng, biểu đồ đường xu hướng phát triển điểm số theo thời gian, chuỗi ngày luyện tập liên tục (Streak).
8. **F10 Teacher Review Module**: Hàng đợi bài làm cần giáo viên chấm lại, giao diện đối chiếu bài làm học viên cạnh kết quả AI, nhập nhận xét và điều chỉnh điểm số.
9. **F11 AI Tutor Chatbot**: Phòng luyện nói tương tác theo vai (Giám khảo IELTS, Phỏng vấn viên Aptis, Bạn giao tiếp tiếng Anh) có hỗ trợ nhận diện giọng nói (Voice Input) và phát âm bản xứ (Text-to-Speech).
10. **F12 Administration & Monitoring**: Quản lý người dùng, thêm câu hỏi mới vào kho đề, giám sát AI Gateway.
