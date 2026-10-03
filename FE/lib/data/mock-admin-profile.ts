export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

export const MOCK_ADMIN_PROFILE: AdminProfile = {
  name: 'Nguyễn Văn Admin',
  email: 'admin@aptis-ai.local',
  role: 'System Administrator',
  twoFactorEnabled: true,
};

export interface LoginHistoryEntry {
  id: string;
  time: string;
  device: string;
  ip: string;
  status: 'success' | 'failed';
}

export const MOCK_LOGIN_HISTORY: LoginHistoryEntry[] = [
  {
    id: 'lh1',
    time: '23/09/2026 20:15',
    device: 'Chrome / Windows',
    ip: '192.168.1.10',
    status: 'success',
  },
  {
    id: 'lh2',
    time: '23/09/2026 08:30',
    device: 'Edge / Windows',
    ip: '192.168.1.10',
    status: 'success',
  },
  {
    id: 'lh3',
    time: '22/09/2026 19:45',
    device: 'Safari / macOS',
    ip: '10.0.0.5',
    status: 'success',
  },
  {
    id: 'lh4',
    time: '22/09/2026 14:12',
    device: 'Chrome / Android',
    ip: '203.113.152.88',
    status: 'failed',
  },
  {
    id: 'lh5',
    time: '21/09/2026 09:00',
    device: 'Chrome / Windows',
    ip: '192.168.1.10',
    status: 'success',
  },
];
