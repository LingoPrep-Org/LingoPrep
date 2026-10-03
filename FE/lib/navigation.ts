import type { Role } from '@/lib/auth/types';
import {
  LayoutDashboard,
  Users,
  Activity,
  Bot,
  Library,
  Bell,
  BarChart3,
  Settings,
  FileText,
  Mic,
  PenLine,
  TrendingUp,
  ClipboardList,
  FileCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const NAV_CONFIG: Record<Role, NavItem[]> = {
  ADMIN: [
    {
      label: 'Tổng quan',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Tổng quan hệ thống',
    },
    {
      label: 'Quản lý tài khoản',
      href: '/admin/users',
      icon: Users,
      description: 'Quản lý tài khoản',
    },
    {
      label: 'Giám sát hệ thống',
      href: '/admin/monitoring',
      icon: Activity,
      description: 'Giám sát hệ thống',
    },
    {
      label: 'Cấu hình AI',
      href: '/admin/ai-configuration',
      icon: Bot,
      description: 'Cấu hình AI',
    },
    {
      label: 'Ngân hàng câu hỏi',
      href: '/admin/question-bank',
      icon: Library,
      description: 'Ngân hàng câu hỏi',
    },
    {
      label: 'Thông báo hệ thống',
      href: '/admin/notifications',
      icon: Bell,
      description: 'Thông báo hệ thống',
    },
    {
      label: 'Báo cáo & thống kê',
      href: '/admin/reports',
      icon: BarChart3,
      description: 'Báo cáo & thống kê',
    },
    {
      label: 'Cài đặt hệ thống',
      href: '/admin/settings',
      icon: Settings,
      description: 'Cài đặt hệ thống',
    },
  ],
  TEACHER: [
    {
      label: 'Tổng quan',
      href: '/teacher/dashboard',
      icon: LayoutDashboard,
      description: 'Tổng quan giáo viên',
    },
    {
      label: 'Bài kiểm tra',
      href: '/teacher/assignments',
      icon: ClipboardList,
      description: 'Bài kiểm tra',
    },
    {
      label: 'Bài nộp',
      href: '/teacher/submissions',
      icon: FileText,
      description: 'Bài nộp',
    },
    {
      label: 'Đánh giá Speaking',
      href: '/teacher/speaking-review',
      icon: Mic,
      description: 'Đánh giá Speaking',
    },
    {
      label: 'Đánh giá Writing',
      href: '/teacher/writing-review',
      icon: PenLine,
      description: 'Đánh giá Writing',
    },
    {
      label: 'Tiến độ người học',
      href: '/teacher/student-progress',
      icon: TrendingUp,
      description: 'Tiến độ người học',
    },
    {
      label: 'Thông báo',
      href: '/teacher/notifications',
      icon: Bell,
      description: 'Thông báo',
    },
  ],
  LEARNER: [
    {
      label: 'Tổng quan',
      href: '/learner/dashboard',
      icon: LayoutDashboard,
      description: 'Tổng quan người học',
    },
    {
      label: 'Luyện Speaking',
      href: '/learner/speaking',
      icon: Mic,
      description: 'Luyện Speaking',
    },
    {
      label: 'Luyện Writing',
      href: '/learner/writing',
      icon: PenLine,
      description: 'Luyện Writing',
    },
    {
      label: 'Bài tập',
      href: '/learner/assignments',
      icon: ClipboardList,
      description: 'Bài tập',
    },
    {
      label: 'Bài đã nộp',
      href: '/learner/submissions',
      icon: FileCheck,
      description: 'Bài đã nộp',
    },
    {
      label: 'Phản hồi AI',
      href: '/learner/feedback',
      icon: Bot,
      description: 'Phản hồi AI',
    },
    {
      label: 'Tiến độ cá nhân',
      href: '/learner/progress',
      icon: TrendingUp,
      description: 'Tiến độ cá nhân',
    },
  ],
};

export function getActiveItem(pathname: string, role: Role): NavItem | null {
  const items = NAV_CONFIG[role];
  let best: NavItem | null = null;
  let bestLen = 0;
  for (const item of items) {
    if (
      pathname === item.href ||
      pathname.startsWith(item.href + '/')
    ) {
      if (item.href.length > bestLen) {
        best = item;
        bestLen = item.href.length;
      }
    }
  }
  return best;
}

export function getBreadcrumbs(pathname: string, role: Role): NavItem[] {
  const active = getActiveItem(pathname, role);
  if (!active) return [];
  if (pathname === active.href) return [active];
  return [active, { ...active, label: 'Chi tiết', href: pathname }];
}

export const ROLE_NAV = NAV_CONFIG;
