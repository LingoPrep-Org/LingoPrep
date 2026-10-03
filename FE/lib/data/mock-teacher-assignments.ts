import type { QuestionSkill, QuestionTask } from '@/lib/data/mock-question-bank';

export type AssignmentStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang hoạt động',
  COMPLETED: 'Đã kết thúc',
};

export interface Assignment {
  id: string;
  name: string;
  description: string;
  skill: QuestionSkill;
  task: QuestionTask;
  questionId: string;
  questionContent: string;
  learnerIds: string[];
  startDate: string;
  dueDate: string;
  duration: number;
  status: AssignmentStatus;
  totalLearners: number;
  submittedCount: number;
}

export interface AssignmentSubmission {
  id: string;
  learnerName: string;
  status: 'SUBMITTED' | 'NOT_SUBMITTED' | 'IN_PROGRESS';
  score: number | null;
  cefr: string | null;
  submittedAt: string | null;
  skill: QuestionSkill;
}

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a001',
    name: 'Speaking Task 2 — Daily Life',
    description: 'Luyện tập mô tả hoạt động đáng nhớ với bạn bè.',
    skill: 'SPEAKING',
    task: 'TASK_2',
    questionId: 'q002',
    questionContent: 'Miêu tả một người bạn thân của bạn và lý do bạn quý mến người đó.',
    learnerIds: ['sp1', 'sp3', 'sp5', 'sp7'],
    startDate: '20/09/2026',
    dueDate: '27/09/2026',
    duration: 15,
    status: 'ACTIVE',
    totalLearners: 4,
    submittedCount: 2,
  },
  {
    id: 'a002',
    name: 'Writing Task 3 — Technology & Education',
    description: 'Thảo luận về tác động của công nghệ đến giáo dục.',
    skill: 'WRITING',
    task: 'TASK_3',
    questionId: 'q007',
    questionContent: 'Thảo luận về tầm quan trọng của giáo dục môi trường trong trường học.',
    learnerIds: ['sp2', 'sp4', 'sp6'],
    startDate: '18/09/2026',
    dueDate: '25/09/2026',
    duration: 40,
    status: 'ACTIVE',
    totalLearners: 3,
    submittedCount: 1,
  },
  {
    id: 'a003',
    name: 'Speaking Task 1 — Self Introduction',
    description: 'Giới thiệu bản thân bao gồm tên, tuổi và nơi ở.',
    skill: 'SPEAKING',
    task: 'TASK_1',
    questionId: 'q001',
    questionContent: 'Hãy giới thiệu về bản thân bạn, bao gồm tên, tuổi và nơi ở hiện tại.',
    learnerIds: ['sp3', 'sp7', 'sp9'],
    startDate: '15/09/2026',
    dueDate: '22/09/2026',
    duration: 10,
    status: 'COMPLETED',
    totalLearners: 3,
    submittedCount: 3,
  },
  {
    id: 'a004',
    name: 'Writing Task 1 — Email Writing',
    description: 'Viết email mời bạn bè tham gia tiệc sinh nhật.',
    skill: 'WRITING',
    task: 'TASK_1',
    questionId: 'q005',
    questionContent: 'Viết một email cho bạn bè để mời họ tham gia buổi tiệc sinh nhật của bạn.',
    learnerIds: ['sp1', 'sp5', 'sp8'],
    startDate: '22/09/2026',
    dueDate: '29/09/2026',
    duration: 30,
    status: 'DRAFT',
    totalLearners: 3,
    submittedCount: 0,
  },
  {
    id: 'a005',
    name: 'Speaking Task 4 — Social Media',
    description: 'Thảo luận về tác động của mạng xã hội đến xã hội.',
    skill: 'SPEAKING',
    task: 'TASK_4',
    questionId: 'q004',
    questionContent: 'Một số người cho rằng mạng xã hội có tác động tiêu cực đến xã hội. Bạn đồng ý hay không đồng ý?',
    learnerIds: ['sp2', 'sp6', 'sp10'],
    startDate: '21/09/2026',
    dueDate: '28/09/2026',
    duration: 20,
    status: 'ACTIVE',
    totalLearners: 3,
    submittedCount: 1,
  },
  {
    id: 'a006',
    name: 'Writing Task 2 — Complaint Letter',
    description: 'Viết thư phàn nàn về dịch vụ kém tại nhà hàng.',
    skill: 'WRITING',
    task: 'TASK_2',
    questionId: 'q006',
    questionContent: 'Viết một lá thư phàn nàn về dịch vụ kém tại một nhà hàng và yêu cầu đền bù.',
    learnerIds: ['sp4', 'sp8'],
    startDate: '10/09/2026',
    dueDate: '17/09/2026',
    duration: 35,
    status: 'COMPLETED',
    totalLearners: 2,
    submittedCount: 2,
  },
  {
    id: 'a007',
    name: 'Speaking Task 3 — Hometown',
    description: 'Miêu tả quê hương bao gồm cảnh quan và con người.',
    skill: 'SPEAKING',
    task: 'TASK_2',
    questionId: 'q009',
    questionContent: 'Hãy miêu tả quê hương bạn, bao gồm cảnh quan và con người tại đó.',
    learnerIds: ['sp1', 'sp5', 'sp9'],
    startDate: '23/09/2026',
    dueDate: '30/09/2026',
    duration: 15,
    status: 'DRAFT',
    totalLearners: 3,
    submittedCount: 0,
  },
  {
    id: 'a008',
    name: 'Writing Task 4 — AI & Jobs',
    description: 'Viết bài luận về tác động của AI đến thị trường lao động.',
    skill: 'WRITING',
    task: 'TASK_4',
    questionId: 'q011',
    questionContent: 'Viết bài luận về tác động của trí tuệ nhân tạo đối với thị trường lao động.',
    learnerIds: ['sp6', 'sp10'],
    startDate: '19/09/2026',
    dueDate: '26/09/2026',
    duration: 45,
    status: 'ACTIVE',
    totalLearners: 2,
    submittedCount: 0,
  },
];

export const MOCK_ASSIGNMENT_SUBMISSIONS: Record<string, AssignmentSubmission[]> = {
  a001: [
    { id: 'as1', learnerName: 'Nguyễn Minh Anh', status: 'SUBMITTED', score: 6.5, cefr: 'B1', submittedAt: '23/09/2026 19:30', skill: 'SPEAKING' },
    { id: 'as2', learnerName: 'Trần Thu Hà', status: 'SUBMITTED', score: 5.5, cefr: 'A2', submittedAt: '22/09/2026 17:20', skill: 'SPEAKING' },
    { id: 'as3', learnerName: 'Phạm Thị Lan', status: 'NOT_SUBMITTED', score: null, cefr: null, submittedAt: null, skill: 'SPEAKING' },
    { id: 'as4', learnerName: 'Đặng Như Quỳnh', status: 'NOT_SUBMITTED', score: null, cefr: null, submittedAt: null, skill: 'SPEAKING' },
  ],
  a002: [
    { id: 'as5', learnerName: 'Nguyễn Hoàng Nam', status: 'SUBMITTED', score: 7.0, cefr: 'B2', submittedAt: '23/09/2026 18:45', skill: 'WRITING' },
    { id: 'as6', learnerName: 'Lê Gia Bảo', status: 'IN_PROGRESS', score: null, cefr: null, submittedAt: null, skill: 'WRITING' },
    { id: 'as7', learnerName: 'Võ Đức Tài', status: 'NOT_SUBMITTED', score: null, cefr: null, submittedAt: null, skill: 'WRITING' },
  ],
};

export const DEFAULT_SUBMISSIONS: AssignmentSubmission[] = [
  { id: 'ds1', learnerName: 'Nguyễn Minh Anh', status: 'SUBMITTED', score: 6.5, cefr: 'B1', submittedAt: '23/09/2026 19:30', skill: 'SPEAKING' },
  { id: 'ds2', learnerName: 'Trần Thu Hà', status: 'NOT_SUBMITTED', score: null, cefr: null, submittedAt: null, skill: 'SPEAKING' },
];

export const MOCK_LEARNER_OPTIONS = [
  { id: 'sp1', name: 'Nguyễn Minh Anh' },
  { id: 'sp2', name: 'Nguyễn Hoàng Nam' },
  { id: 'sp3', name: 'Trần Thu Hà' },
  { id: 'sp4', name: 'Lê Gia Bảo' },
  { id: 'sp5', name: 'Phạm Thị Lan' },
  { id: 'sp6', name: 'Võ Đức Tài' },
  { id: 'sp7', name: 'Đặng Như Quỳnh' },
  { id: 'sp8', name: 'Bùi Thanh Phong' },
  { id: 'sp9', name: 'Hoàng Thị Mai' },
  { id: 'sp10', name: 'Ngô Minh Khôi' },
];

export const ASSIGNMENT_SUMMARY = {
  total: 8,
  active: 3,
  completed: 2,
  submissions: 9,
};
