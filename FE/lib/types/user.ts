export type UserRole = 'ADMIN' | 'TEACHER' | 'LEARNER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'LOCKED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string | null;
  appliedAt?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Quản trị viên',
  TEACHER: 'Giáo viên',
  LEARNER: 'Người học',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: 'Chờ xử lý',
  ACTIVE: 'Hoạt động',
  LOCKED: 'Bị khóa',
  REJECTED: 'Từ chối',
};
