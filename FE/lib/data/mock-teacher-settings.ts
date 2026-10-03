export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface TeacherSettings {
  theme: ThemeMode;
  language: string;
  notifyNewSubmission: boolean;
  notifyNeedsReview: boolean;
  notifyAIEvaluation: boolean;
  notifySystem: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  theme: 'SYSTEM',
  language: 'vi',
  notifyNewSubmission: true,
  notifyNeedsReview: true,
  notifyAIEvaluation: true,
  notifySystem: true,
  twoFactorEnabled: false,
  sessionTimeout: 30,
};
