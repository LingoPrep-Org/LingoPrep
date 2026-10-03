"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  AlertCircle,
  Settings,
  Check,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CATEGORY_LABELS,
  type TeacherNotification,
  type TeacherNotificationCategory,
} from "@/lib/data/mock-teacher-notifications";
import { useNotificationState } from "@/hooks/use-notification-state";
import TeacherService from "@/services/teacher.services/teacher.services";
import type { TeacherNotificationResponse } from "@/services/teacher.services/type";

const CATEGORY_ICONS: Record<TeacherNotificationCategory, React.ReactNode> = {
  NEW_SUBMISSION: <FileText className="h-4 w-4 text-primary" />,
  NEEDS_REVIEW: <AlertCircle className="h-4 w-4 text-warning" />,
  SYSTEM: <Settings className="h-4 w-4 text-muted-foreground" />,
};

const CATEGORY_ICON_BG: Record<TeacherNotificationCategory, string> = {
  NEW_SUBMISSION: "bg-primary/10",
  NEEDS_REVIEW: "bg-warning/10",
  SYSTEM: "bg-muted",
};

type TabValue = "ALL" | TeacherNotificationCategory;

export default function TeacherNotificationsPage() {
  const [notifications, setNotifications] =
    useNotificationState<TeacherNotification>("TEACHER", []);
  const [tab, setTab] = React.useState<TabValue>("ALL");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    TeacherService.getNotifications()
      .then((items) => setNotifications(items.map(toTeacherNotification)))
      .catch(() => toast.error("Không thể tải thông báo Teacher."));
  }, [setNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabCounts = React.useMemo(() => {
    const counts: Record<TabValue, number> = {
      ALL: notifications.filter((n) => !n.read).length,
      NEW_SUBMISSION: notifications.filter(
        (n) => !n.read && n.category === "NEW_SUBMISSION",
      ).length,
      NEEDS_REVIEW: notifications.filter(
        (n) => !n.read && n.category === "NEEDS_REVIEW",
      ).length,
      SYSTEM: notifications.filter((n) => !n.read && n.category === "SYSTEM")
        .length,
    };
    return counts;
  }, [notifications]);

  const filtered =
    tab === "ALL"
      ? notifications
      : notifications.filter((n) => n.category === tab);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => TeacherService.markNotificationRead(n.id)),
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
  };

  const markAsRead = async (id: string) => {
    setSelectedId(id);
    await TeacherService.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)),
    );
  };

  return (
    <>
      <PageHeader
        title="Thông báo"
        description="Thông báo liên quan đến bài nộp, review và hoạt động của hệ thống."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" />
          Đánh dấu tất cả đã đọc
        </Button>
      </PageHeader>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabValue)}
        className="mb-4"
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="ALL" className="gap-2">
            Tất cả
            {tabCounts.ALL > 0 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] border-primary/20 bg-primary/10 text-primary"
              >
                {tabCounts.ALL}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="NEW_SUBMISSION" className="gap-2">
            Bài nộp mới
            {tabCounts.NEW_SUBMISSION > 0 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] border-primary/20 bg-primary/10 text-primary"
              >
                {tabCounts.NEW_SUBMISSION}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="NEEDS_REVIEW" className="gap-2">
            Cần review
            {tabCounts.NEEDS_REVIEW > 0 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] border-warning/30 bg-warning/10 text-warning"
              >
                {tabCounts.NEEDS_REVIEW}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="SYSTEM" className="gap-2">
            Hệ thống
            {tabCounts.SYSTEM > 0 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] border-muted-foreground/20 bg-muted text-muted-foreground"
              >
                {tabCounts.SYSTEM}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification List / Empty */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Không có thông báo
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bạn đã đọc tất cả thông báo trong mục này.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
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
                    CATEGORY_ICON_BG[n.category],
                  )}
                >
                  {CATEGORY_ICONS[n.category]}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            n.read
                              ? "text-muted-foreground"
                              : "text-foreground",
                          )}
                        >
                          {n.title}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {n.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 px-2 py-0.5 text-[10px]"
                    >
                      {CATEGORY_LABELS[n.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {n.time}
                    </span>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          onClick={() => {
                            markAsRead(n.id);
                            toast.success("Đã đánh dấu đã đọc.");
                          }}
                        >
                          <Check className="h-3 w-3" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                      >
                        <Link
                          href={n.actionHref}
                          onClick={() => markAsRead(n.id)}
                        >
                          {n.actionLabel}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function toTeacherNotification(
  item: TeacherNotificationResponse,
): TeacherNotification {
  const category: TeacherNotificationCategory =
    item.type === "EVALUATION_COMPLETED" || item.type === "TEACHER_REVIEWED"
      ? "NEEDS_REVIEW"
      : item.type.includes("SUBMISSION")
        ? "NEW_SUBMISSION"
        : "SYSTEM";
  return {
    id: String(item.id),
    category,
    title: item.title,
    description: item.message,
    time: new Date(item.created_at).toLocaleString("vi-VN"),
    read: item.is_read,
    actionLabel: "Xem chi tiết",
    actionHref: item.link ?? "/teacher/submissions",
  };
}
