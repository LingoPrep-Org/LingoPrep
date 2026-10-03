import type { User, UserRole } from "@/lib/types/user";

export interface AdminStats {
  total_users: number;
  total_questions: number;
  total_submissions: number;
  total_rubrics: number;
  total_ai_profiles: number;
  pending_assessment_jobs: number;
  average_band: number;
  ai_gateway_provider: string;
  gemini_configured: boolean;
  openai_configured: boolean;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AIProfile {
  id: number;
  name: string;
  provider: string;
  model_name: string;
  purpose: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface QuestionApiResponse {
  id: number;
  exam_type: "IELTS" | "APTIS";
  skill: "SPEAKING" | "WRITING";
  part: string;
  title: string;
  topic?: string | null;
  difficulty?: string | null;
  prompt: string;
  is_active: boolean;
  created_at: string;
}

export interface InfraStatus {
  redis: { available: boolean; configured: boolean; error?: string };
  object_storage: { available: boolean; configured: boolean; error?: string };
}

export function toAdminUser(user: AdminUserResponse): User {
  return {
    id: String(user.id),
    name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.is_active ? "ACTIVE" : "LOCKED",
    createdAt: user.created_at,
    lastLogin: null,
  };
}
