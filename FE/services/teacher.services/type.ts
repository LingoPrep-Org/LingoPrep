import type {
  SubmissionSkill,
  SubmissionStatus,
  SubmissionTask,
} from "@/lib/data/mock-teacher";

export interface TeacherSubmissionResponse {
  id: number;
  user_id: number;
  user_name?: string | null;
  question_id: number;
  submission_type: SubmissionSkill;
  content_text?: string | null;
  audio_path?: string | null;
  duration_seconds: number;
  word_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  question?: {
    part: string;
    title: string;
    topic?: string;
    prompt: string;
  } | null;
  assessment?: {
    overall_band: number;
    overall_cefr: string;
    fluency_score?: number | null;
    lexical_score?: number | null;
    grammar_score?: number | null;
    pronunciation_score?: number | null;
    task_response_score?: number | null;
    coherence_score?: number | null;
    criteria_breakdown?: Record<string, unknown> | null;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    evaluated_at?: string;
  } | null;
  teacher_review?: {
    overall_band: number;
    overall_cefr: string;
    teacher_notes?: string;
    reviewed_at?: string;
  } | null;
}

export interface TeacherReviewPayload {
  overall_band: number;
  overall_cefr: string;
  criteria_scores?: Record<string, unknown>;
  teacher_notes: string;
}

export interface TeacherNotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface TeacherStudentProgressResponse {
  id: number;
  name: string;
  email: string;
  joined_at: string;
  total_submissions: number;
  speaking_count: number;
  writing_count: number;
  speaking_score: number;
  writing_score: number;
  average_band: number;
  cefr: string;
  status: "PRACTICING" | "IMPROVING" | "NEEDS_IMPROVEMENT";
}

export interface TeacherAssignmentResponse {
  id: number;
  question_id: number;
  name: string;
  description: string;
  skill: "SPEAKING" | "WRITING";
  part: string;
  question_content: string;
  learner_ids: number[];
  learner_names: string[];
  start_date: string;
  due_date?: string | null;
  duration: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  total_learners: number;
  submitted_count: number;
}

export interface TeacherAssignmentPayload {
  question_id: number;
  name: string;
  description: string;
  learner_ids: number[];
  start_date: string;
  due_date: string | null;
  duration: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
}

export interface TeacherQuestionResponse {
  id: number;
  skill: "SPEAKING" | "WRITING";
  part: string;
  title: string;
  topic?: string | null;
  prompt: string;
  is_active?: boolean;
}

export interface TeacherAssignmentSubmissionResponse {
  id: number;
  learner_id: number;
  learner_name: string;
  status: string;
  score?: number | null;
  cefr?: string | null;
  submitted_at?: string | null;
  skill: "SPEAKING" | "WRITING";
}

export interface TeacherSubmission {
  id: string;
  learnerName: string;
  skill: SubmissionSkill;
  task: SubmissionTask;
  submittedAt: string;
  aiScore: number;
  cefr: string;
  status: SubmissionStatus;
}

export function toTeacherSubmission(
  item: TeacherSubmissionResponse,
): TeacherSubmission {
  const normalizedStatus: SubmissionStatus =
    item.status === "REVIEWED"
      ? "REVIEWED"
      : item.status === "REVIEW_REQUESTED"
        ? "NEEDS_RECHECK"
        : item.status === "PROCESSING"
          ? "IN_PROGRESS"
          : "PENDING";
  const task = (item.question?.part ?? "TASK 1")
    .toUpperCase()
    .replace("PART", "TASK")
    .replace(" ", "_") as SubmissionTask;

  return {
    id: String(item.id),
    learnerName: item.user_name || `Người học #${item.user_id}`,
    skill: item.submission_type,
    task,
    submittedAt: new Date(item.created_at).toLocaleString("vi-VN"),
    aiScore: item.assessment?.overall_band ?? 0,
    cefr: item.assessment?.overall_cefr ?? "N/A",
    status: normalizedStatus,
  };
}
