export type ProgressStatus = 'PRACTICING' | 'IMPROVING' | 'NEEDS_IMPROVEMENT';

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  PRACTICING: 'Đang luyện tập',
  IMPROVING: 'Có tiến bộ',
  NEEDS_IMPROVEMENT: 'Cần cải thiện',
};

export interface StudentProgress {
  id: string;
  name: string;
  email: string;
  speakingScore: number;
  writingScore: number;
  cefr: string;
  totalSubmissions: number;
  lastPractice: string;
  status: ProgressStatus;
  joinDate: string;
}

export const MOCK_STUDENT_PROGRESS: StudentProgress[] = [
  { id: 'sp1', name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', speakingScore: 6.5, writingScore: 6.0, cefr: 'B1', totalSubmissions: 18, lastPractice: '23/09/2026 19:30', status: 'IMPROVING', joinDate: '15/08/2026' },
  { id: 'sp2', name: 'Nguyễn Hoàng Nam', email: 'hoangnam@example.com', speakingScore: 7.0, writingScore: 7.5, cefr: 'B2', totalSubmissions: 24, lastPractice: '23/09/2026 18:45', status: 'IMPROVING', joinDate: '02/08/2026' },
  { id: 'sp3', name: 'Trần Thu Hà', email: 'thuha@example.com', speakingScore: 5.5, writingScore: 5.0, cefr: 'A2', totalSubmissions: 8, lastPractice: '23/09/2026 17:20', status: 'NEEDS_IMPROVEMENT', joinDate: '10/09/2026' },
  { id: 'sp4', name: 'Lê Gia Bảo', email: 'giabao@example.com', speakingScore: 6.0, writingScore: 7.0, cefr: 'B1', totalSubmissions: 15, lastPractice: '23/09/2026 16:10', status: 'PRACTICING', joinDate: '20/08/2026' },
  { id: 'sp5', name: 'Phạm Thị Lan', email: 'thilan@example.com', speakingScore: 6.0, writingScore: 5.5, cefr: 'B1', totalSubmissions: 12, lastPractice: '23/09/2026 15:00', status: 'PRACTICING', joinDate: '25/08/2026' },
  { id: 'sp6', name: 'Võ Đức Tài', email: 'ductai@example.com', speakingScore: 7.5, writingScore: 8.0, cefr: 'C1', totalSubmissions: 30, lastPractice: '22/09/2026 20:15', status: 'IMPROVING', joinDate: '01/08/2026' },
  { id: 'sp7', name: 'Đặng Như Quỳnh', email: 'nhuquynh@example.com', speakingScore: 5.0, writingScore: 5.5, cefr: 'A2', totalSubmissions: 6, lastPractice: '22/09/2026 18:00', status: 'NEEDS_IMPROVEMENT', joinDate: '15/09/2026' },
  { id: 'sp8', name: 'Bùi Thanh Phong', email: 'thanhphong@example.com', speakingScore: 6.5, writingScore: 6.5, cefr: 'B1', totalSubmissions: 14, lastPractice: '22/09/2026 19:45', status: 'PRACTICING', joinDate: '05/09/2026' },
  { id: 'sp9', name: 'Hoàng Thị Mai', email: 'thimai@example.com', speakingScore: 5.5, writingScore: 6.0, cefr: 'A2', totalSubmissions: 10, lastPractice: '21/09/2026 20:00', status: 'NEEDS_IMPROVEMENT', joinDate: '12/09/2026' },
  { id: 'sp10', name: 'Ngô Minh Khôi', email: 'minhkhoi@example.com', speakingScore: 7.0, writingScore: 7.5, cefr: 'B2', totalSubmissions: 22, lastPractice: '22/09/2026 17:30', status: 'IMPROVING', joinDate: '03/08/2026' },
];

export type ScoreRange = '7D' | '30D' | '3M';

export const SCORE_RANGE_LABELS: Record<ScoreRange, string> = {
  '7D': '7 ngày',
  '30D': '30 ngày',
  '3M': '3 tháng',
};

export interface ScorePoint {
  label: string;
  speaking: number;
  writing: number;
}

export const SCORE_HISTORY_BY_RANGE: Record<ScoreRange, ScorePoint[]> = {
  '7D': [
    { label: 'T2', speaking: 5.5, writing: 5.0 },
    { label: 'T3', speaking: 5.8, writing: 5.2 },
    { label: 'T4', speaking: 6.0, writing: 5.5 },
    { label: 'T5', speaking: 6.0, writing: 5.8 },
    { label: 'T6', speaking: 6.2, writing: 6.0 },
    { label: 'T7', speaking: 6.3, writing: 6.0 },
    { label: 'CN', speaking: 6.5, writing: 6.0 },
  ],
  '30D': [
    { label: '01', speaking: 5.0, writing: 4.5 },
    { label: '05', speaking: 5.2, writing: 4.8 },
    { label: '10', speaking: 5.5, writing: 5.0 },
    { label: '15', speaking: 5.8, writing: 5.5 },
    { label: '20', speaking: 6.2, writing: 5.8 },
    { label: '25', speaking: 6.3, writing: 6.0 },
    { label: '30', speaking: 6.5, writing: 6.0 },
  ],
  '3M': [
    { label: 'T7', speaking: 4.0, writing: 4.0 },
    { label: 'T8', speaking: 5.0, writing: 4.5 },
    { label: 'T9', speaking: 5.8, writing: 5.2 },
    { label: 'T9-2', speaking: 6.5, writing: 6.0 },
  ],
};

export interface CEFRProgressionEntry {
  cefr: string;
  date: string;
}

export interface StudentDetail {
  student: StudentProgress;
  totalPracticeSessions: number;
  cefrProgression: CEFRProgressionEntry[];
  cefrUpdated: string;
  strengths: string[];
  weaknesses: string[];
}

export const MOCK_STUDENT_DETAILS: Record<string, StudentDetail> = {
  sp1: {
    student: MOCK_STUDENT_PROGRESS[0],
    totalPracticeSessions: 25,
    cefrProgression: [
      { cefr: 'A2', date: '15/08/2026' },
      { cefr: 'A2', date: '01/09/2026' },
      { cefr: 'B1', date: '15/09/2026' },
      { cefr: 'B1', date: '23/09/2026' },
    ],
    cefrUpdated: '23/09/2026',
    strengths: ['Vocabulary', 'Task Response', 'Coherence'],
    weaknesses: ['Grammar', 'Fluency', 'Pronunciation'],
  },
};

export const DEFAULT_STUDENT_DETAIL: StudentDetail = {
  student: MOCK_STUDENT_PROGRESS[0],
  totalPracticeSessions: 25,
  cefrProgression: [
    { cefr: 'A2', date: '15/08/2026' },
    { cefr: 'B1', date: '01/09/2026' },
    { cefr: 'B1', date: '15/09/2026' },
    { cefr: 'B2', date: '23/09/2026' },
  ],
  cefrUpdated: '23/09/2026',
  strengths: ['Vocabulary', 'Task Response', 'Coherence'],
  weaknesses: ['Grammar', 'Fluency', 'Pronunciation'],
};

export type PracticeStatus = 'AI_REVIEWED' | 'TEACHER_REVIEWED' | 'PENDING_REVIEW';

export const PRACTICE_STATUS_LABELS: Record<PracticeStatus, string> = {
  AI_REVIEWED: 'AI đã đánh giá',
  TEACHER_REVIEWED: 'Teacher đã đánh giá',
  PENDING_REVIEW: 'Đang chờ review',
};

export interface PracticeHistoryEntry {
  id: string;
  date: string;
  skill: 'SPEAKING' | 'WRITING';
  task: string;
  score: number;
  cefr: string;
  evaluation: string;
  status: PracticeStatus;
}

export const MOCK_PRACTICE_HISTORY: PracticeHistoryEntry[] = [
  { id: 'ph1', date: '23/09/2026', skill: 'SPEAKING', task: 'Task 2', score: 6.5, cefr: 'B1', evaluation: 'AI + Teacher', status: 'TEACHER_REVIEWED' },
  { id: 'ph2', date: '22/09/2026', skill: 'WRITING', task: 'Task 1', score: 6.0, cefr: 'B1', evaluation: 'AI', status: 'AI_REVIEWED' },
  { id: 'ph3', date: '21/09/2026', skill: 'SPEAKING', task: 'Task 1', score: 6.0, cefr: 'B1', evaluation: 'AI', status: 'AI_REVIEWED' },
  { id: 'ph4', date: '20/09/2026', skill: 'WRITING', task: 'Task 3', score: 5.5, cefr: 'A2', evaluation: 'AI', status: 'PENDING_REVIEW' },
  { id: 'ph5', date: '18/09/2026', skill: 'SPEAKING', task: 'Task 3', score: 5.8, cefr: 'A2', evaluation: 'AI', status: 'AI_REVIEWED' },
  { id: 'ph6', date: '15/09/2026', skill: 'WRITING', task: 'Task 2', score: 5.5, cefr: 'A2', evaluation: 'AI + Teacher', status: 'TEACHER_REVIEWED' },
  { id: 'ph7', date: '12/09/2026', skill: 'SPEAKING', task: 'Task 4', score: 5.5, cefr: 'A2', evaluation: 'AI', status: 'AI_REVIEWED' },
  { id: 'ph8', date: '10/09/2026', skill: 'WRITING', task: 'Task 1', score: 5.0, cefr: 'A2', evaluation: 'AI', status: 'AI_REVIEWED' },
];
