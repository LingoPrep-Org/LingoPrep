export type UserRole = 'LEARNER' | 'TEACHER' | 'ADMIN';
export type ExamType = 'IELTS' | 'APTIS';
export type SkillType = 'SPEAKING' | 'WRITING';
export type SubmissionStatus = 'PENDING' | 'PROCESSING' | 'EVALUATED' | 'REVIEW_REQUESTED' | 'REVIEWED';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  target_exam: string;
  target_score: string;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: number;
  exam_type: ExamType;
  skill: SkillType;
  part: string;
  title: string;
  topic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  instructions?: string;
  image_url?: string;
  prep_time_seconds: number;
  time_limit_seconds: number;
  min_words?: number;
  max_words?: number;
  sample_answer?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
}

export interface InlineFeedbackItem {
  original: string;
  improved: string;
  explanation: string;
  category: string;
}

export interface CriteriaBreakdownItem {
  score: number;
  feedback: string;
}

export interface Assessment {
  id: number;
  submission_id: number;
  overall_band: number;
  overall_cefr: string;
  fluency_score?: number;
  lexical_score?: number;
  grammar_score?: number;
  pronunciation_score?: number;
  task_response_score?: number;
  coherence_score?: number;
  criteria_breakdown?: Record<string, CriteriaBreakdownItem>;
  strengths: string[];
  weaknesses: string[];
  inline_feedback: InlineFeedbackItem[];
  model_answer?: string;
  recommendations: string[];
  evaluated_at: string;
}

export interface TeacherReview {
  id: number;
  submission_id: number;
  teacher_id: number;
  teacher_name?: string;
  overall_band: number;
  overall_cefr: string;
  criteria_scores?: Record<string, number>;
  teacher_notes: string;
  is_overridden: boolean;
  reviewed_at: string;
}

export interface Submission {
  id: number;
  user_id: number;
  question_id: number;
  submission_type: SkillType;
  content_text?: string;
  audio_path?: string;
  duration_seconds: number;
  word_count: number;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
  question?: Question;
  assessment?: Assessment;
  teacher_review?: TeacherReview;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audio_path?: string;
  corrections?: {
    tip: string;
    type: string;
  };
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  persona: 'IELTS_EXAMINER' | 'APTIS_INTERVIEWER' | 'CONVERSATION_PARTNER';
  created_at: string;
  messages: ChatMessage[];
}

export interface SkillRadarItem {
  skill_name: string;
  score: number;
  max_score: number;
}

export interface TrendPoint {
  date: string;
  band: number;
  type: string;
}

export interface LearnerDashboardStats {
  total_submissions: number;
  speaking_count: number;
  writing_count: number;
  average_band: number;
  highest_band: number;
  cefr_level: string;
  current_streak_days: number;
  total_practiced_minutes: number;
  skill_radar: SkillRadarItem[];
  trend_history: TrendPoint[];
  recommended_questions: Question[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
