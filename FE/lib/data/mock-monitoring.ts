export type ServiceStatus = 'OPERATIONAL' | 'WARNING' | 'DOWN';

export interface ServiceInfo {
  name: string;
  status: ServiceStatus;
  responseTime: number;
  lastChecked: string;
}

export const MOCK_SERVICES: ServiceInfo[] = [
  {
    name: 'Backend API',
    status: 'OPERATIONAL',
    responseTime: 124,
    lastChecked: '1 phút trước',
  },
  {
    name: 'Database',
    status: 'OPERATIONAL',
    responseTime: 18,
    lastChecked: '1 phút trước',
  },
  {
    name: 'AI Service',
    status: 'OPERATIONAL',
    responseTime: 842,
    lastChecked: '1 phút trước',
  },
  {
    name: 'Storage',
    status: 'OPERATIONAL',
    responseTime: 76,
    lastChecked: '1 phút trước',
  },
];

export interface SystemMetric {
  label: string;
  value: string;
  icon: 'cpu' | 'memory' | 'api' | 'error' | 'uptime';
}

export const MOCK_SYSTEM_METRICS: SystemMetric[] = [
  { label: 'CPU', value: '42%', icon: 'cpu' },
  { label: 'Bộ nhớ', value: '68%', icon: 'memory' },
  { label: 'Thời gian phản hồi API', value: '124 ms', icon: 'api' },
  { label: 'Tỷ lệ lỗi', value: '0,8%', icon: 'error' },
  { label: 'Uptime', value: '99,8%', icon: 'uptime' },
];

export interface ResourceUsage {
  label: string;
  value: number;
  unit: string;
}

export const MOCK_RESOURCE_USAGE: ResourceUsage[] = [
  { label: 'CPU', value: 42, unit: '%' },
  { label: 'Bộ nhớ', value: 68, unit: '%' },
  { label: 'Lưu trữ', value: 54, unit: '%' },
];

export const PERFORMANCE_DATA = [
  { time: '00:00', responseTime: 95 },
  { time: '04:00', responseTime: 88 },
  { time: '08:00', responseTime: 112 },
  { time: '12:00', responseTime: 134 },
  { time: '16:00', responseTime: 121 },
  { time: '20:00', responseTime: 104 },
];

export const ERROR_RATE_DATA = [
  { time: '00:00', api: 0.5, ai: 0.3, system: 0.1 },
  { time: '04:00', api: 0.3, ai: 0.2, system: 0.1 },
  { time: '08:00', api: 0.8, ai: 0.6, system: 0.2 },
  { time: '12:00', api: 1.2, ai: 0.9, system: 0.3 },
  { time: '16:00', api: 0.9, ai: 0.7, system: 0.2 },
  { time: '20:00', api: 0.6, ai: 0.4, system: 0.1 },
];
