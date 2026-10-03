export interface TeacherProfile {
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

export const MOCK_TEACHER_PROFILE: TeacherProfile = {
  name: 'Trần Thị Giáo Viên',
  email: 'teacher@aptis-ai.local',
  role: 'Teacher',
  twoFactorEnabled: false,
};

export interface LoginHistoryEntry {
  id: string;
  time: string;
  device: string;
  ip: string;
  status: 'success' | 'failed';
}

export const MOCK_TEACHER_LOGIN_HISTORY: LoginHistoryEntry[] = [
  { id: 'tlh1', time: '24/09/2026 08:15', device: 'Chrome / Windows', ip: '192.168.1.20', status: 'success' },
  { id: 'tlh2', time: '23/09/2026 09:00', device: 'Edge / Windows', ip: '192.168.1.20', status: 'success' },
  { id: 'tlh3', time: '22/09/2026 14:30', device: 'Safari / macOS', ip: '10.0.0.12', status: 'success' },
  { id: 'tlh4', time: '21/09/2026 16:45', device: 'Chrome / Android', ip: '203.113.152.42', status: 'failed' },
  { id: 'tlh5', time: '20/09/2026 08:00', device: 'Chrome / Windows', ip: '192.168.1.20', status: 'success' },
];
