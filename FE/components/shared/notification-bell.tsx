'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Check,
  ChevronRight,
  Inbox,
  Trash2,
  FileText,
  ClipboardList,
  Sparkles,
  UserCheck,
  Loader2,
  AlertCircle,
  Settings,
  UserPlus,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Role } from '@/lib/auth/types';
import {
  getNotificationsByRole,
  TYPE_ICON_BG,
  PRIORITY_DOT,
  type Notification,
  type NotificationType,
} from '@/lib/data/mock-user-notifications';
import { useNotificationState } from '@/hooks/use-notification-state';

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  SYSTEM: Settings,
  ASSIGNMENT: ClipboardList,
  SUBMISSION: FileText,
  AI_RESULT: Sparkles,
  TEACHER_REVIEW: UserCheck,
  AI_JOB: Loader2,
  ACCOUNT: UserPlus,
  WARNING: AlertCircle,
};

function NotificationCenterLink({ role }: { role: Role }) {
  const href = `/${role.toLowerCase()}/notifications`;
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
    >
      Xem tất cả
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function NotificationBell({ role }: { role: Role }) {
  const router = useRouter();
  const [notifications, setNotifications] = useNotificationState<Notification>(
    role,
    getNotificationsByRole(role)
  );
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 5);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    setSelectedId(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n))
    );
    if (actionUrl) {
      setOpen(false);
      router.push(actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả là đã đọc.');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success('Đã xóa thông báo.');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Thông báo"
          className="relative h-9 w-9"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] max-w-[calc(100vw-2rem)] p-0 md:w-[400px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Thông báo</span>
            {unreadCount > 0 && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] border-destructive/20 bg-destructive/10 text-destructive">
                {unreadCount} chưa đọc
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* List */}
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Bạn chưa có thông báo mới.</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {recent.map((n) => {
              const Icon = TYPE_ICONS[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.actionUrl)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50',
                    selectedId === n.id && 'bg-primary/10 ring-1 ring-inset ring-primary/20'
                  )}
                >
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TYPE_ICON_BG[n.type])}>
                    <Icon className={cn('h-4 w-4', n.type === 'AI_JOB' && !n.read && 'animate-spin')} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[n.priority])} />
                      )}
                      <span className={cn(
                        'truncate text-sm font-semibold',
                        n.read ? 'text-muted-foreground' : 'text-foreground'
                      )}>
                        {n.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-muted-foreground">{n.createdAt}</span>
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n.id);
                              toast.success('Đã đánh dấu đã đọc.');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation();
                                handleNotificationClick(n.id);
                              }
                            }}
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <Check className="h-3 w-3" />
                            Đã đọc
                          </span>
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDelete(n.id, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleDelete(n.id, e as unknown as React.MouseEvent);
                          }}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border">
          <NotificationCenterLink role={role} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
