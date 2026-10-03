"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Mic,
  PenLine,
  Bot,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import TeacherService from "@/services/teacher.services/teacher.services";
import { toTeacherSubmission } from "@/services/teacher.services/type";
import {
  SUBMISSION_STATUS_LABELS,
  type Submission,
  type SubmissionStatus,
} from "@/lib/data/mock-teacher";

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  PENDING: "border-warning/30 bg-warning/10 text-warning",
  IN_PROGRESS: "border-primary/20 bg-primary/10 text-primary",
  REVIEWED: "border-success/20 bg-success/10 text-success",
  NEEDS_RECHECK: "border-destructive/20 bg-destructive/10 text-destructive",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function TeacherDashboardPage() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);

  React.useEffect(() => {
    TeacherService.getReviewQueue()
      .then((items) => setSubmissions(items.map(toTeacherSubmission)))
      .catch(() => undefined);
  }, []);

  const pendingSubs = submissions
    .filter((s) => s.status === "PENDING" || s.status === "NEEDS_RECHECK")
    .slice(0, 6);
  const pendingCount = submissions.filter(
    (s) => s.status === "PENDING" || s.status === "NEEDS_RECHECK",
  ).length;
  const reviewedCount = submissions.filter(
    (s) => s.status === "REVIEWED",
  ).length;
  const speakingCount = submissions.filter(
    (s) => s.skill === "SPEAKING",
  ).length;
  const writingCount = submissions.filter((s) => s.skill === "WRITING").length;
  const aiEvaluatedCount = submissions.filter((s) => s.aiScore > 0).length;
  const reviewActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const day = date.toLocaleDateString("vi-VN", { weekday: "short" });
    const dateKey = date.toLocaleDateString("vi-VN");
    return {
      day,
      reviews: submissions.filter((submission) =>
        submission.submittedAt.startsWith(dateKey),
      ).length,
    };
  });

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Theo dõi bài nộp và hoạt động đánh giá của người học."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={Clock}
          label="Chờ đánh giá"
          value={String(pendingCount)}
          iconClassName="bg-warning/10 text-warning"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Đã đánh giá"
          value={String(reviewedCount)}
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={Mic}
          label="Bài Speaking"
          value={String(speakingCount)}
          iconClassName="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={PenLine}
          label="Bài Writing"
          value={String(writingCount)}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
        <KpiCard
          icon={Bot}
          label="Đã được AI đánh giá"
          value={String(aiEvaluatedCount)}
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={AlertCircle}
          label="Cần giáo viên kiểm tra"
          value={String(pendingCount)}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Review Activity Chart + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động đánh giá</CardTitle>
            <CardDescription>
              Số bài đã đánh giá theo ngày trong tuần
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={reviewActivity} margin={{ left: -16, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="reviews"
                  name="Bài đánh giá"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            <CardDescription>Truy cập nhanh các trang đánh giá</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/teacher/submissions">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Xem bài nộp
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/teacher/speaking-review">
                <span className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Đánh giá Speaking
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/teacher/writing-review">
                <span className="flex items-center gap-2">
                  <PenLine className="h-4 w-4" />
                  Đánh giá Writing
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Review Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Bài cần đánh giá</CardTitle>
          <CardDescription>
            Các bài nộp đang chờ giáo viên đánh giá
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người học</TableHead>
                  <TableHead>Kỹ năng</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Thời gian nộp</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>CEFR</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.learnerName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {s.skill === "SPEAKING" ? "Speaking" : "Writing"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.task.replace("TASK_", "Task ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.submittedAt}
                    </TableCell>
                    <TableCell className="font-medium">
                      {s.aiScore.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {s.cefr}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-xs",
                          STATUS_STYLES[s.status],
                        )}
                      >
                        {SUBMISSION_STATUS_LABELS[s.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                      >
                        <Link
                          href={
                            s.skill === "SPEAKING"
                              ? `/teacher/speaking-review?submissionId=${s.id}`
                              : `/teacher/writing-review?submissionId=${s.id}`
                          }
                        >
                          Xem
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
