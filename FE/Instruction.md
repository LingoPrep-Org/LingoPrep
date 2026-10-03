# Hướng dẫn phát triển Frontend

Tài liệu dành cho thành viên phát triển và bảo trì FE. Ứng dụng hiện dùng Next.js 13 App Router; các hướng dẫn Vite/React cũ không còn áp dụng.

## 1. Công nghệ và cấu trúc

- Next.js 13, React 18, TypeScript.
- Tailwind CSS; component UI theo phong cách shadcn/Radix nằm trong `components/ui`.
- Axios làm HTTP client; các service theo vai trò nằm trong `services/`.
- App Router tổ chức route trong `app/`; component cần state hoặc browser API phải là Client Component (`"use client"`).

```text
app/                       Route và layout
  admin/                   Chức năng quản trị viên
  learner/                 Chức năng người học
  teacher/                 Chức năng giáo viên
components/layout/         Layout, sidebar, header, RoleGuard
components/ui/             UI primitives
hooks/                     React hooks dùng chung
lib/auth/                  Auth context và kiểu người dùng
lib/axios/axios.ts         Axios instance, JWT và refresh token
lib/data/                  Dữ liệu fixture/mock còn được dùng ở một số màn hình
lib/navigation.ts          Menu và route theo vai trò
services/*                 Các hàm gọi API và kiểu request/response
```

## 2. Cài đặt và chạy

Từ thư mục `FE`:

```bash
npm ci
```

Tạo file `.env.local` ở `FE/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Đây là origin của backend. Axios tự thêm `/api`, vì vậy không thêm `/api` vào giá trị biến môi trường.

```bash
npm run dev       # Next dev server tại http://localhost:3000
npm run typecheck # TypeScript, không phát sinh build
npm run lint      # Next.js ESLint
npm run build     # Production build
npm run start     # Production server, mặc định cổng 3000
```

Backend cần chạy để các màn hình dùng API có dữ liệu. Tài liệu Swagger mặc định ở `http://localhost:8000/docs`.

## 3. Docker

Từ thư mục gốc dự án:

```bash
docker compose up --build
```

FE được truy cập tại `http://localhost:5173`; container chạy Next production server ở cổng `5173`. Compose truyền `NEXT_PUBLIC_API_URL` vào **thời điểm build**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 docker compose up --build
```

Giá trị phải là địa chỉ backend mà trình duyệt người dùng có thể truy cập. Trong môi trường production, thay `localhost` bằng hostname/IP backend. Vì biến `NEXT_PUBLIC_*` được đóng gói vào frontend lúc build, phải build lại image sau khi đổi giá trị.

`FE/.dockerignore` loại dependency và output build ở máy phát triển khỏi build context. Dockerfile dùng `npm ci`, nên cập nhật dependency cần cập nhật cả `package.json` và `package-lock.json`.

## 4. Route và quyền truy cập

| Nhóm | Route | Mục đích |
| --- | --- | --- |
| Chung | `/`, `/login` | Chuyển hướng theo phiên và đăng nhập |
| Admin | `/admin/dashboard` | Tổng quan |
| Admin | `/admin/users` | Người dùng và trạng thái tài khoản |
| Admin | `/admin/question-bank` | Ngân hàng câu hỏi |
| Admin | `/admin/ai-configuration` | Cấu hình AI |
| Admin | `/admin/monitoring`, `/admin/reports` | Giám sát và báo cáo |
| Admin | `/admin/notifications`, `/admin/profile`, `/admin/settings` | Thông báo và tài khoản |
| Teacher | `/teacher/dashboard` | Tổng quan bài nộp |
| Teacher | `/teacher/assignments` | CRUD bài kiểm tra và xem người học được giao |
| Teacher | `/teacher/submissions` | Hàng đợi bài nộp |
| Teacher | `/teacher/writing-review?submissionId={id}` | Chi tiết/review Writing |
| Teacher | `/teacher/speaking-review?submissionId={id}` | Chi tiết/review Speaking |
| Teacher | `/teacher/student-progress` | Tiến độ người học |
| Teacher | `/teacher/notifications`, `/teacher/profile`, `/teacher/settings` | Thông báo và tài khoản |
| Learner | `/learner/dashboard` | Tổng quan luyện tập |
| Learner | `/learner/speaking`, `/learner/writing` | Luyện theo kỹ năng |
| Learner | `/learner/assignments`, `/learner/assignments/{id}` | Bài được giao |
| Learner | `/learner/submissions`, `/learner/submissions/{id}` | Lịch sử và chi tiết bài nộp |
| Learner | `/learner/writing/practice/{taskId}`, `/learner/writing/result/{submissionId}` | Làm bài và kết quả Writing |
| Learner | `/learner/speaking/practice/{taskId}` | Làm bài Speaking |
| Learner | `/learner/feedback`, `/learner/progress` | Feedback và tiến độ |
| Learner | `/learner/notifications`, `/learner/profile`, `/learner/settings` | Thông báo và tài khoản |

Các layout role dùng `RoleGuard` để ngăn truy cập nhầm vai trò ở giao diện. Backend vẫn phải tự kiểm tra quyền cho từng API; không xem `RoleGuard` là cơ chế bảo mật duy nhất.

## 5. Đăng nhập và gọi API

`AuthProvider` trong `lib/auth/auth-context.tsx` khôi phục phiên bằng refresh token. Thông tin người dùng lưu trong `localStorage` với key `aptis-auth`; access/refresh token lần lượt lưu ở `access_token` và `refresh_token`.

`lib/axios/axios.ts` tạo Axios instance có base URL:

```text
${NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api
```

Request interceptor tự gắn Bearer access token. Nếu API trả `401`, response interceptor thử refresh một lần; refresh thất bại sẽ xóa phiên và đưa người dùng về login.

Khi thêm API:

1. Thêm/điều chỉnh interface request và response trong `services/<module>/type.ts`.
2. Thêm hàm HTTP trong `services/<module>/<module>.services.ts`, dùng `axiosInstance`.
3. Gọi service từ page hoặc hook; xử lý loading, lỗi, empty state và thông báo thành công/thất bại.
4. Sau mutation, cập nhật state từ response của backend hoặc tải lại dữ liệu. Không chỉ sửa state local rồi báo lưu thành công.
5. Kiểm tra endpoint backend, auth requirement, enum và định dạng ngày trong Swagger trước khi ghép UI.

### Các service hiện có

- `services/auth.services`: login và refresh (`/auth/login`, `/auth/refresh`).
- `services/learner.services`: dashboard, tiến độ, câu hỏi, bài được giao, submission, feedback/notification.
- `services/teacher.services`: hàng đợi review, submission chi tiết, teacher review, bài kiểm tra CRUD, người học/tiến độ và notifications.
- `services/admin.services`: thống kê, user, câu hỏi, AI profiles và trạng thái hạ tầng.

Các endpoint chi tiết và payload chuẩn được định nghĩa ở backend Swagger (`/docs`) và tài liệu API trong `docs/API_DOCUMENTATION.md` ở thư mục gốc.

## 6. Quy ước khi sửa giao diện

- Dùng `Link` của Next.js cho điều hướng nội bộ; dùng `useRouter` khi cần điều hướng sau mutation.
- Giữ các trang theo App Router: `app/<role>/<route>/page.tsx`; layout role ở `app/<role>/layout.tsx`.
- Tái sử dụng component trong `components/layout`, `components/shared`, `components/ui`; dùng `cn` từ `lib/utils` để ghép class Tailwind.
- Đặt nhãn, thông báo và trạng thái theo tiếng Việt đang dùng trong sản phẩm; enum gửi backend cần giữ đúng giá trị API.
- Tránh đưa secret vào biến `NEXT_PUBLIC_*`; các biến này xuất hiện trong bundle phía trình duyệt.
- Một số màn hình vẫn import dữ liệu từ `lib/data/mock-*`. Khi mở rộng/chỉnh tính năng, kiểm tra nguồn dữ liệu thực tế của đúng màn hình; chỉ các screen đã được nối service mới tự đồng bộ với backend.
- Với review teacher, URL cần có `submissionId`; dùng ID submission do API trả về, không dùng question ID.

## 7. Luồng tính năng chính

### Người học

1. Đăng nhập và được chuyển đến dashboard theo role.
2. Chọn câu hỏi hoặc bài được giao.
3. Làm Writing hoặc Speaking; FE gửi kết quả qua learner service.
4. Xem submission, feedback AI và lịch sử từ API tương ứng.

### Giáo viên

1. Tạo bài kiểm tra ở `/teacher/assignments`, chọn câu hỏi và người học.
2. Xem danh sách bài nộp ở `/teacher/submissions`.
3. Mở review qua URL có `submissionId`, xem nội dung và kết quả AI.
4. Gửi teacher review bằng API.

## 8. Xử lý sự cố thường gặp

| Hiện tượng | Kiểm tra |
| --- | --- |
| Request gọi nhầm `localhost:8080` | Đặt `NEXT_PUBLIC_API_URL=http://localhost:8000`; với Docker phải truyền build arg và build lại |
| Browser báo CORS | Cấu hình `CORS_ORIGINS` backend chứa origin của FE, ví dụ `http://localhost:5173` hoặc `http://localhost:3000` |
| API trả `401` liên tục | Xác nhận token/refresh token, thời gian sống JWT và URL backend |
| API trả `403` | Tài khoản sai role hoặc backend không cho phép thao tác |
| Route review không có bài | Mở review qua danh sách để URL có `?submissionId=<submission id>` |
| Docker build báo thiếu package/khác lockfile | Đồng bộ package manifest và lockfile, sau đó chạy `npm ci` local để xác nhận lockfile |
| Build lỗi TypeScript | Chạy `npm run typecheck`, xử lý lỗi trước khi đóng image |

