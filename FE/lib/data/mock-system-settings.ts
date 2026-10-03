export type RegistrationStatus = 'OPEN' | 'PAUSED';

export interface SystemSettings {
  systemName: string;
  registrationStatus: RegistrationStatus;
  maintenanceMode: boolean;
  maxPracticeSessions: number;
  aiService: boolean;
  speakingEval: boolean;
  writingEval: boolean;
  cefrEval: boolean;
  systemNotifications: boolean;
  maintenanceNotifications: boolean;
  systemWarnings: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  requireStrongPassword: boolean;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecialChar: boolean;
  twoFactorEnabled: boolean;
  require2FAForAdmin: boolean;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  systemName: 'APTIS AI',
  registrationStatus: 'OPEN',
  maintenanceMode: false,
  maxPracticeSessions: 10,
  aiService: true,
  speakingEval: true,
  writingEval: true,
  cefrEval: true,
  systemNotifications: true,
  maintenanceNotifications: true,
  systemWarnings: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 30,
  requireStrongPassword: true,
  minPasswordLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
  twoFactorEnabled: false,
  require2FAForAdmin: false,
};
