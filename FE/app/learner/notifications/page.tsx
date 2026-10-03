"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCheck,
  Check,
  ChevronRight,
  Trash2,
  Inbox,
  FileText,
  ClipboardList,
  Sparkles,
  UserCheck,
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  NOTIFICATION_TYPE_LABELS,
  TYPE_ICON_BG,
  PRIORITY_DOT,
  type Notification,
  type NotificationType,
} from "@/lib/data/mock-user-notifications";
import { useNotificationState } from "@/hooks/use-notification-state";
import LearnerService from "@/services/learner.services/learner.services";
import type { LearnerNotificationResponse } from "@/services/learner.services/type";

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  SYSTEM: Settings,
  ASSIGNMENT: ClipboardList,
  SUBMISSION: FileText,
  AI_RESULT: Sparkles,
  TEACHER_REVIEW: UserCheck,
  AI_JOB: Loader2,
  ACCOUNT: UserCheck,
  WARNING: AlertCircle,
};

type TabValue = "ALL" | "UNREAD" | "READ";

export default function LearnerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useNotificationState<Notification>(
    "LEARNER",
    [],
  );
  const [tab, setTab] = React.useState<TabValue>("ALL");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    LearnerService.getNotifications()
      .then((items) => setNotifications(items.map(toLearnerNotification)))
      .catch(() => toast.error("Không thể tải thông báo người học."));
  }, [setNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.length - unreadCount;

  const tabCounts: Record<TabValue, number> = {
    ALL: notifications.length,
    UNREAD: unreadCount,
    READ: readCount,
  };

  const filtered = React.useMemo(() => {
    if (tab === "UNREAD") return notifications.filter((n) => !n.read);
    if (tab === "READ") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, tab]);

  const handleNotificationClick = async (id: string, actionUrl?: string) => {
    setSelectedId(id);
    await LearnerService.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)),
    );
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await Promise.all(
      notifications
        .filter((notification) => !notification.read)
        .map((notification) =>
          LearnerService.markNotificationRead(notification.id),
        ),
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success("Đã xóa thông báo.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Thông báo
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Các thông báo về bài tập, kết quả AI và phản hồi từ giáo viên.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="ALL" className="gap-2">
            Tất cả
            {tabCounts.ALL > 0 && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                {tabCounts.ALL}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="UNREAD" className="gap-2">
            Chưa đọc
            {tabCounts.UNREAD > 0 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] border-destructive/20 bg-destructive/10 text-destructive"
              >
                {tabCounts.UNREAD}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="READ" className="gap-2">
            Đã đọc
            {tabCounts.READ > 0 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] border-muted-foreground/20 bg-muted text-muted-foreground"
              >
                {tabCounts.READ}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {tab === "UNREAD"
                ? "Không có thông báo chưa đọc"
                : tab === "READ"
                  ? "Không có thông báo đã đọc"
                  : "Bạn chưa có thông báo mới."}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "UNREAD"
                ? "Bạn đã đọc tất cả thông báo."
                : "Các thông báo mới sẽ xuất hiện ở đây."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = TYPE_ICONS[n.type];
            return (
              <Card
                key={n.id}
                className={cn(
                  "transition-colors",
                  selectedId === n.id &&
                    "border-primary/30 bg-primary/10 ring-1 ring-primary/20",
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      TYPE_ICON_BG[n.type],
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        n.type === "AI_JOB" && !n.read && "animate-spin",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span
                              className={cn(
                                "h-2 w-2 shrink-0 rounded-full",
                                PRIORITY_DOT[n.priority],
                              )}
                            />
                          )}
                          <h3
                            className={cn(
                              "truncate text-sm font-semibold",
                              n.read
                                ? "text-muted-foreground"
                                : "text-foreground",
                            )}
                          >
                            {n.title}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {n.message}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 px-2 py-0.5 text-[10px]"
                      >
                        {NOTIFICATION_TYPE_LABELS[n.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {n.createdAt}
                      </span>
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            onClick={() => {
                              handleNotificationClick(n.id);
                              toast.success("Đã đánh dấu đã đọc.");
                            }}
                          >
                            <Check className="h-3 w-3" />
                            Đánh dấu đã đọc
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDelete(n.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Xóa
                        </Button>
                        {n.actionUrl && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                          >
                            <Link
                              href={n.actionUrl}
                              onClick={() => handleNotificationClick(n.id)}
                            >
                              {n.actionLabel ?? "Xem chi tiết"}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toLearnerNotification(
  item: LearnerNotificationResponse,
): Notification {
  const type = item.type as NotificationType;
  const normalizedType: NotificationType = Object.prototype.hasOwnProperty.call(
    NOTIFICATION_TYPE_LABELS,
    type,
  )
    ? type
    : item.type === "TEACHER_REVIEWED"
      ? "TEACHER_REVIEW"
      : item.type.includes("EVALUATION")
        ? "AI_RESULT"
        : "SYSTEM";
  return {
    id: String(item.id),
    recipientRole: "LEARNER",
    type: normalizedType,
    title: item.title,
    message: item.message,
    createdAt: new Date(item.created_at).toLocaleString("vi-VN"),
    read: item.is_read,
    actionUrl: item.link ?? "/learner/notifications",
    actionLabel: "Xem chi tiết",
    priority: normalizedType === "WARNING" ? "warning" : "info",
  };
}
