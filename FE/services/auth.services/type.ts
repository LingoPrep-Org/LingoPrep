export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "LEARNER" | "ADMIN" | "TEACHER";
  target_exam: "IELTS" | "TOEIC" | "JLPT" | string;
  target_score: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}
