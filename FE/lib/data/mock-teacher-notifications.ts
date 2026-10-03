export type TeacherNotificationCategory =
  | 'NEW_SUBMISSION'
  | 'NEEDS_REVIEW'
  | 'SYSTEM';

export const CATEGORY_LABELS: Record<TeacherNotificationCategory, string> = {
  NEW_SUBMISSION: 'Bài nộp mới',
  NEEDS_REVIEW: 'Cần review',
  SYSTEM: 'Hệ thống',
};

export interface TeacherNotification {
  id: string;
  category: TeacherNotificationCategory;
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel: string;
  actionHref: string;
}

export const MOCK_TEACHER_NOTIFICATIONS: TeacherNotification[] = [
  {
    id: 'tn1',
    category: 'NEW_SUBMISSION',
    title: 'Có bài Speaking mới cần đánh giá',
    description: 'Người học Nguyễn Minh Anh vừa nộp Speaking Task 2.',
    time: '23/09/2026 19:30',
    read: false,
    actionLabel: 'Xem bài',
    actionHref: '/teacher/speaking-review',
  },
  {
    id: 'tn2',
    category: 'NEEDS_REVIEW',
    title: 'Bài Writing cần review',
    description: 'Có bài Writing đang chờ Teacher đánh giá.',
    time: '23/09/2026 18:45',
    read: false,
    actionLabel: 'Xem bài',
    actionHref: '/teacher/writing-review',
  },
  {
    id: 'tn3',
    category: 'NEEDS_REVIEW',
    title: 'AI evaluation hoàn tất',
    description: 'AI đã hoàn thành đánh giá một bài Speaking.',
    time: '23/09/2026 19:32',
    read: false,
    actionLabel: 'Xem kết quả',
    actionHref: '/teacher/speaking-review',
  },
  {
    id: 'tn4',
    category: 'SYSTEM',
    title: 'Thông báo hệ thống',
    description: 'Hệ thống AI sẽ được bảo trì trong thời gian ngắn.',
    time: '23/09/2026 14:00',
    read: true,
    actionLabel: 'Xem chi tiết',
    actionHref: '/teacher/dashboard',
  },
  {
    id: 'tn5',
    category: 'NEW_SUBMISSION',
    title: 'Có bài Writing mới cần đánh giá',
    description: 'Người học Lê Gia Bảo vừa nộp Writing Task 1.',
    time: '23/09/2026 16:10',
    read: false,
    actionLabel: 'Xem bài',
    actionHref: '/teacher/writing-review',
  },
  {
    id: 'tn6',
    category: 'NEEDS_REVIEW',
    title: 'Bài Speaking cần kiểm tra lại',
    description: 'Bài Speaking của Lý Tuấn Kiệt cần Teacher kiểm tra lại.',
    time: '22/09/2026 16:20',
    read: true,
    actionLabel: 'Xem bài',
    actionHref: '/teacher/speaking-review',
  },
  {
    id: 'tn7',
    category: 'SYSTEM',
    title: 'Cập nhật hệ thống hoàn tất',
    description: 'Hệ thống đã cập nhật phiên bản mới thành công.',
    time: '22/09/2026 10:00',
    read: true,
    actionLabel: 'Xem chi tiết',
    actionHref: '/teacher/dashboard',
  },
  {
    id: 'tn8',
    category: 'NEW_SUBMISSION',
    title: 'Có bài Speaking mới cần đánh giá',
    description: 'Người học Đặng Như Quỳnh vừa nộp Speaking Task 4.',
    time: '22/09/2026 20:15',
    read: false,
    actionLabel: 'Xem bài',
    actionHref: '/teacher/speaking-review',
  },
];
