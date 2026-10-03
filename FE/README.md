# LingoPrep Frontend

Frontend của LingoPrep được xây dựng bằng **Next.js 13 App Router**, React và TypeScript. Ứng dụng có ba khu vực theo vai trò: quản trị viên, giáo viên và người học.

## Yêu cầu

- Node.js 20 trở lên
- npm
- Backend LingoPrep đang chạy tại URL có thể truy cập từ trình duyệt

## Chạy local

```bash
cd FE
npm ci
```

Tạo `FE/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Giá trị này là origin của backend; FE tự nối thêm `/api` khi gọi API. Khởi động ứng dụng:

```bash
npm run dev
```

Mở <http://localhost:3000>. Backend mặc định chạy ở <http://localhost:8000>; tài liệu API ở <http://localhost:8000/docs>.

## Lệnh thường dùng

```bash
npm run dev        # Chạy Next.js ở chế độ phát triển
npm run build      # Tạo production build
npm run start      # Chạy production server (mặc định cổng 3000)
npm run typecheck  # Kiểm tra TypeScript
npm run lint       # Chạy Next.js ESLint
```

## Chạy bằng Docker Compose

Từ thư mục gốc repository:

```bash
docker compose up --build
```

FE được publish tại <http://localhost:5173>. Docker build nhận API origin qua biến `NEXT_PUBLIC_API_URL`; mặc định là `http://localhost:8000`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 docker compose up --build
```

`NEXT_PUBLIC_API_URL` được đóng gói vào JavaScript khi build. Nếu người dùng mở web từ máy khác, hãy đặt biến này thành địa chỉ backend mà trình duyệt của họ truy cập được, sau đó build lại image. Không dùng tên service Docker như `backend` cho biến này vì request được thực hiện từ trình duyệt người dùng.

## Các khu vực giao diện

| Vai trò | Đường dẫn chính | Chức năng |
| --- | --- | --- |
| Quản trị viên | `/admin/dashboard` | Tổng quan hệ thống |
|  | `/admin/users` | Quản lý tài khoản |
|  | `/admin/question-bank` | Ngân hàng câu hỏi |
|  | `/admin/ai-configuration` | Cấu hình AI |
|  | `/admin/monitoring`, `/admin/reports`, `/admin/notifications`, `/admin/settings` | Giám sát, báo cáo và cài đặt |
| Giáo viên | `/teacher/dashboard` | Tổng quan bài nộp |
|  | `/teacher/assignments` | Tạo và quản lý bài kiểm tra |
|  | `/teacher/submissions` | Hàng đợi bài nộp |
|  | `/teacher/writing-review?submissionId={id}` | Review bài Writing |
|  | `/teacher/speaking-review?submissionId={id}` | Review bài Speaking |
|  | `/teacher/student-progress`, `/teacher/notifications`, `/teacher/profile`, `/teacher/settings` | Tiến độ và tài khoản giáo viên |
| Người học | `/learner/dashboard` | Tổng quan luyện tập |
|  | `/learner/speaking`, `/learner/writing` | Luyện Speaking và Writing |
|  | `/learner/assignments`, `/learner/submissions` | Bài được giao và lịch sử bài nộp |
|  | `/learner/progress`, `/learner/feedback`, `/learner/notifications` | Tiến độ và phản hồi |

Trang `/login` dùng để đăng nhập. Sau khi xác thực, người dùng được chuyển tới dashboard theo vai trò.

## Cấu trúc mã nguồn

```text
FE/
├── app/                 # Route và layout theo Next.js App Router
│   ├── admin/            # Màn hình quản trị
│   ├── learner/          # Màn hình người học
│   └── teacher/          # Màn hình giáo viên
├── components/           # Layout, component dùng chung và UI primitives
├── hooks/                # React hooks dùng chung
├── lib/
│   ├── auth/              # Auth context và phiên đăng nhập
│   ├── axios/             # Axios client, JWT và refresh token
│   └── navigation.ts      # Điều hướng theo vai trò
└── services/              # Client API và kiểu dữ liệu theo module
```

Chi tiết quy ước phát triển và tích hợp API xem [Instruction.md](./Instruction.md).
