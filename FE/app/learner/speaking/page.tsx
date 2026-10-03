"use client";

"use client";
import * as React from "react";
import Link from "next/link";
import {
  Mic,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Target,
  Play,
  BarChart3,
  FileText,
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
  MOCK_SPEAKING_PROGRESS,
  MOCK_RECENT_SPEAKING,
} from "@/lib/data/mock-speaking";

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

export default function LearnerSpeakingPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);

  React.useEffect(() => {
    LearnerService.getAssignments()
      .then((items) =>
        setAssignments(
          items.filter((item) => item.skill === "SPEAKING").map(toAssignment),
        ),
      )
      .catch(() => undefined);
  }, []);

  const firstPracticeTask = assignments[0]?.taskNumber ?? 1;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mic className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-primary">
                  Luyện Speaking
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Improve your Speaking
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Luyện nói thường xuyên, ghi âm câu trả lời và xem AI phân tích
                những điểm bạn cần cải thiện.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link
                    href={`/learner/speaking/practice/${firstPracticeTask}`}
                  >
                    <Play className="h-4 w-4" />
                    Bắt đầu luyện
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
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10">
                <Mic className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Parts */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            4 Parts của APTIS Speaking
          </h2>
          <p className="text-sm text-muted-foreground">
            Chọn phần bạn muốn luyện tập
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="group flex flex-col transition-colors hover:border-primary/30"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {assignment.title}
                      </CardTitle>
                      <CardDescription className="font-medium text-primary">
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
                    {assignment.status === "SUBMITTED" ? "Đã nộp" : "Chưa nộp"}
                  </Badge>
                </div>
                <Button asChild className="mt-4 w-full gap-2">
                  <Link
                    href={`/learner/speaking/practice/${assignment.taskNumber}`}
                  >
                    Luyện {assignment.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Speaking Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Tiến độ Speaking</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Đã luyện
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_SPEAKING_PROGRESS.totalPracticed} bài
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Điểm TB</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_SPEAKING_PROGRESS.avgScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground">
                  CEFR hiện tại
                </span>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_SPEAKING_PROGRESS.currentCEFR}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-xs text-muted-foreground">
                  Part luyện nhiều nhất
                </span>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {MOCK_SPEAKING_PROGRESS.mostPracticedPart}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {MOCK_SPEAKING_PROGRESS.partProgress.map((pp) => {
                const pct = (pp.practiced / pp.total) * 100;
                return (
                  <div key={pp.part} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {pp.label}
                      </span>
                      <span className="text-muted-foreground">
                        {pp.practiced}/{pp.total}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
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

        {/* Recent Speaking Practice */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Luyện gần đây</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_RECENT_SPEAKING.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-2 py-0.5 text-xs">
                      Part {item.part}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {item.taskName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {item.aiScore.toFixed(1)}
                    </p>
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {item.cefr}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 text-xs",
                      RECENT_STATUS_STYLES[item.status],
                    )}
                  >
                    {RECENT_STATUS_LABELS[item.status]}
                  </Badge>
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

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground italic">
        * Điểm và CEFR thể hiện kết quả luyện tập trong hệ thống, không phải
        chứng chỉ hoặc điểm thi Aptis chính thức.
      </p>
    </div>
  );
}
