export type DateRange = 'TODAY' | '7D' | '30D' | '3M';

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  TODAY: 'Hôm nay',
  '7D': '7 ngày',
  '30D': '30 ngày',
  '3M': '3 tháng',
};

export interface ReportSummary {
  registeredUsers: number;
  practiceSessions: number;
  speakingSessions: number;
  writingSessions: number;
  aiEvaluations: number;
  systemErrorRate: string;
}

export const REPORT_SUMMARIES: Record<DateRange, ReportSummary> = {
  TODAY: {
    registeredUsers: 18,
    practiceSessions: 342,
    speakingSessions: 186,
    writingSessions: 156,
    aiEvaluations: 268,
    systemErrorRate: '0,6%',
  },
  '7D': {
    registeredUsers: 86,
    practiceSessions: 2104,
    speakingSessions: 1120,
    writingSessions: 984,
    aiEvaluations: 1547,
    systemErrorRate: '0,7%',
  },
  '30D': {
    registeredUsers: 245,
    practiceSessions: 8642,
    speakingSessions: 4821,
    writingSessions: 3821,
    aiEvaluations: 6321,
    systemErrorRate: '0,8%',
  },
  '3M': {
    registeredUsers: 712,
    practiceSessions: 24108,
    speakingSessions: 13240,
    writingSessions: 10868,
    aiEvaluations: 18642,
    systemErrorRate: '0,9%',
  },
};

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DualChartPoint {
  label: string;
  speaking: number;
  writing: number;
}

export interface ErrorChartPoint {
  label: string;
  api: number;
  ai: number;
  system: number;
}

export const USER_GROWTH_BY_RANGE: Record<DateRange, ChartPoint[]> = {
  TODAY: [
    { label: '00:00', value: 1198 },
    { label: '04:00', value: 1201 },
    { label: '08:00', value: 1210 },
    { label: '12:00', value: 1228 },
    { label: '16:00', value: 1237 },
    { label: '20:00', value: 1245 },
  ],
  '7D': [
    { label: 'T2', value: 1198 },
    { label: 'T3', value: 1208 },
    { label: 'T4', value: 1215 },
    { label: 'T5', value: 1222 },
    { label: 'T6', value: 1231 },
    { label: 'T7', value: 1239 },
    { label: 'CN', value: 1245 },
  ],
  '30D': [
    { label: '01', value: 1020 },
    { label: '05', value: 1078 },
    { label: '10', value: 1132 },
    { label: '15', value: 1186 },
    { label: '20', value: 1212 },
    { label: '25', value: 1231 },
    { label: '30', value: 1245 },
  ],
  '3M': [
    { label: 'T1', value: 820 },
    { label: 'T2', value: 932 },
    { label: 'T3', value: 1015 },
    { label: 'T4', value: 1098 },
    { label: 'T5', value: 1167 },
    { label: 'T6', value: 1245 },
  ],
};

export const PRACTICE_ACTIVITY_BY_RANGE: Record<DateRange, DualChartPoint[]> = {
  TODAY: [
    { label: '00:00', speaking: 12, writing: 8 },
    { label: '04:00', speaking: 6, writing: 4 },
    { label: '08:00', speaking: 28, writing: 22 },
    { label: '12:00', speaking: 45, writing: 38 },
    { label: '16:00', speaking: 52, writing: 44 },
    { label: '20:00', speaking: 43, writing: 40 },
  ],
  '7D': [
    { label: 'T2', speaking: 180, writing: 150 },
    { label: 'T3', speaking: 195, writing: 165 },
    { label: 'T4', speaking: 210, writing: 178 },
    { label: 'T5', speaking: 188, writing: 160 },
    { label: 'T6', speaking: 165, writing: 140 },
    { label: 'T7', speaking: 120, writing: 98 },
    { label: 'CN', speaking: 62, writing: 93 },
  ],
  '30D': [
    { label: '01', speaking: 142, writing: 118 },
    { label: '05', speaking: 158, writing: 130 },
    { label: '10', speaking: 172, writing: 145 },
    { label: '15', speaking: 165, writing: 138 },
    { label: '20', speaking: 180, writing: 152 },
    { label: '25', speaking: 168, writing: 140 },
    { label: '30', speaking: 186, writing: 158 },
  ],
  '3M': [
    { label: 'T1', speaking: 1820, writing: 1520 },
    { label: 'T2', speaking: 2150, writing: 1780 },
    { label: 'T3', speaking: 2480, writing: 2050 },
    { label: 'T4', speaking: 2310, writing: 1920 },
    { label: 'T5', speaking: 2640, writing: 2180 },
    { label: 'T6', speaking: 1840, writing: 1418 },
  ],
};

export interface SkillUsage {
  totalSessions: number;
  completedSessions: number;
  aiEvaluations: number;
  avgProcessingTime: string;
}

export const SPEAKING_USAGE_BY_RANGE: Record<DateRange, SkillUsage> = {
  TODAY: { totalSessions: 186, completedSessions: 172, aiEvaluations: 168, avgProcessingTime: '2,1 giây' },
  '7D': { totalSessions: 1120, completedSessions: 1042, aiEvaluations: 1015, avgProcessingTime: '2,3 giây' },
  '30D': { totalSessions: 4821, completedSessions: 4510, aiEvaluations: 4380, avgProcessingTime: '2,2 giây' },
  '3M': { totalSessions: 13240, completedSessions: 12480, aiEvaluations: 12110, avgProcessingTime: '2,4 giây' },
};

export const WRITING_USAGE_BY_RANGE: Record<DateRange, SkillUsage> = {
  TODAY: { totalSessions: 156, completedSessions: 148, aiEvaluations: 100, avgProcessingTime: '4,8 giây' },
  '7D': { totalSessions: 984, completedSessions: 932, aiEvaluations: 532, avgProcessingTime: '4,6 giây' },
  '30D': { totalSessions: 3821, completedSessions: 3640, aiEvaluations: 1941, avgProcessingTime: '4,9 giây' },
  '3M': { totalSessions: 10868, completedSessions: 10320, aiEvaluations: 6532, avgProcessingTime: '4,7 giây' },
};

export interface AIUsage {
  totalRequests: number;
  speakingRequests: number;
  writingRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: string;
}

export const AI_USAGE_BY_RANGE: Record<DateRange, AIUsage> = {
  TODAY: { totalRequests: 268, speakingRequests: 168, writingRequests: 100, successfulRequests: 262, failedRequests: 6, avgResponseTime: '820 ms' },
  '7D': { totalRequests: 1547, speakingRequests: 1015, writingRequests: 532, successfulRequests: 1531, failedRequests: 16, avgResponseTime: '835 ms' },
  '30D': { totalRequests: 6321, speakingRequests: 4380, writingRequests: 1941, successfulRequests: 6258, failedRequests: 63, avgResponseTime: '842 ms' },
  '3M': { totalRequests: 18642, speakingRequests: 12110, writingRequests: 6532, successfulRequests: 18480, failedRequests: 162, avgResponseTime: '848 ms' },
};

export const AI_REQUESTS_BY_RANGE: Record<DateRange, ChartPoint[]> = {
  TODAY: [
    { label: '00:00', value: 12 },
    { label: '04:00', value: 6 },
    { label: '08:00', value: 28 },
    { label: '12:00', value: 45 },
    { label: '16:00', value: 52 },
    { label: '20:00', value: 43 },
  ],
  '7D': [
    { label: 'T2', value: 198 },
    { label: 'T3', value: 215 },
    { label: 'T4', value: 232 },
    { label: 'T5', value: 208 },
    { label: 'T6', value: 185 },
    { label: 'T7', value: 142 },
    { label: 'CN', value: 82 },
  ],
  '30D': [
    { label: '01', value: 168 },
    { label: '05', value: 182 },
    { label: '10', value: 198 },
    { label: '15', value: 192 },
    { label: '20', value: 210 },
    { label: '25', value: 195 },
    { label: '30', value: 218 },
  ],
  '3M': [
    { label: 'T1', value: 2150 },
    { label: 'T2', value: 2480 },
    { label: 'T3', value: 2820 },
    { label: 'T4', value: 2610 },
    { label: 'T5', value: 2980 },
    { label: 'T6', value: 2082 },
  ],
};

export const SYSTEM_ERRORS_BY_RANGE: Record<DateRange, ErrorChartPoint[]> = {
  TODAY: [
    { label: '00:00', api: 1, ai: 0, system: 0 },
    { label: '04:00', api: 0, ai: 1, system: 0 },
    { label: '08:00', api: 2, ai: 1, system: 1 },
    { label: '12:00', api: 3, ai: 2, system: 1 },
    { label: '16:00', api: 2, ai: 1, system: 0 },
    { label: '20:00', api: 1, ai: 1, system: 0 },
  ],
  '7D': [
    { label: 'T2', api: 8, ai: 5, system: 2 },
    { label: 'T3', api: 10, ai: 6, system: 3 },
    { label: 'T4', api: 12, ai: 8, system: 3 },
    { label: 'T5', api: 9, ai: 7, system: 2 },
    { label: 'T6', api: 7, ai: 4, system: 1 },
    { label: 'T7', api: 5, ai: 3, system: 1 },
    { label: 'CN', api: 3, ai: 2, system: 0 },
  ],
  '30D': [
    { label: '01', api: 18, ai: 12, system: 5 },
    { label: '05', api: 22, ai: 15, system: 6 },
    { label: '10', api: 25, ai: 18, system: 7 },
    { label: '15', api: 20, ai: 14, system: 5 },
    { label: '20', api: 28, ai: 20, system: 8 },
    { label: '25', api: 24, ai: 16, system: 6 },
    { label: '30', api: 30, ai: 22, system: 9 },
  ],
  '3M': [
    { label: 'T1', api: 82, ai: 58, system: 22 },
    { label: 'T2', api: 95, ai: 68, system: 25 },
    { label: 'T3', api: 108, ai: 78, system: 30 },
    { label: 'T4', api: 92, ai: 65, system: 24 },
    { label: 'T5', api: 115, ai: 82, system: 32 },
    { label: 'T6', api: 88, ai: 62, system: 21 },
  ],
};
