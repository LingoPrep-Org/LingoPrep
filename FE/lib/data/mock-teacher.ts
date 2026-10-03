export type SubmissionSkill = 'SPEAKING' | 'WRITING';
export type SubmissionTask = 'TASK_1' | 'TASK_2' | 'TASK_3' | 'TASK_4';
export type SubmissionStatus = 'PENDING' | 'IN_PROGRESS' | 'REVIEWED' | 'NEEDS_RECHECK';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PENDING: 'Chờ đánh giá',
  IN_PROGRESS: 'Đang xử lý',
  REVIEWED: 'Đã đánh giá',
  NEEDS_RECHECK: 'Cần kiểm tra lại',
};

export interface Submission {
  id: string;
  learnerName: string;
  skill: SubmissionSkill;
  task: SubmissionTask;
  submittedAt: string;
  aiScore: number;
  cefr: string;
  status: SubmissionStatus;
}

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's001', learnerName: 'Nguyễn Minh Anh', skill: 'SPEAKING', task: 'TASK_2', submittedAt: '23/09/2026 19:30', aiScore: 6.5, cefr: 'B1', status: 'PENDING' },
  { id: 's002', learnerName: 'Nguyễn Hoàng Nam', skill: 'WRITING', task: 'TASK_3', submittedAt: '23/09/2026 18:45', aiScore: 7.0, cefr: 'B2', status: 'NEEDS_RECHECK' },
  { id: 's003', learnerName: 'Trần Thu Hà', skill: 'SPEAKING', task: 'TASK_1', submittedAt: '23/09/2026 17:20', aiScore: 5.5, cefr: 'A2', status: 'PENDING' },
  { id: 's004', learnerName: 'Lê Gia Bảo', skill: 'WRITING', task: 'TASK_1', submittedAt: '23/09/2026 16:10', aiScore: 7.5, cefr: 'B2', status: 'IN_PROGRESS' },
  { id: 's005', learnerName: 'Phạm Thị Lan', skill: 'SPEAKING', task: 'TASK_3', submittedAt: '23/09/2026 15:00', aiScore: 6.0, cefr: 'B1', status: 'REVIEWED' },
  { id: 's006', learnerName: 'Võ Đức Tài', skill: 'WRITING', task: 'TASK_2', submittedAt: '23/09/2026 14:30', aiScore: 8.0, cefr: 'C1', status: 'REVIEWED' },
  { id: 's007', learnerName: 'Đặng Như Quỳnh', skill: 'SPEAKING', task: 'TASK_4', submittedAt: '22/09/2026 20:15', aiScore: 7.0, cefr: 'B2', status: 'PENDING' },
  { id: 's008', learnerName: 'Bùi Thanh Phong', skill: 'WRITING', task: 'TASK_4', submittedAt: '22/09/2026 19:45', aiScore: 6.5, cefr: 'B1', status: 'IN_PROGRESS' },
  { id: 's009', learnerName: 'Hoàng Thị Mai', skill: 'SPEAKING', task: 'TASK_1', submittedAt: '22/09/2026 18:00', aiScore: 5.0, cefr: 'A2', status: 'REVIEWED' },
  { id: 's010', learnerName: 'Ngô Minh Khôi', skill: 'WRITING', task: 'TASK_3', submittedAt: '22/09/2026 17:30', aiScore: 7.5, cefr: 'B2', status: 'PENDING' },
  { id: 's011', learnerName: 'Lý Tuấn Kiệt', skill: 'SPEAKING', task: 'TASK_2', submittedAt: '22/09/2026 16:20', aiScore: 6.0, cefr: 'B1', status: 'NEEDS_RECHECK' },
  { id: 's012', learnerName: 'Phan Thị Hồng', skill: 'WRITING', task: 'TASK_1', submittedAt: '22/09/2026 15:10', aiScore: 8.5, cefr: 'C1', status: 'REVIEWED' },
  { id: 's013', learnerName: 'Đỗ Văn Quang', skill: 'SPEAKING', task: 'TASK_3', submittedAt: '21/09/2026 20:00', aiScore: 7.0, cefr: 'B2', status: 'REVIEWED' },
  { id: 's014', learnerName: 'Dương Thị Vy', skill: 'WRITING', task: 'TASK_2', submittedAt: '21/09/2026 19:15', aiScore: 6.5, cefr: 'B1', status: 'PENDING' },
  { id: 's015', learnerName: 'Cao Hoàng Phúc', skill: 'SPEAKING', task: 'TASK_4', submittedAt: '21/09/2026 18:30', aiScore: 5.5, cefr: 'A2', status: 'IN_PROGRESS' },
  { id: 's016', learnerName: 'Mai Thị Uyên', skill: 'WRITING', task: 'TASK_4', submittedAt: '21/09/2026 17:00', aiScore: 7.0, cefr: 'B2', status: 'PENDING' },
  { id: 's017', learnerName: 'Trịnh Văn Sơn', skill: 'SPEAKING', task: 'TASK_1', submittedAt: '21/09/2026 16:45', aiScore: 6.0, cefr: 'B1', status: 'REVIEWED' },
  { id: 's018', learnerName: 'Âu Thị Yến', skill: 'WRITING', task: 'TASK_3', submittedAt: '20/09/2026 20:30', aiScore: 8.0, cefr: 'C1', status: 'REVIEWED' },
  { id: 's019', learnerName: 'Kiều Văn Zơng', skill: 'SPEAKING', task: 'TASK_2', submittedAt: '20/09/2026 19:00', aiScore: 6.5, cefr: 'B1', status: 'NEEDS_RECHECK' },
  { id: 's020', learnerName: 'Tô Thị Quỳnh', skill: 'WRITING', task: 'TASK_1', submittedAt: '20/09/2026 18:15', aiScore: 7.5, cefr: 'B2', status: 'REVIEWED' },
  { id: 's021', learnerName: 'Hà Văn Nam', skill: 'SPEAKING', task: 'TASK_3', submittedAt: '20/09/2026 17:40', aiScore: 5.0, cefr: 'A2', status: 'PENDING' },
  { id: 's022', learnerName: 'Chu Thị Thảo', skill: 'WRITING', task: 'TASK_2', submittedAt: '20/09/2026 16:20', aiScore: 6.0, cefr: 'B1', status: 'IN_PROGRESS' },
  { id: 's023', learnerName: 'Lương Thị Vy', skill: 'SPEAKING', task: 'TASK_4', submittedAt: '19/09/2026 21:00', aiScore: 7.5, cefr: 'B2', status: 'REVIEWED' },
  { id: 's024', learnerName: 'Thái Văn Xuân', skill: 'WRITING', task: 'TASK_4', submittedAt: '19/09/2026 20:15', aiScore: 7.0, cefr: 'B2', status: 'PENDING' },
];

export const REVIEW_ACTIVITY_DATA = [
  { day: 'T2', reviews: 18 },
  { day: 'T3', reviews: 22 },
  { day: 'T4', reviews: 28 },
  { day: 'T5', reviews: 20 },
  { day: 'T6', reviews: 25 },
  { day: 'T7', reviews: 15 },
  { day: 'CN', reviews: 10 },
];

export interface TeacherDashboardSummary {
  pending: number;
  reviewed: number;
  speaking: number;
  writing: number;
  aiEvaluated: number;
  needsReview: number;
}

export const MOCK_TEACHER_SUMMARY: TeacherDashboardSummary = {
  pending: 24,
  reviewed: 138,
  speaking: 82,
  writing: 56,
  aiEvaluated: 121,
  needsReview: 17,
};
