export interface LearnerDashboardResponse {
  total_submissions: number;
  speaking_count: number;
  writing_count: number;
  average_band: number;
  highest_band: number;
  cefr_level: string;
  current_streak_days: number;
  total_practiced_minutes: number;
  skill_radar: { skill_name: string; score: number; max_score: number }[];
  trend_history: { date: string; band: number; type: string }[];
  recommended_questions: LearnerQuestionResponse[];
}

export interface LearnerProgressResponse {
  total_practices: number;
  speaking_practices: number;
  writing_practices: number;
  average_band: number;
  speaking_average: number;
  writing_average: number;
  current_cefr: string;
  target_cefr: string;
  overall_progress: number;
  trend_history: { date: string; band: number; type: string }[];
  speaking_parts: { label: string; practices: number; avg_score: number }[];
  writing_tasks: { label: string; practices: number; avg_score: number }[];
  speaking_skill_analysis: { criterion: string; percentage: number }[];
  writing_skill_analysis: { criterion: string; percentage: number }[];
  recent_activity: {
    id: number;
    skill: "SPEAKING" | "WRITING";
    part: string;
    score: number;
    cefr: string;
    created_at: string;
  }[];
  weekly_activity: {
    date: string;
    practiced: number;
    speaking: number;
    writing: number;
    total_minutes: number;
  }[];
  weekly_completed: number;
  weekly_goal: number;
}

export interface LearnerQuestionResponse {
  id: number;
  exam_type: string;
  skill: "SPEAKING" | "WRITING";
  part: string;
  title: string;
  topic?: string | null;
  difficulty?: string | null;
  prompt: string;
  is_active: boolean;
  created_at: string;
}

import type { UnifiedSubmission } from "@/lib/data/mock-assignments";

export function toUnifiedSubmission(
  item: LearnerSubmissionResponse,
): UnifiedSubmission {
  const task = item.question?.part ?? "Task 1";
  return {
    id: String(item.id),
    skill: item.submission_type,
    task,
    taskNumber: Number(task.match(/\d+/)?.[0] ?? 1),
    title: item.question?.title ?? `${item.submission_type} submission`,
    submittedAt: new Date(item.created_at).toLocaleString("vi-VN"),
    status: item.teacher_review
      ? "TEACHER_REVIEWED"
      : item.assessment
        ? "AI_REVIEWED"
        : "PROCESSING",
    aiScore: item.assessment?.overall_band,
    cefr: item.assessment?.overall_cefr,
    rubric: [],
    aiFeedback: {
      strengths: item.assessment?.strengths ?? [],
      improvements: item.assessment?.weaknesses ?? [],
      suggestions: item.assessment?.recommendations ?? [],
    },
    teacherReview: item.teacher_review
      ? {
          reviewed: true,
          teacherScore: item.teacher_review.overall_band,
          teacherCEFR: item.teacher_review.overall_cefr,
          feedback: item.teacher_review.teacher_notes,
        }
      : { reviewed: false },
    writingContent: item.content_text ?? undefined,
    wordCount: item.word_count,
    audioPath: item.audio_path ?? undefined,
    audioDuration: item.duration_seconds
      ? `${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, "0")}`
      : undefined,
  };
}

export interface LearnerSubmissionResponse {
  id: number;
  user_id: number;
  question_id: number;
  submission_type: "SPEAKING" | "WRITING";
  content_text?: string | null;
  audio_path?: string | null;
  duration_seconds: number;
  word_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  question?: LearnerQuestionResponse | null;
  assessment?: {
    overall_band: number;
    overall_cefr: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null;
  teacher_review?: {
    overall_band: number;
    overall_cefr: string;
    teacher_notes: string;
  } | null;
}

export interface SubmissionCreatedResponse extends LearnerSubmissionResponse {}

export interface LearnerNotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface LearnerAssignmentResponse {
  id: number;
  question_id: number;
  title: string;
  skill: "SPEAKING" | "WRITING";
  part: string;
  task_number: number;
  description: string;
  teacher_name: string;
  assigned_at: string;
  deadline?: string | null;
  duration: string;
  status: string;
  progress: number;
  submission_id?: number | null;
}

import type { Assignment, AssignmentStatus } from "@/lib/data/mock-assignments";

export function toAssignment(item: LearnerAssignmentResponse): Assignment {
  const status: AssignmentStatus =
    item.status === "SUBMITTED" ? "SUBMITTED" : "NOT_STARTED";
  return {
    id: String(item.id),
    title: item.title,
    skill: item.skill,
    task: item.part,
    taskNumber: item.task_number,
    description: item.description,
    teacherName: item.teacher_name,
    assignedAt: new Date(item.assigned_at).toLocaleDateString("vi-VN"),
    deadline: item.deadline
      ? new Date(item.deadline).toLocaleDateString("vi-VN")
      : null,
    duration: item.duration,
    status,
    progress: item.progress,
    submissionId: item.submission_id ? String(item.submission_id) : undefined,
  };
}
