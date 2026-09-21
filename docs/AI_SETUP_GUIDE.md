# 🧠 Hướng Dẫn Vận Hành & Thiết Lập AI (LingoPrep AI Pipeline Guide)

> **Tài liệu đặc tả kiến trúc, hướng dẫn cài đặt, cấu hình và vận hành hệ thống Trí Tuệ Nhân Tạo (AI) trong nền tảng LingoPrep.**  
> Đáp ứng đầy đủ quy chuẩn thiết kế theo tài liệu [AI task rule.md](file:///a:/Class%20do%20DNTU/LingoPrep/AI%20task%20rule.md).

---

## 📑 Mục Lục
1. [Tổng Quan Kiến Trúc AI Pipeline](#1-tổng-quan-kiến-trúc-ai-pipeline)
2. [Chi Tiết Các Mô Hình AI Sử Dụng](#2-chi-tiết-các-mô-hình-ai-sử-dụng)
3. [Luồng Xử Lý Dual-Stream Speaking (Âm Học & Ngôn Ngữ)](#3-luồng-xử-lý-dual-stream-speaking)
4. [Hướng Dẫn Cài Đặt Từng Bước](#4-hướng-dẫn-cài-đặt-từng-bước)
   - [4.1. Cài đặt và kích hoạt Ollama](#41-cài-đặt-và-kích-hoạt-ollama)
   - [4.2. Cài đặt môi trường Python & Mô hình HuggingFace](#42-cài-đặt-môi-trường-python--mô-hình-huggingface)
   - [4.3. Cấu hình biến môi trường (.env)](#43-cấu-hình-biến-môi-trường-env)
5. [Hướng Dẫn Thử Nghiệm AI (3 Phương Thức)](#5-hướng-dẫn-thử-nghiệm-ai)
   - [5.1. Thử nghiệm qua Giao diện AI Test Studio (/ai-test)](#51-thử-nghiệm-qua-giao-diện-ai-test-studio)
   - [5.2. Chạy bộ kiểm thử tự động PyTest](#52-chạy-bộ-kiểm-thử-tự-động-pytest)
   - [5.3. Thử nghiệm qua cURL / API Client](#53-thử-nghiệm-qua-curl--api-client)
6. [Cơ Chế Dự Phòng Thông Minh (Graceful Fallback)](#6-cơ-chế-dự-phòng-thông-minh-graceful-fallback)
7. [Xử Lý Sự Cố Thường Gặp (Troubleshooting)](#7-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. Tổng Quan Kiến Trúc AI Pipeline

Hệ thống AI của LingoPrep được thiết kế theo mô hình **Hybrid Local-First AI Architecture**, ưu tiên vận hành hoàn toàn trên máy chủ cục bộ (On-Premises / Localhost) để bảo mật dữ liệu âm thanh, không phụ thuộc chi phí token bên ngoài và duy trì độ trễ thấp.

```mermaid
flowchart TB
    subgraph Client["Client (Frontend / Browser)"]
        A1["Audio Recording\n(MediaRecorder WebM/WAV)"]
        A2["Text Input\n(Writing Essay / Chat Message)"]
        A3["TTS Player\n(Mozilla Web Speech API)"]
    end

    subgraph Backend_Gateway["FastAPI Backend (Port 8000)"]
        B1["Audio Caching\n(/api/ai/speaking/cache)"]
        B2["Speaking Evaluator"]
        B3["Writing Evaluator"]
        B4["Tutor Chatbot"]
        B5["TTS Service"]
    end

    subgraph AI_Engine["Local AI Engine"]
        subgraph Stream_A["Stream A: Acoustic Phoneme Analysis"]
            M1["slplab/wav2vec2-large-robust\n-L2-english-phoneme-recognition"]
            M1_Map["Word Alignment &\nARPAbet-to-IPA Mapper"]
        end
        subgraph Stream_B["Stream B: Speech-to-Text"]
            M2["Qwen/Qwen3-ASR-0.6B\n(Pacing WPM & Duration)"]
        end
        subgraph Logic_Engine["Linguistic & Logic Grading"]
            M3["Ollama Local Service\n(qwen3:4b-instruct)"]
        end
    end

    A1 --> B1 --> B2
    B2 --> M1 --> M1_Map --> M3
    B2 --> M2 --> M3
    A2 --> B3 --> M3
    A2 --> B4 --> M3
    M3 --> B2 & B3 & B4
    B5 -. Cung cấp Voice Profile .-> A3
```

---

## 2. Chi Tiết Các Mô Hình AI Sử Dụng

### 2.1. Ollama LLM: `qwen3:4b-instruct`
- **Mục đích:** Xử lý toàn bộ các tác vụ lập luận, đánh giá ngôn ngữ logic, chấm điểm 4 tiêu chí bài thi, phát hiện lỗi sai, đưa ra bài mẫu và trò chuyện tương tác.
- **Cổng mặc định:** `http://localhost:11434`
- **Nhiệm vụ cụ thể:**
  1. **Speaking Assessment:** Tổng hợp văn bản từ ASR và danh sách lỗi âm học từ Wav2Vec2 để chấm điểm *Fluency & Coherence*, *Lexical Resource*, *Grammar Range & Accuracy*, *Pronunciation*, quy đổi Band và CEFR.
  2. **Writing Assessment:** Đánh giá bài luận IELTS Task 1/2 và Aptis Writing theo 4 tiêu chí *Task Response*, *Coherence & Cohesion*, *Lexical Resource*, *Grammar*.
  3. **Text Improvement:** Nâng cấp các đoạn văn từ ngữ điệu cơ bản (B1/B2) lên chuẩn văn phong học thuật cao cấp C1/C2.
  4. **Tutor Chatbot:** Đóng vai 4 Persona riêng biệt (`IELTS_EXAMINER`, `APTIS_INTERVIEWER`, `CONVERSATION_PARTNER`, `GRAMMAR_COACH`) với System Prompt độc lập và cung cấp phản hồi vi mô (Micro-feedback Tips).

### 2.2. Acoustic Phoneme Model: `slplab/wav2vec2-large-robust-L2-english-phoneme-recognition`
- **Nền tảng:** HuggingFace Transformers (PyTorch).
- **Mục đích:** Đánh giá trực tiếp trên tín hiệu sóng âm waveform (16kHz mono), giải mã chuỗi âm vị ARPAbet, phát hiện các âm bị phát âm lỗi (có hậu tố `_err` hoặc `*`).
- **Tính năng nổi bật:**
  - Ánh xạ tự động từ ARPAbet sang chuẩn phiên âm quốc tế **IPA** kèm ví dụ phát âm minh họa.
  - **Word-Level Alignment Algorithm:** Xác định chính xác **từ thứ mấy** trong câu và **vị trí ngữ cảnh** xuất hiện lỗi phát âm (Ví dụ: *"Phát âm sai âm /tʃ/ trong từ 'technology' tại vị trí từ thứ 4"*).

### 2.3. Speech-to-Text Model: `Qwen/Qwen3-ASR-0.6B`
- **Nền tảng:** Qwen ASR Toolkit / Transformers.
- **Mục đích:** Nhận dạng giọng nói tự động (ASR) với độ chính xác cao, trích xuất thời lượng nói và tính toán tốc độ nói **WPM** (Words Per Minute).
- **Xử lý bản ghi không đạt chuẩn:**
  - Nếu file audio rỗng, thời lượng nói quá ngắn (< 0.8s) hoặc chất lượng âm thanh không thể nhận dạng, model sẽ trả về thông điệp tiêu chuẩn:
    > `"không rõ âm thanh hoặc độ dài chưa đủ"`
  - Hệ thống sẽ trả về điểm Band 0.0 kèm thông báo hướng dẫn người dùng thu âm lại rõ ràng hơn thay vì chấm điểm sai lệch.

### 2.4. Text-to-Speech: Mozilla Web Speech API & Edge-TTS
- **Mozilla Web Speech API (`window.speechSynthesis`):** Được ưu tiên chạy trực tiếp trên trình duyệt của người dùng, mang lại giọng đọc bản xứ Anh - Anh (British) và Anh - Mỹ (American) mượt mà, không tốn băng thông máy chủ.
- **Edge-TTS (`edge-tts`):** Mô hình dự phòng phía server tạo file `.mp3` chất lượng cao với các giọng `en-GB-SoniaNeural` và `en-GB-RyanNeural`.

---

## 3. Luồng Xử Lý Dual-Stream Speaking

Quy trình xử lý chấm bài thi nói tuân thủ nghiêm ngặt nguyên lý tách biệt giữa **phân tích âm học (acoustics)** và **phân tích logic ngôn ngữ (linguistics)**:

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Thí Sinh (Browser)
    participant Cache as Audio Cache (/api/ai/speaking/cache)
    participant Evaluator as Speaking Evaluator Engine
    participant StreamA as Stream A (Wav2Vec2 L2 Phoneme)
    participant StreamB as Stream B (Qwen3-ASR-0.6B)
    participant LLM as Ollama (qwen3:4b-instruct)

    Learner->>Cache: Thu âm bài nói & gửi file audio
    Cache-->>Learner: Trả về cache_id & URL phát lại để thí sinh nghe thử
    Learner->>Evaluator: Xác nhận nộp bài (kèm cache_id)
    
    par Xử lý Âm học (Stream A)
        Evaluator->>StreamA: Nạp audio 16kHz mono trực tiếp
        StreamA->>StreamA: Phát hiện âm vị lỗi & căn chỉnh vị trí từ trong câu
        StreamA-->>Evaluator: Tỷ lệ lỗi, điểm âm học & danh sách vị trí lỗi
    and Xử lý Nội dung (Stream B)
        Evaluator->>StreamB: Nhận diện giọng nói ASR & đo WPM
        alt Audio quá ngắn hoặc rè (<0.8s)
            StreamB-->>Evaluator: "không rõ âm thanh hoặc độ dài chưa đủ"
            Evaluator-->>Learner: Trả thông báo yêu cầu thu âm lại (Band 0.0)
        else Audio hợp lệ
            StreamB-->>Evaluator: Transcript hoàn chỉnh, từ vựng, nhịp điệu (WPM)
        end
    end

    Evaluator->>LLM: Tổng hợp [Transcript + WPM + Chi tiết vị trí lỗi âm học]
    LLM->>LLM: Chấm 4 tiêu chí (FC, LR, GRA, PR), gợi ý sửa lỗi & tạo Model Answer
    LLM-->>Evaluator: Cấu trúc JSON chuẩn Band Cambridge/Aptis
    Evaluator-->>Learner: Báo cáo kết quả toàn diện với Radar Chart & Inline Diff
```

---

## 4. Hướng Dẫn Cài Đặt Từng Bước

### 4.1. Cài đặt và kích hoạt Ollama

#### Bước 1: Tải và cài đặt Ollama
- **Windows:** Tải bộ cài đặt `.exe` từ trang chủ chính thức: [https://ollama.com/download/windows](https://ollama.com/download/windows) và cài đặt theo hướng dẫn.
- **macOS / Linux:** Chạy lệnh:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

#### Bước 2: Kéo mô hình `qwen3:4b-instruct`
Mở Terminal / PowerShell và thực hiện lệnh:
```bash
ollama pull qwen3:4b-instruct
```
*(Nếu muốn dùng bản nhẹ hơn hoặc dung lượng máy hạn chế, có thể pull `qwen2.5:3b` hoặc `qwen2.5:7b`).*

#### Bước 3: Kiểm tra dịch vụ Ollama
Đảm bảo dịch vụ Ollama đang chạy trên port `11434`. Kiểm tra bằng trình duyệt hoặc lệnh:
```bash
curl http://localhost:11434/api/tags
```
Kết quả trả về danh sách mô hình có chứa `qwen3:4b-instruct` là thành công.

---

### 4.2. Cài đặt môi trường Python & Mô hình HuggingFace

#### Bước 1: Kích hoạt môi trường ảo Python
Di chuyển vào thư mục `BE/`:
```bash
cd BE
# Nếu chưa có môi trường ảo:
python -m venv venv
# Kích hoạt trên Windows:
venv\Scripts\activate
# Hoặc trên Linux/macOS:
source venv/bin/activate
```

#### Bước 2: Cài đặt thư viện phụ thuộc
Cài đặt toàn bộ danh sách gói:
```bash
pip install -r requirements.txt
```

#### Bước 3: Cài đặt các gói AI nâng cao (PyTorch, Audio & Transformers)
Để kích hoạt trọn vẹn mô hình âm vị HuggingFace và ASR:
```bash
# Đối với máy có GPU NVIDIA (CUDA 12.1):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Đối với máy chạy CPU:
pip install torch torchvision torchaudio

# Cài đặt thư viện xử lý âm thanh và mô hình ngôn ngữ:
pip install transformers librosa soundfile edge-tts numpy
```

---

### 4.3. Cấu hình biến môi trường (`.env`)

Mở tệp `BE/.env` và kiểm tra các thiết lập sau:
```env
PROJECT_NAME="LingoPrep API"
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/lingoprep"
JWT_SECRET_KEY="lingoprep_super_secret_jwt_key_for_development_2026"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]

# Cấu hình AI Engine
AI_PROVIDER="local"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="qwen3:4b-instruct"
UPLOAD_DIR="./uploads"

# Tùy chọn: Khóa API đám mây dự phòng (nếu có)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

---

## 5. Hướng Dẫn Thử Nghiệm AI

Hệ thống cung cấp **3 phương thức kiểm thử** tiện lợi, từ trực quan trên trình duyệt đến kiểm thử tự động.

### 5.1. Thử nghiệm qua Giao diện AI Test Studio

1. Khởi động Backend:
   ```bash
   python run_be.py
   # hoặc chạy:
   ..\start_backend.bat
   ```
2. Mở trình duyệt và truy cập: **`http://localhost:8000/ai-test`**
3. Tại giao diện **LingoPrep AI Studio**:
   - **Thẻ Speaking Dual-Stream:** Bấm nút **"Bắt đầu ghi âm"**, nói một câu tiếng Anh (từ 5-10 giây) rồi bấm **"Dừng ghi âm"**.
   - Bấm **"Nghe lại bản thu"** để kiểm tra tính năng Audio Caching.
   - Bấm **"Chấm điểm Dual-Stream"** để quan sát hệ thống gọi đồng thời Wav2Vec2, Qwen3-ASR và Ollama.
   - **Thẻ Acoustic Phoneme Inspection:** Kiểm tra chi tiết từng token âm vị và các từ bị bắt lỗi.
   - **Thẻ Writing Assessment:** Nhập một bài luận và nhận điểm số 4 tiêu chí kèm bài mẫu Band 8.5+.
   - **Thẻ Academic Paraphraser:** Thử nghiệm nâng cấp câu văn thông thường lên trình độ C1/C2.
   - **Thẻ AI Tutor Chatbot:** Trò chuyện trực tiếp với Giám khảo ảo, hỗ trợ nhận diện giọng nói và đọc bài phát âm.

---

### 5.2. Chạy bộ kiểm thử tự động PyTest

Dự án có sẵn bộ test tích hợp chuyên biệt cho pipeline AI tại `BE/tests/test_ai_pipeline.py`.

Thực hiện lệnh tại thư mục `BE/`:
```bash
pytest tests/test_ai_pipeline.py -v -s
```

**Các kịch bản được tự động kiểm tra:**
- `test_health_check`: Kiểm tra trạng thái máy chủ FastAPI.
- `test_ai_test_html_page`: Kiểm tra giao diện Web Studio hoạt động.
- `test_ollama_service_connectivity`: Kiểm tra kết nối tới Ollama port 11434.
- `test_writing_evaluator`: Kiểm tra thuật toán chấm bài viết trả về Band và tiêu chí hợp lệ.
- `test_tutor_chatbot`: Kiểm tra phản hồi của trợ lý ảo và trích xuất Micro-tips.
- `test_asr_unclear_audio`: Kiểm tra audio quá ngắn (<0.8s) kích hoạt chính xác thông điệp `"không rõ âm thanh hoặc độ dài chưa đủ"`.
- `test_phoneme_word_position_alignment`: Kiểm tra giải thuật định vị từ bị phát âm sai trong câu.
- `test_speaking_dual_stream`: Kiểm tra luồng tích hợp âm học và ngôn ngữ.
- `test_speaking_cache_and_evaluate_endpoints`: Kiểm tra quy trình cache audio và nộp chấm.
- `test_tts_config_and_synthesis`: Kiểm tra cấu hình Mozilla TTS và Edge-TTS.

---

### 5.3. Thử nghiệm qua cURL / API Client

#### Ví dụ 1: Nâng cấp văn phong học thuật (Academic Paraphraser)
```bash
curl -X POST "http://localhost:8000/api/ai/writing/improve" \
     -H "Content-Type: application/json" \
     -d "{\"text\": \"I think that spending money on space exploration is a bad idea.\"}"
```

#### Ví dụ 2: Luyện nói với AI Tutor
```bash
curl -X POST "http://localhost:8000/api/ai/chat" \
     -H "Content-Type: application/json" \
     -d "{\"persona\": \"IELTS_EXAMINER\", \"message\": \"Hello, I am ready for the interview.\", \"message_history\": []}"
```

#### Ví dụ 3: Lấy cấu hình Mozilla Web Speech API
```bash
curl -X GET "http://localhost:8000/api/ai/tts/config?voice_profile=ielts_examiner_british_female"
```

---

## 6. Cơ Chế Dự Phòng Thông Minh (Graceful Fallback)

Để đảm bảo hệ thống **không bao giờ bị dừng hoạt động (crash) trong môi trường sản phẩm**, LingoPrep được trang bị cơ chế tự phục hồi đa tầng:

| Tình Huống | Cơ Chế Dự Phòng Tự Động |
|:---|:---|
| **Ollama chưa mở hoặc máy chưa cài model** | Hệ thống tự động chuyển tiếp sang **Advanced Rule-based NLP Heuristic Engine**, phân tích độ dài bài, cấu trúc ngữ pháp (mệnh đề phụ thuộc, liên từ học thuật, từ nối) và trả về điểm số tương thích khung CEFR. |
| **Mô hình Wav2Vec2 chưa tải xong trọng số** | Hệ thống kích hoạt bộ lọc âm học Waveform Acoustic Signal trích xuất Zero-Crossing Rate (ZCR) và Spectral Centroid để phát hiện các âm khó (âm xát, âm tắc xát /θ/, /tʃ/) nhằm duy trì tính năng chỉ điểm vị trí lỗi phát âm. |
| **Bản ghi âm quá ngắn hoặc rè** | Tự động trả về thông báo tiêu chuẩn `"không rõ âm thanh hoặc độ dài chưa đủ"`, gán Band 0.0 và hướng dẫn thí sinh thu âm lại thay vì làm sai lệch lịch sử điểm. |
| **Server TTS (Edge-TTS) gặp lỗi mạng** | Frontend tự động chuyển sang sử dụng trực tiếp **Mozilla Web Speech API** tích hợp sẵn trên trình duyệt Chrome/Edge/Safari. |

---

## 7. Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Lỗi kết nối Ollama: `Failed to connect to localhost:11434`
- **Nguyên nhân:** Dịch vụ Ollama chưa được bật trên máy tính.
- **Khắc phục:** Mở Terminal và gõ lệnh `ollama serve`. Sau đó kiểm tra lại bằng lệnh `curl http://localhost:11434`.

### 2. Mô hình tải chậm hoặc máy bị đơ khi chấm bài
- **Nguyên nhân:** Mô hình `qwen3:4b-instruct` đang chạy hoàn toàn trên CPU hoặc RAM không đủ.
- **Khắc phục:**
  - Nếu máy có GPU NVIDIA, kiểm tra xem CUDA đã được bật chưa (`nvidia-smi`).
  - Có thể chuyển sang mô hình dung lượng nhẹ hơn bằng cách sửa file `BE/.env`:
    ```env
    OLLAMA_MODEL="qwen2.5:3b"
    ```
    và chạy `ollama pull qwen2.5:3b`.

### 3. Trình duyệt không thu được âm thanh khi test
- **Nguyên nhân:** Trình duyệt chưa được cấp quyền truy cập Microphone.
- **Khắc phục:** Bấm vào biểu tượng ổ khóa/cài đặt cạnh thanh địa chỉ URL trên trình duyệt và chọn **Cho phép (Allow) Microphone**.

### 4. Thông báo: `"không rõ âm thanh hoặc độ dài chưa đủ"`
- **Nguyên nhân:** Thời lượng thu âm dưới 1 giây hoặc micro không thu được tiếng nói.
- **Khắc phục:** Đảm bảo nói to, rõ ràng và thu âm ít nhất từ 5 giây trở lên.
