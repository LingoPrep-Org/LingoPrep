"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mic,
  PenLine,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  User,
  FileCheck,
  AlertCircle,
  Play,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import LearnerService from "@/services/learner.services/learner.services";
import { toAssignment } from "@/services/learner.services/type";
import {
  getAssignment,
  ASSIGNMENT_STATUS_LABELS,
  type AssignmentStatus,
  type Skill,
  type Assignment,
} from "@/lib/data/mock-assignments";

const STATUS_STYLES: Record<AssignmentStatus, string> = {
  NOT_STARTED: "border-muted-foreground/20 bg-muted text-muted-foreground",
  IN_PROGRESS: "border-warning/30 bg-warning/10 text-warning",
  SUBMITTED: "border-success/20 bg-success/10 text-success",
  OVERDUE: "border-destructive/20 bg-destructive/10 text-destructive",
};

function getDeadlineInfo(deadline: string | null): {
  label: string;
  urgency: "normal" | "soon" | "overdue";
} {
  if (!deadline) return { label: "Không có hạn", urgency: "normal" };
  const dl = new Date(deadline.split("/").reverse().join("-"));
  const now = new Date("2026-09-30");
  const diffDays = Math.ceil(
    (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return { label: "Đã quá hạn", urgency: "overdue" };
  if (diffDays <= 2) return { label: `Còn ${diffDays} ngày`, urgency: "soon" };
  return { label: `Còn ${diffDays} ngày`, urgency: "normal" };
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = String(params?.assignmentId ?? "");
  const [assignment, setAssignment] = React.useState<Assignment | null>(
    () => getAssignment(assignmentId) ?? null,
  );

  React.useEffect(() => {
    LearnerService.getAssignments()
      .then((items) => {
        const item = items.find(
          (candidate) => String(candidate.id) === assignmentId,
        );
        if (item) setAssignment(toAssignment(item));
      })
      .catch(() => undefined);
  }, [assignmentId]);

  if (!assignment) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Không tìm thấy bài tập
              </h2>
              <p className="text-sm text-muted-foreground">
                Bài tập này không tồn tại.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/learner/assignments">
                <ArrowLeft className="h-4 w-4" />
                Xem danh sách bài tập
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dl = getDeadlineInfo(assignment.deadline);
  const practiceHref =
    assignment.skill === "SPEAKING"
      ? `/learner/speaking/practice/${assignment.taskNumber}`
      : `/learner/writing/practice/${assignment.taskNumber}`;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/learner/assignments">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </Button>

      {/* Title + status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                assignment.skill === "SPEAKING"
                  ? "bg-primary/10 text-primary"
                  : "bg-chart-5/10 text-chart-5",
              )}
            >
              {assignment.skill === "SPEAKING" ? (
                <Mic className="h-5 w-5" />
              ) : (
                <PenLine className="h-5 w-5" />
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              {assignment.title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="px-2 py-0.5 text-xs">
              {assignment.skill === "SPEAKING" ? "Speaking" : "Writing"}
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-xs">
              {assignment.task}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-xs",
                STATUS_STYLES[assignment.status],
              )}
            >
              {ASSIGNMENT_STATUS_LABELS[assignment.status]}
            </Badge>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "px-2.5 py-1 text-xs shrink-0",
            dl.urgency === "overdue"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : dl.urgency === "soon"
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-muted-foreground/20 bg-muted text-muted-foreground",
          )}
        >
          {dl.urgency === "overdue" && (
            <AlertCircle className="mr-1.5 h-3 w-3" />
          )}
          {dl.urgency === "soon" && <Clock className="mr-1.5 h-3 w-3" />}
          {dl.label}
        </Badge>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Người giao</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {assignment.teacherName}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ngày giao</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {assignment.assignedAt}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Hạn nộp</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {assignment.deadline}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Thời lượng</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {assignment.duration}
          </p>
        </div>
      </div>

      {/* Progress */}
      {assignment.status === "IN_PROGRESS" && assignment.progress > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Tiến độ bài tập
              </span>
              <span className="text-sm font-bold text-foreground">
                {assignment.progress}%
              </span>
            </div>
            <Progress value={assignment.progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mô tả bài tập</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {assignment.description}
          </p>
        </CardContent>
      </Card>

      {/* Content / Action */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {assignment.skill === "SPEAKING"
              ? "Bài tập Speaking yêu cầu bạn ghi âm câu trả lời và nộp để AI đánh giá."
              : "Bài tập Writing yêu cầu bạn viết bài và nộp để AI đánh giá."}
          </p>

          {assignment.status === "SUBMITTED" && assignment.submissionId ? (
            <Button
              asChild
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Link href={`/learner/submissions/${assignment.submissionId}`}>
                <FileCheck className="h-4 w-4" />
                Xem bài đã nộp
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full gap-2" size="lg">
              <Link href={practiceHref}>
                <Play className="h-4 w-4" />
                {assignment.skill === "SPEAKING"
                  ? "Bắt đầu Speaking"
                  : "Bắt đầu Writing"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
