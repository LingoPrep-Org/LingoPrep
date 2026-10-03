"use client";

"use client";
import * as React from "react";
import Link from "next/link";
import {
  PenLine,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Target,
  Play,
  BarChart3,
  FileText,
  Type,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import LearnerService from "@/services/learner.services/learner.services";
import { toAssignment } from "@/services/learner.services/type";
import type { Assignment } from "@/lib/data/mock-assignments";
import {
  MOCK_WRITING_PROGRESS,
  MOCK_RECENT_WRITING,
} from "@/lib/data/mock-writing";

const RECENT_STATUS_STYLES: Record<string, string> = {
  AI_REVIEWED: "border-primary/20 bg-primary/10 text-primary",
  TEACHER_REVIEWED: "border-success/20 bg-success/10 text-success",
  PROCESSING: "border-warning/30 bg-warning/10 text-warning",
};

const RECENT_STATUS_LABELS: Record<string, string> = {
  AI_REVIEWED: "Đã đánh giá",
  TEACHER_REVIEWED: "GV đã đánh giá",
  PROCESSING: "Đang xử lý",
};

export default function LearnerWritingPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);

  React.useEffect(() => {
    LearnerService.getAssignments()
      .then((items) =>
        setAssignments(
          items.filter((item) => item.skill === "WRITING").map(toAssignment),
        ),
      )
      .catch(() => undefined);
  }, []);

  const firstPracticeTask = assignments[0]?.taskNumber ?? 1;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="overflow-hidden border-chart-5/20 bg-gradient-to-br from-chart-5/5 to-transparent">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                  <PenLine className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-chart-5">
                  Luyện Writing
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Improve your Writing
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Viết, nhận feedback và luyện lại để cải thiện Grammar,
                Vocabulary, Task Response và Coherence.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/learner/writing/practice/${firstPracticeTask}`}>
                    <Play className="h-4 w-4" />
                    Bắt đầu luyện Writing
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/learner/progress">
                    <BarChart3 className="h-4 w-4" />
                    Xem tiến độ
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden shrink-0 md:block">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-chart-5/10">
                <PenLine className="h-16 w-16 text-chart-5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Tasks */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">4 Writing Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Chọn task bạn muốn luyện tập
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((assignment) => {
            return (
              <Card
                key={assignment.id}
                className="group flex flex-col transition-colors hover:border-chart-5/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                        <PenLine className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {assignment.title}
                        </CardTitle>
                        <CardDescription className="font-medium text-chart-5">
                          {assignment.task}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1.5">
                      <Clock className="h-3 w-3" />
                      {assignment.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-sm text-muted-foreground">
                    {assignment.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="px-2 py-0.5 text-xs">
                      <Type className="mr-1 h-3 w-3" />
                      {assignment.status === "SUBMITTED"
                        ? "Đã nộp"
                        : "Chưa nộp"}
                    </Badge>
                    <Badge variant="outline" className="px-2 py-0.5 text-xs">
                      Task {assignment.taskNumber}
                    </Badge>
                  </div>
                  <Button asChild className="mt-4 w-full gap-2">
                    <Link
                      href={`/learner/writing/practice/${assignment.taskNumber}`}
                    >
                      Luyện {assignment.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progress + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Writing Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                <TrendingUp className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Tiến độ Writing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-chart-5" />
                  <span className="text-xs text-muted-foreground">
                    Đã luyện
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_WRITING_PROGRESS.totalPracticed} bài
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-chart-5" />
                  <span className="text-xs text-muted-foreground">Điểm TB</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_WRITING_PROGRESS.avgScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground">
                  CEFR hiện tại
                </span>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_WRITING_PROGRESS.currentCEFR}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground">
                  Task đã hoàn thành
                </span>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_WRITING_PROGRESS.tasksCompleted}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {MOCK_WRITING_PROGRESS.taskProgress.map((tp) => (
                <div key={tp.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {tp.label}
                    </span>
                    <span className="text-muted-foreground">
                      {tp.practiced}/{tp.total}
                    </span>
                  </div>
                  <Progress
                    value={(tp.practiced / tp.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Link href="/learner/progress">
                Xem tiến độ
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Writing Practice */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Bài Writing gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_RECENT_WRITING.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-2 py-0.5 text-xs">
                      Task {item.taskNumber}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {item.taskName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <span>{item.wordCount} words</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {item.aiScore > 0 ? (
                      <>
                        <p className="text-sm font-bold text-foreground">
                          {item.aiScore.toFixed(1)}
                        </p>
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          {item.cefr}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs",
                        RECENT_STATUS_STYLES[item.status],
                      )}
                    >
                      {RECENT_STATUS_LABELS[item.status]}
                    </Badge>
                    {item.aiScore > 0 && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                      >
                        <Link href={`/learner/writing/result/${item.id}`}>
                          Xem kết quả
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full gap-2">
              <Link href="/learner/submissions">
                Xem tất cả
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground italic">
        * Điểm và CEFR thể hiện kết quả luyện tập trong hệ thống, không phải
        chứng chỉ hoặc điểm thi Aptis chính thức. Word target là mock practice
        target.
      </p>
    </div>
  );
}
