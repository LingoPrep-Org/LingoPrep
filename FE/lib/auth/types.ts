export type Role = "ADMIN" | "TEACHER" | "LEARNER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  LEARNER: "Người học",
};

export const ROLE_HOMES: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  LEARNER: "/learner/dashboard",
};
