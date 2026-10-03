export type Skill = 'SPEAKING' | 'WRITING';
export type SubmissionStatus = 'PROCESSING' | 'AI_REVIEWED' | 'TEACHER_REVIEWED' | 'SUBMITTED';
export type ScoreRange = '7D' | '30D' | '3M';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PROCESSING: 'Đang xử lý',
  AI_REVIEWED: 'Đã đánh giá',
  TEACHER_REVIEWED: 'Đã được giáo viên đánh giá',
  SUBMITTED: 'Đã gửi',
};

export const SCORE_RANGE_LABELS: Record<ScoreRange, string> = {
  '7D': '7 ngày',
  '30D': '30 ngày',
  '3M': '3 tháng',
};

export interface LearnerInfo {
  name: string;
  email: string;
  role: string;
  currentCEFR: string;
  targetCEFR: string;
  joinDate: string;
  speakingPractices: number;
  writingPractices: number;
  speakingAvgScore: number;
  writingAvgScore: number;
  totalPractices: number;
}

export const MOCK_LEARNER: LearnerInfo = {
  name: 'Nguyễn Đức Long',
  email: 'long@example.com',
  role: 'Learner',
  currentCEFR: 'B1',
  targetCEFR: 'B2',
  joinDate: '15/08/2026',
  speakingPractices: 12,
  writingPractices: 12,
  speakingAvgScore: 6.2,
  writingAvgScore: 6.5,
  totalPractices: 24,
};

export interface ScorePoint {
  label: string;
  speaking: number;
  writing: number;
}

export const SCORE_HISTORY_BY_RANGE: Record<ScoreRange, ScorePoint[]> = {
  '7D': [
    { label: 'T2', speaking: 5.5, writing: 5.8 },
    { label: 'T3', speaking: 5.8, writing: 6.0 },
    { label: 'T4', speaking: 6.0, writing: 6.2 },
    { label: 'T5', speaking: 6.0, writing: 6.0 },
    { label: 'T6', speaking: 6.2, writing: 6.5 },
    { label: 'T7', speaking: 6.3, writing: 6.5 },
    { label: 'CN', speaking: 6.5, writing: 6.5 },
  ],
  '30D': [
    { label: 'Tuần 1', speaking: 5.0, writing: 5.5 },
    { label: 'Tuần 2', speaking: 5.5, writing: 5.8 },
    { label: 'Tuần 3', speaking: 6.0, writing: 6.2 },
    { label: 'Tuần 4', speaking: 6.2, writing: 6.5 },
  ],
  '3M': [
    { label: 'T7', speaking: 4.0, writing: 4.5 },
    { label: 'T8', speaking: 5.0, writing: 5.5 },
    { label: 'T9', speaking: 6.2, writing: 6.5 },
  ],
};

export interface RecentSubmission {
  id: string;
  skill: Skill;
  task: string;
  date: string;
  aiScore: number;
  cefr: string;
  status: SubmissionStatus;
}

export const MOCK_RECENT_SUBMISSIONS: RecentSubmission[] = [
  { id: 'rs1', skill: 'SPEAKING', task: 'Task 2', date: '23/09/2026', aiScore: 6.5, cefr: 'B1', status: 'TEACHER_REVIEWED' },
  { id: 'rs2', skill: 'WRITING', task: 'Task 3', date: '22/09/2026', aiScore: 6.0, cefr: 'B1', status: 'AI_REVIEWED' },
  { id: 'rs3', skill: 'SPEAKING', task: 'Task 4', date: '21/09/2026', aiScore: 5.5, cefr: 'A2', status: 'AI_REVIEWED' },
  { id: 'rs4', skill: 'WRITING', task: 'Task 1', date: '20/09/2026', aiScore: 6.5, cefr: 'B1', status: 'AI_REVIEWED' },
  { id: 'rs5', skill: 'SPEAKING', task: 'Task 1', date: '18/09/2026', aiScore: 6.0, cefr: 'B1', status: 'PROCESSING' },
];

export interface AIFeedbackSummary {
  strengths: string[];
  improvements: string[];
}

export const MOCK_AI_FEEDBACK_SUMMARY: AIFeedbackSummary = {
  strengths: ['Vocabulary', 'Task Response'],
  improvements: ['Grammar', 'Fluency'],
};

export interface WeeklyActivity {
  days: { day: string; practiced: boolean }[];
  practicedDays: number;
  totalDays: number;
  speakingSessions: number;
  writingSessions: number;
  totalMinutes: number;
  weeklyGoal: number;
}

export const MOCK_WEEKLY_ACTIVITY: WeeklyActivity = {
  days: [
    { day: 'T2', practiced: true },
    { day: 'T3', practiced: true },
    { day: 'T4', practiced: false },
    { day: 'T5', practiced: true },
    { day: 'T6', practiced: true },
    { day: 'T7', practiced: false },
    { day: 'CN', practiced: false },
  ],
  practicedDays: 4,
  totalDays: 7,
  speakingSessions: 3,
  writingSessions: 2,
  totalMinutes: 95,
  weeklyGoal: 10,
};

export interface QuickAction {
  id: string;
  label: string;
  skill: Skill;
  task: string;
  href: string;
}

export const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa1', label: 'Speaking Task 1', skill: 'SPEAKING', task: 'Task 1', href: '/learner/speaking' },
  { id: 'qa2', label: 'Speaking Task 2', skill: 'SPEAKING', task: 'Task 2', href: '/learner/speaking' },
  { id: 'qa3', label: 'Writing Task 1', skill: 'WRITING', task: 'Task 1', href: '/learner/writing' },
];

export interface LoginHistoryEntry {
  id: string;
  time: string;
  device: string;
  ip: string;
  status: 'success' | 'failed';
}

export const MOCK_LEARNER_LOGIN_HISTORY: LoginHistoryEntry[] = [
  { id: 'lh1', time: '25/09/2026 08:30', device: 'Chrome / Windows', ip: '192.168.1.45', status: 'success' },
  { id: 'lh2', time: '24/09/2026 09:15', device: 'Chrome / Windows', ip: '192.168.1.45', status: 'success' },
  { id: 'lh3', time: '23/09/2026 19:00', device: 'Safari / iPhone', ip: '203.113.152.42', status: 'success' },
  { id: 'lh4', time: '22/09/2026 14:20', device: 'Edge / Windows', ip: '192.168.1.45', status: 'failed' },
  { id: 'lh5', time: '21/09/2026 10:00', device: 'Chrome / Android', ip: '203.113.152.42', status: 'success' },
];

export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface LearnerSettings {
  theme: ThemeMode;
  language: string;
  notifyNewSubmission: boolean;
  notifyAIResult: boolean;
  notifyTeacherReview: boolean;
  notifySystem: boolean;
  twoFactorEnabled: boolean;
}

export const DEFAULT_LEARNER_SETTINGS: LearnerSettings = {
  theme: 'SYSTEM',
  language: 'vi',
  notifyNewSubmission: true,
  notifyAIResult: true,
  notifyTeacherReview: true,
  notifySystem: true,
  twoFactorEnabled: false,
};
