"use client";

import * as React from "react";
import Link from "next/link";
import {
  ClipboardList,
  Mic,
  PenLine,
  Clock,
  Calendar,
  Search,
  ArrowRight,
  FileCheck,
  Play,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiCard } from "@/components/shared/kpi-card";
import { cn } from "@/lib/utils";
import LearnerService from "@/services/learner.services/learner.services";
import { toAssignment } from "@/services/learner.services/type";
import {
  ASSIGNMENT_STATUS_LABELS,
  type Assignment,
  type AssignmentStatus,
  type Skill,
} from "@/lib/data/mock-assignments";

const STATUS_STYLES: Record<AssignmentStatus, string> = {
  NOT_STARTED: "border-muted-foreground/20 bg-muted text-muted-foreground",
  IN_PROGRESS: "border-warning/30 bg-warning/10 text-warning",
  SUBMITTED: "border-success/20 bg-success/10 text-success",
  OVERDUE: "border-destructive/20 bg-destructive/10 text-destructive",
};

const SKILL_STYLES: Record<Skill, string> = {
  SPEAKING: "border-primary/20 bg-primary/10 text-primary",
  WRITING: "border-chart-5/20 bg-chart-5/10 text-chart-5",
};

function getDeadlineInfo(deadline: string | null): {
  label: string;
  urgency: "normal" | "soon" | "overdue";
} {
  if (!deadline) return { label: "Không có hạn", urgency: "normal" };
  const dl = new Date(deadline.split("/").reverse().join("-"));
  const now = new Date("2026-09-30");
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Đã quá hạn", urgency: "overdue" };
  if (diffDays === 0) return { label: "Hết hạn hôm nay", urgency: "soon" };
  if (diffDays === 1) return { label: "Còn 1 ngày", urgency: "soon" };
  if (diffDays <= 2) return { label: `Còn ${diffDays} ngày`, urgency: "soon" };
  return { label: `Còn ${diffDays} ngày`, urgency: "normal" };
}

export default function LearnerAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [search, setSearch] = React.useState("");
  const [skillFilter, setSkillFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  React.useEffect(() => {
    LearnerService.getAssignments()
      .then((items) => setAssignments(items.map(toAssignment)))
      .catch(() => undefined);
  }, []);

  const filtered = React.useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.task.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === "all" || a.skill === skillFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesSkill && matchesStatus;
    });
  }, [assignments, search, skillFilter, statusFilter]);

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "SUBMITTED").length;
  const notCompleted = assignments.filter(
    (a) => a.status === "NOT_STARTED" || a.status === "IN_PROGRESS",
  ).length;
  const upcoming = assignments.filter((a) => {
    const di = getDeadlineInfo(a.deadline);
    return di.urgency === "soon" && a.status !== "SUBMITTED";
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Bài tập
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Các bài luyện và bài kiểm tra được giao cho bạn.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={ClipboardList}
          label="Tổng bài tập"
          value={String(total)}
        />
        <KpiCard
          icon={AlertCircle}
          label="Chưa hoàn thành"
          value={String(notCompleted)}
          iconClassName="bg-warning/10 text-warning"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Đã hoàn thành"
          value={String(completed)}
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={Clock}
          label="Sắp đến hạn"
          value={String(upcoming)}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài tập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Kỹ năng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="SPEAKING">Speaking</SelectItem>
                <SelectItem value="WRITING">Writing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="NOT_STARTED">Chưa làm</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                <SelectItem value="SUBMITTED">Đã nộp</SelectItem>
                <SelectItem value="OVERDUE">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignment list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Chưa có bài tập
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Hiện tại bạn chưa có bài tập nào được giao.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href="/learner/speaking">Luyện Speaking</Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/learner/writing">Luyện Writing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((a: Assignment) => {
            const dl = getDeadlineInfo(a.deadline);
            const practiceHref =
              a.skill === "SPEAKING"
                ? `/learner/speaking/practice/${a.taskNumber}`
                : `/learner/writing/practice/${a.taskNumber}`;
            return (
              <Card
                key={a.id}
                className="flex flex-col transition-colors hover:border-primary/30"
              >
                <CardContent className="p-5 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          a.skill === "SPEAKING"
                            ? "bg-primary/10 text-primary"
                            : "bg-chart-5/10 text-chart-5",
                        )}
                      >
                        {a.skill === "SPEAKING" ? (
                          <Mic className="h-5 w-5" />
                        ) : (
                          <PenLine className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {a.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-0.5 text-xs",
                              SKILL_STYLES[a.skill],
                            )}
                          >
                            {a.skill === "SPEAKING" ? "Speaking" : "Writing"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-xs"
                          >
                            {a.task}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs shrink-0",
                        STATUS_STYLES[a.status],
                      )}
                    >
                      {ASSIGNMENT_STATUS_LABELS[a.status]}
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {a.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {a.teacherName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Giao: {a.assignedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a.duration}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Hạn nộp: {a.deadline}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs",
                        dl.urgency === "overdue"
                          ? "border-destructive/20 bg-destructive/10 text-destructive"
                          : dl.urgency === "soon"
                            ? "border-warning/30 bg-warning/10 text-warning"
                            : "border-muted-foreground/20 bg-muted text-muted-foreground",
                      )}
                    >
                      {dl.urgency === "overdue" && (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {dl.urgency === "soon" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {dl.label}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {a.status === "IN_PROGRESS" && a.progress > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tiến độ</span>
                        <span className="font-medium text-foreground">
                          {a.progress}%
                        </span>
                      </div>
                      <Progress value={a.progress} className="h-1.5" />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-4">
                    {a.status === "NOT_STARTED" && (
                      <Button asChild className="w-full gap-2" size="sm">
                        <Link href={practiceHref}>
                          <Play className="h-4 w-4" />
                          Bắt đầu
                        </Link>
                      </Button>
                    )}
                    {a.status === "IN_PROGRESS" && (
                      <Button asChild className="w-full gap-2" size="sm">
                        <Link href={practiceHref}>
                          <ArrowRight className="h-4 w-4" />
                          Tiếp tục
                        </Link>
                      </Button>
                    )}
                    {a.status === "SUBMITTED" && a.submissionId && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full gap-2"
                        size="sm"
                      >
                        <Link href={`/learner/submissions/${a.submissionId}`}>
                          <FileCheck className="h-4 w-4" />
                          Xem bài đã nộp
                        </Link>
                      </Button>
                    )}
                    {a.status === "OVERDUE" && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full gap-2"
                        size="sm"
                      >
                        <Link href={practiceHref}>
                          <Play className="h-4 w-4" />
                          Làm ngay
                        </Link>
                      </Button>
                    )}
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
