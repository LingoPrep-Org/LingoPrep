export type NotificationType =
  | 'SYSTEM_MAINTENANCE'
  | 'AI_MAINTENANCE'
  | 'NEW_FEATURE'
  | 'SYSTEM_WARNING';

export type NotificationStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'DISABLED';

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;
  displayAt: string;
  createdBy: string;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  SYSTEM_MAINTENANCE: 'Bảo trì hệ thống',
  AI_MAINTENANCE: 'Bảo trì AI',
  NEW_FEATURE: 'Tính năng mới',
  SYSTEM_WARNING: 'Cảnh báo hệ thống',
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  DRAFT: 'Bản nháp',
  SCHEDULED: 'Đã lên lịch',
  ACTIVE: 'Đang hoạt động',
  DISABLED: 'Đã tắt',
};

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n001',
    title: 'Bảo trì hệ thống định kỳ tháng 10',
    content:
      'Hệ thống sẽ tạm ngừng hoạt động từ 02:00 đến 04:00 ngày 05/10/2026 để bảo trì định kỳ.',
    type: 'SYSTEM_MAINTENANCE',
    status: 'ACTIVE',
    createdAt: '2026-09-20',
    displayAt: '2026-09-20',
    createdBy: 'Admin System',
  },
  {
    id: 'n002',
    title: 'Nâng cấp dịch vụ AI chấm điểm',
    content:
      'Dịch vụ AI sẽ được nâng cấp lên phiên bản mới với độ chính xác cao hơn. Vui lòng lưu ý trong giai đoạn chuyển đổi.',
    type: 'AI_MAINTENANCE',
    status: 'SCHEDULED',
    createdAt: '2026-09-18',
    displayAt: '2026-10-01',
    createdBy: 'Admin System',
  },
  {
    id: 'n003',
    title: 'Ra mắt tính năng luyện Speaking Task 4 mới',
    content:
      'Tính năng luyện Speaking Task 4 với phản hồi AI chi tiết đã được ra mắt. Hãy trải nghiệm ngay!',
    type: 'NEW_FEATURE',
    status: 'ACTIVE',
    createdAt: '2026-09-15',
    displayAt: '2026-09-15',
    createdBy: 'Admin System',
  },
  {
    id: 'n004',
    title: 'Cảnh báo: Tỷ lệ lỗi API tăng cao',
    content:
      'Tỷ lệ lỗi API đã tăng trong vòng 1 giờ qua. Đội kỹ thuật đang xử lý. Vui lòng theo dõi cập nhật.',
    type: 'SYSTEM_WARNING',
    status: 'DISABLED',
    createdAt: '2026-09-14',
    displayAt: '2026-09-14',
    createdBy: 'Admin System',
  },
  {
    id: 'n005',
    title: 'Bảo trì cơ sở dữ liệu cuối tuần',
    content:
      'Cơ sở dữ liệu sẽ được tối ưu hóa vào sáng thứ Bảy. Có thể chậm trong thời gian ngắn.',
    type: 'SYSTEM_MAINTENANCE',
    status: 'DRAFT',
    createdAt: '2026-09-22',
    displayAt: '2026-09-28',
    createdBy: 'Admin System',
  },
  {
    id: 'n006',
    title: 'Cập nhật ngân hàng câu hỏi Writing',
    content:
      '20 câu hỏi Writing mới đã được thêm vào ngân hàng. Truy cập Ngân hàng câu hỏi để xem chi tiết.',
    type: 'NEW_FEATURE',
    status: 'ACTIVE',
    createdAt: '2026-09-12',
    displayAt: '2026-09-12',
    createdBy: 'Admin System',
  },
  {
    id: 'n007',
    title: 'Bảo trì dịch vụ AI ngày 25/09',
    content:
      'Dịch vụ AI sẽ tạm dừng từ 01:00 đến 03:00 ngày 25/09/2026 để cập nhật mô hình.',
    type: 'AI_MAINTENANCE',
    status: 'SCHEDULED',
    createdAt: '2026-09-19',
    displayAt: '2026-09-25',
    createdBy: 'Admin System',
  },
  {
    id: 'n008',
    title: 'Cảnh báo: Dung lượng lưu trữ sắp đầy',
    content:
      'Dung lượng lưu trữ đã đạt 54%. Vui lòng kiểm tra và dọn dẹp dữ liệu không cần thiết.',
    type: 'SYSTEM_WARNING',
    status: 'ACTIVE',
    createdAt: '2026-09-21',
    displayAt: '2026-09-21',
    createdBy: 'Admin System',
  },
  {
    id: 'n009',
    title: 'Tính năng xuất báo cáo mới',
    content:
      'Bạn có thể xuất báo cáo dưới dạng PDF và Excel. Truy cập Báo cáo & thống kê để dùng thử.',
    type: 'NEW_FEATURE',
    status: 'DRAFT',
    createdAt: '2026-09-23',
    displayAt: '2026-10-05',
    createdBy: 'Admin System',
  },
  {
    id: 'n010',
    title: 'Bảo trì hệ thống khẩn cấp',
    content:
      'Hệ thống sẽ khởi động lại trong 5 phút để khắc phục sự cố. Xin lỗi vì sự bất tiện.',
    type: 'SYSTEM_MAINTENANCE',
    status: 'DISABLED',
    createdAt: '2026-09-10',
    displayAt: '2026-09-10',
    createdBy: 'Admin System',
  },
  {
    id: 'n011',
    title: 'Cập nhật chính sách quyền riêng tư',
    content:
      'Chính sách quyền riêng tư đã được cập nhật. Vui lòng xem chi tiết trên trang cài đặt.',
    type: 'NEW_FEATURE',
    status: 'ACTIVE',
    createdAt: '2026-09-08',
    displayAt: '2026-09-08',
    createdBy: 'Admin System',
  },
  {
    id: 'n012',
    title: 'Cảnh báo hệ thống: Nhiệt độ máy chủ cao',
    content:
      'Nhiệt độ máy chủ vượt ngưỡng cảnh báo. Hệ thống làm mát đang hoạt động.',
    type: 'SYSTEM_WARNING',
    status: 'DISABLED',
    createdAt: '2026-09-05',
    displayAt: '2026-09-05',
    createdBy: 'Admin System',
  },
];
