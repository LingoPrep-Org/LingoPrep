import { SCORE_HISTORY_BY_RANGE, type ScoreRange } from '@/lib/data/mock-learner-dashboard';

export type { ScoreRange } from '@/lib/data/mock-learner-dashboard';

export interface PartProgress {
  label: string;
  practices: number;
  avgScore: number;
}

export interface SkillAnalysisItem {
  criterion: string;
  percentage: number;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  href: string;
  cta: string;
}

export interface RecentActivityItem {
  id: string;
  date: string;
  skill: 'SPEAKING' | 'WRITING';
  task: string;
  score: number;
  cefr: string;
}

export interface LearnerProgress {
  currentCEFR: string;
  targetCEFR: string;
  overallProgress: number;
  totalPractices: number;
  speakingPractices: number;
  writingPractices: number;
  speakingAverage: number;
  writingAverage: number;
  weeklyGoal: number;
  weeklyCompleted: number;
}

export const MOCK_LEARNER_PROGRESS: LearnerProgress = {
  currentCEFR: 'B1',
  targetCEFR: 'B2',
  overallProgress: 68,
  totalPractices: 24,
  speakingPractices: 12,
  writingPractices: 12,
  speakingAverage: 6.2,
  writingAverage: 6.5,
  weeklyGoal: 5,
  weeklyCompleted: 3,
};

export const MOCK_SPEAKING_PART_PROGRESS: PartProgress[] = [
  { label: 'Part 1', practices: 4, avgScore: 6.5 },
  { label: 'Part 2', practices: 3, avgScore: 6.2 },
  { label: 'Part 3', practices: 3, avgScore: 5.9 },
  { label: 'Part 4', practices: 2, avgScore: 5.8 },
];

export const MOCK_WRITING_TASK_PROGRESS: PartProgress[] = [
  { label: 'Task 1', practices: 4, avgScore: 6.5 },
  { label: 'Task 2', practices: 3, avgScore: 6.3 },
  { label: 'Task 3', practices: 3, avgScore: 6.4 },
  { label: 'Task 4', practices: 2, avgScore: 6.0 },
];

export const MOCK_SPEAKING_SKILL_ANALYSIS: SkillAnalysisItem[] = [
  { criterion: 'Fluency', percentage: 62 },
  { criterion: 'Vocabulary', percentage: 72 },
  { criterion: 'Grammar', percentage: 65 },
  { criterion: 'Task Response', percentage: 70 },
];

export const MOCK_WRITING_SKILL_ANALYSIS: SkillAnalysisItem[] = [
  { criterion: 'Grammar', percentage: 64 },
  { criterion: 'Vocabulary', percentage: 71 },
  { criterion: 'Coherence', percentage: 68 },
  { criterion: 'Task Response', percentage: 74 },
];

export const MOCK_STRENGTHS: string[] = [
  'Vocabulary',
  'Task Response',
  'Understanding the prompt',
];

export const MOCK_AREAS_TO_IMPROVE: { label: string; href: string }[] = [
  { label: 'Speaking Fluency', href: '/learner/speaking' },
  { label: 'Grammar', href: '/learner/writing' },
  { label: 'Developing ideas', href: '/learner/writing' },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec1',
    title: 'Speaking Part 4',
    reason: 'Điểm trung bình của bạn ở Part 4 thấp hơn các Part khác.',
    href: '/learner/speaking/practice/4',
    cta: 'Luyện Part 4',
  },
  {
    id: 'rec2',
    title: 'Writing Grammar',
    reason: 'Bạn có thể luyện thêm Writing để cải thiện Grammar.',
    href: '/learner/writing',
    cta: 'Luyện Writing',
  },
];

export const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  { id: 'ra1', date: '30/09/2026', skill: 'SPEAKING', task: 'Part 2', score: 6.5, cefr: 'B1' },
  { id: 'ra2', date: '29/09/2026', skill: 'WRITING', task: 'Task 3', score: 7.0, cefr: 'B1+' },
  { id: 'ra3', date: '28/09/2026', skill: 'SPEAKING', task: 'Part 4', score: 5.8, cefr: 'B1' },
  { id: 'ra4', date: '27/09/2026', skill: 'WRITING', task: 'Task 1', score: 6.5, cefr: 'B1' },
  { id: 'ra5', date: '26/09/2026', skill: 'SPEAKING', task: 'Part 1', score: 6.0, cefr: 'B1' },
];

export { SCORE_HISTORY_BY_RANGE };
