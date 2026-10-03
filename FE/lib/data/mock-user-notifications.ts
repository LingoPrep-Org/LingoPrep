import type { Role } from '@/lib/auth/types';

export type NotificationType =
  | 'SYSTEM'
  | 'ASSIGNMENT'
  | 'SUBMISSION'
  | 'AI_RESULT'
  | 'TEACHER_REVIEW'
  | 'AI_JOB'
  | 'ACCOUNT'
  | 'WARNING';

export type NotificationPriority = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  recipientRole: Role;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: NotificationPriority;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  SYSTEM: 'Hệ thống',
  ASSIGNMENT: 'Bài tập',
  SUBMISSION: 'Bài nộp',
  AI_RESULT: 'Kết quả AI',
  TEACHER_REVIEW: 'Giáo viên đánh giá',
  AI_JOB: 'Xử lý AI',
  ACCOUNT: 'Tài khoản',
  WARNING: 'Cảnh báo',
};

export const PRIORITY_STYLES: Record<NotificationPriority, string> = {
  info: 'border-primary/20 bg-primary/10 text-primary',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
};

export const PRIORITY_DOT: Record<NotificationPriority, string> = {
  info: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

export const TYPE_ICON_BG: Record<NotificationType, string> = {
  SYSTEM: 'bg-muted',
  ASSIGNMENT: 'bg-primary/10',
  SUBMISSION: 'bg-primary/10',
  AI_RESULT: 'bg-chart-5/10',
  TEACHER_REVIEW: 'bg-success/10',
  AI_JOB: 'bg-warning/10',
  ACCOUNT: 'bg-primary/10',
  WARNING: 'bg-destructive/10',
};

export const MOCK_LEARNER_NOTIFICATIONS: Notification[] = [
  {
    id: 'ln1',
    recipientRole: 'LEARNER',
    type: 'ASSIGNMENT',
    title: 'Bài tập mới',
    message: 'Bạn có bài Speaking Part 2 mới.',
    createdAt: '01/10/2026 09:00',
    read: false,
    actionUrl: '/learner/assignments/asg2',
    actionLabel: 'Xem bài tập',
    priority: 'info',
  },
  {
    id: 'ln2',
    recipientRole: 'LEARNER',
    type: 'AI_RESULT',
    title: 'AI đã đánh giá bài',
    message: 'Bài Writing Task 3 đã có kết quả.',
    createdAt: '29/09/2026 14:35',
    read: false,
    actionUrl: '/learner/submissions/sub-wr3',
    actionLabel: 'Xem kết quả',
    priority: 'success',
  },
  {
    id: 'ln3',
    recipientRole: 'LEARNER',
    type: 'TEACHER_REVIEW',
    title: 'Giáo viên đã đánh giá',
    message: 'Giáo viên đã gửi feedback cho Speaking Part 2.',
    createdAt: '01/10/2026 10:15',
    read: false,
    actionUrl: '/learner/submissions/sub-sp2',
    actionLabel: 'Xem phản hồi',
    priority: 'success',
  },
  {
    id: 'ln4',
    recipientRole: 'LEARNER',
    type: 'AI_JOB',
    title: 'Bài đang được xử lý',
    message: 'Bài Speaking Part 1 của bạn đang được AI xử lý.',
    createdAt: '28/09/2026 18:05',
    read: true,
    actionUrl: '/learner/submissions/sub-sp1',
    actionLabel: 'Xem trạng thái',
    priority: 'warning',
  },
  {
    id: 'ln5',
    recipientRole: 'LEARNER',
    type: 'SYSTEM',
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ bảo trì vào 23:00 hôm nay.',
    createdAt: '01/10/2026 08:00',
    read: true,
    priority: 'info',
  },
];

export const MOCK_TEACHER_NOTIFICATIONS_V2: Notification[] = [
  {
    id: 'tn1v',
    recipientRole: 'TEACHER',
    type: 'SUBMISSION',
    title: 'Bài nộp mới',
    message: 'Nguyễn Minh Anh đã nộp Writing Task 3.',
    createdAt: '01/10/2026 19:30',
    read: false,
    actionUrl: '/teacher/writing-review',
    actionLabel: 'Xem bài nộp',
    priority: 'info',
  },
  {
    id: 'tn2v',
    recipientRole: 'TEACHER',
    type: 'TEACHER_REVIEW',
    title: 'Yêu cầu review',
    message: 'Một Learner đã yêu cầu bạn đánh giá bài.',
    createdAt: '01/10/2026 18:45',
    read: false,
    actionUrl: '/teacher/submissions',
    actionLabel: 'Xem yêu cầu',
    priority: 'warning',
  },
  {
    id: 'tn3v',
    recipientRole: 'TEACHER',
    type: 'AI_RESULT',
    title: 'AI đánh giá hoàn tất',
    message: 'AI đã hoàn thành đánh giá một bài Speaking cần Teacher Review.',
    createdAt: '01/10/2026 17:00',
    read: false,
    actionUrl: '/teacher/speaking-review',
    actionLabel: 'Xem kết quả',
    priority: 'info',
  },
  {
    id: 'tn4v',
    recipientRole: 'TEACHER',
    type: 'SYSTEM',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống đã cập nhật phiên bản mới.',
    createdAt: '30/09/2026 10:00',
    read: true,
    priority: 'info',
  },
  {
    id: 'tn5v',
    recipientRole: 'TEACHER',
    type: 'SUBMISSION',
    title: 'Bài nộp mới',
    message: 'Đặng Như Quỳnh đã nộp Speaking Part 4.',
    createdAt: '30/09/2026 20:15',
    read: false,
    actionUrl: '/teacher/speaking-review',
    actionLabel: 'Xem bài nộp',
    priority: 'info',
  },
];

export const MOCK_ADMIN_NOTIFICATIONS: Notification[] = [
  {
    id: 'an1',
    recipientRole: 'ADMIN',
    type: 'ACCOUNT',
    title: 'Teacher registration',
    message: 'Có tài khoản Teacher đang chờ duyệt.',
    createdAt: '01/10/2026 11:00',
    read: false,
    actionUrl: '/admin/users',
    actionLabel: 'Xem tài khoản',
    priority: 'warning',
  },
  {
    id: 'an2',
    recipientRole: 'ADMIN',
    type: 'WARNING',
    title: 'System warning',
    message: 'AI Service đang có tỷ lệ lỗi tăng cao.',
    createdAt: '01/10/2026 10:30',
    read: false,
    actionUrl: '/admin/monitoring',
    actionLabel: 'Xem monitoring',
    priority: 'error',
  },
  {
    id: 'an3',
    recipientRole: 'ADMIN',
    type: 'SYSTEM',
    title: 'System maintenance',
    message: 'Hệ thống sẽ bảo trì lúc 23:00 hôm nay.',
    createdAt: '01/10/2026 08:00',
    read: false,
    actionUrl: '/admin/system-notifications',
    actionLabel: 'Xem chi tiết',
    priority: 'info',
  },
  {
    id: 'an4',
    recipientRole: 'ADMIN',
    type: 'WARNING',
    title: 'AI service recovery',
    message: 'AI Service đã phục hồi sau sự cố.',
    createdAt: '30/09/2026 22:00',
    read: true,
    actionUrl: '/admin/monitoring',
    actionLabel: 'Xem monitoring',
    priority: 'success',
  },
  {
    id: 'an5',
    recipientRole: 'ADMIN',
    type: 'SYSTEM',
    title: 'New feature deployed',
    message: 'Tính năng Notification System đã được triển khai.',
    createdAt: '30/09/2026 14:00',
    read: true,
    priority: 'info',
  },
];

export function getNotificationsByRole(role: Role): Notification[] {
  switch (role) {
    case 'ADMIN':
      return MOCK_ADMIN_NOTIFICATIONS;
    case 'TEACHER':
      return MOCK_TEACHER_NOTIFICATIONS_V2;
    case 'LEARNER':
      return MOCK_LEARNER_NOTIFICATIONS;
    default:
      return [];
  }
}
