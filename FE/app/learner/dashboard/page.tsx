"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mic,
  PenLine,
  ArrowRight,
  Award,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import LearnerService from "@/services/learner.services/learner.services";
import type {
  LearnerDashboardResponse,
  LearnerProgressResponse,
} from "@/services/learner.services/type";
import { toUnifiedSubmission } from "@/services/learner.services/type";
import {
  SCORE_HISTORY_BY_RANGE,
  MOCK_QUICK_ACTIONS,
  SUBMISSION_STATUS_LABELS,
  type ScoreRange,
  type SubmissionStatus,
} from "@/lib/data/mock-learner-dashboard";
import { useAuth } from "@/lib/auth/auth-context";
import type { UnifiedSubmission } from "@/lib/data/mock-assignments";

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  PROCESSING: "border-warning/30 bg-warning/10 text-warning",
  AI_REVIEWED: "border-primary/20 bg-primary/10 text-primary",
  TEACHER_REVIEWED: "border-success/20 bg-success/10 text-success",
  SUBMITTED: "border-muted-foreground/20 bg-muted text-muted-foreground",
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
          {entry.name}: {entry.value.toFixed(1)}
        </p>
      ))}
    </div>
  );
}

export default function LearnerDashboardPage() {
  const [scoreRange, setScoreRange] = React.useState<ScoreRange>("30D");
  const [dashboard, setDashboard] =
    React.useState<LearnerDashboardResponse | null>(null);
  const [progress, setProgress] =
    React.useState<LearnerProgressResponse | null>(null);
  const [recentSubmissions, setRecentSubmissions] = React.useState<
    UnifiedSubmission[]
  >([]);

  const user = useAuth().user;

  React.useEffect(() => {
    Promise.all([
      LearnerService.getDashboard(),
      LearnerService.getProgress(),
      LearnerService.getSubmissions(),
    ])
      .then(([dashboardData, progressData, submissions]) => {
        setDashboard(dashboardData);
        setProgress(progressData);
        setRecentSubmissions(submissions.map(toUnifiedSubmission).slice(0, 5));
      })
      .catch(() => undefined);
  }, []);

  const rangeDays = scoreRange === "7D" ? 7 : scoreRange === "3M" ? 90 : 30;
  const scoreData = progress
    ? progress.trend_history
        .map((item) => ({
          label: item.date,
          speaking: item.type === "SPEAKING" ? item.band : undefined,
          writing: item.type === "WRITING" ? item.band : undefined,
          timestamp: Date.parse(`${item.date} ${new Date().getFullYear()}`),
        }))
        .filter(
          (item) =>
            !Number.isNaN(item.timestamp) &&
            Date.now() - item.timestamp <= rangeDays * 24 * 60 * 60 * 1000,
        )
    : SCORE_HISTORY_BY_RANGE[scoreRange];
  const weeklyProgress = progress
    ? (progress.weekly_completed / progress.weekly_goal) * 100
    : 0;
  const goalProgress = progress?.overall_progress ?? 0;
  const feedbackStrengths = Array.from(
    new Set(
      recentSubmissions.flatMap(
        (submission) => submission.aiFeedback.strengths,
      ),
    ),
  ).slice(0, 4);
  const feedbackImprovements = Array.from(
    new Set(
      recentSubmissions.flatMap(
        (submission) => submission.aiFeedback.improvements,
      ),
    ),
  ).slice(0, 4);
  const weeklyActivity = progress?.weekly_activity ?? [];
  const practicedDays = weeklyActivity.filter(
    (day) => day.practiced > 0,
  ).length;
  const weeklySpeaking = weeklyActivity.reduce(
    (total, day) => total + day.speaking,
    0,
  );
  const weeklyWriting = weeklyActivity.reduce(
    (total, day) => total + day.writing,
    0,
  );
  const weeklyMinutes = weeklyActivity.reduce(
    (total, day) => total + day.total_minutes,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Chào buổi học, {user?.name || "Người dùng"} 👋
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Tiếp tục luyện tập để cải thiện kỹ năng APTIS của bạn.
        </p>
      </div>

      {/* Continue Practice — Two big action cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Speaking card */}
        <Card className="group overflow-hidden border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mic className="h-7 w-7" />
              </div>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 text-primary"
              >
                CEFR: {dashboard?.cefr_level ?? "—"}
              </Badge>
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Speaking</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {dashboard?.speaking_count ?? 0} bài luyện · Điểm TB:{" "}
              {dashboard?.average_band?.toFixed(1) ?? "—"}
            </p>
            <Button asChild className="mt-4 w-full gap-2">
              <Link href="/learner/speaking">
                Luyện ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Writing card */}
        <Card className="group overflow-hidden border-chart-5/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-chart-5/10 text-chart-5">
                <PenLine className="h-7 w-7" />
              </div>
              <Badge
                variant="outline"
                className="border-chart-5/20 bg-chart-5/10 text-chart-5"
              >
                CEFR: {dashboard?.cefr_level ?? "—"}
              </Badge>
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Writing</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {dashboard?.writing_count ?? 0} bài luyện · Điểm TB:{" "}
              {dashboard?.average_band?.toFixed(1) ?? "—"}
            </p>
            <Button asChild className="mt-4 w-full gap-2">
              <Link href="/learner/writing">
                Luyện ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Activity}
          label="Tổng số bài"
          value={dashboard ? String(dashboard.total_submissions) : "—"}
        />
        <KpiCard
          icon={Mic}
          label="Speaking"
          value={dashboard ? String(dashboard.speaking_count) : "—"}
        />
        <KpiCard
          icon={PenLine}
          label="Writing"
          value={dashboard ? String(dashboard.writing_count) : "—"}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
        <KpiCard
          icon={Award}
          label="CEFR hiện tại"
          value={dashboard?.cefr_level ?? "—"}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Progress Chart + Goal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Tiến độ của bạn</CardTitle>
                <CardDescription>
                  Điểm Speaking và Writing theo thời gian
                </CardDescription>
              </div>
              <Select
                value={scoreRange}
                onValueChange={(v) => setScoreRange(v as ScoreRange)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7D">7 ngày</SelectItem>
                  <SelectItem value="30D">30 ngày</SelectItem>
                  <SelectItem value="3M">3 tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {scoreData.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Chưa có dữ liệu điểm AI trong khoảng thời gian này.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scoreData} margin={{ left: -16, right: 8 }}>
                  <defs>
                    <linearGradient
                      id="speakingGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="writingGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-5))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-5))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RTooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="speaking"
                    name="Speaking"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#speakingGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="writing"
                    name="Writing"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    fill="url(#writingGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Goal Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Mục tiêu hiện tại</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <span className="text-sm text-muted-foreground">
                CEFR hiện tại
              </span>
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm font-bold border-primary/20 bg-primary/10 text-primary"
              >
                {dashboard?.cefr_level ?? "—"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <span className="text-sm text-muted-foreground">Mục tiêu</span>
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm font-bold border-success/20 bg-success/10 text-success"
              >
                {progress?.target_cefr ?? "—"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiến độ</span>
                <span className="text-sm font-semibold text-foreground">
                  {goalProgress}%
                </span>
              </div>
              <Progress value={goalProgress} className="h-2.5" />
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Link href="/learner/progress">
                Xem tiến độ chi tiết
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions + AI Feedback */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Submissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Bài luyện gần đây</CardTitle>
                <CardDescription>Các bài nộp gần nhất của bạn</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href="/learner/submissions">
                  Xem tất cả
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kỹ năng</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Ngày làm</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>CEFR</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
                          {s.skill === "SPEAKING" ? "Speaking" : "Writing"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.task}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.submittedAt}
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.aiScore?.toFixed(1) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
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
                          <Link href="/learner/submissions">Xem kết quả</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile cards */}
            <div className="space-y-3 p-4 sm:hidden">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {s.skill === "SPEAKING" ? "Speaking" : "Writing"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {s.task}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs",
                        STATUS_STYLES[s.status],
                      )}
                    >
                      {SUBMISSION_STATUS_LABELS[s.status]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {s.submittedAt}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {s.aiScore?.toFixed(1) ?? "—"}
                      </span>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {s.cefr}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nhận xét AI gần đây</CardTitle>
            <CardDescription>Tổng quan từ AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-foreground">
                  Điểm mạnh
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {feedbackStrengths.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="gap-1.5 px-2.5 py-1 text-xs border-success/20 bg-success/10 text-success"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">
                  Cần cải thiện
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {feedbackImprovements.map((w) => (
                  <Badge
                    key={w}
                    variant="outline"
                    className="gap-1.5 px-2.5 py-1 text-xs border-destructive/20 bg-destructive/10 text-destructive"
                  >
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Link href="/learner/feedback">
                Xem phản hồi chi tiết
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động luyện tập</CardTitle>
            <CardDescription>
              Bạn đã luyện {practicedDays}/7 ngày trong tuần này.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              {weeklyActivity.map((d) => (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-10 w-full items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      d.practiced
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {d.practiced > 0 ? "✓" : ""}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {d.date}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={weeklyProgress} className="h-2" />
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Mic className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Speaking
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {weeklySpeaking}
                </p>
                <p className="text-xs text-muted-foreground">phiên</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <PenLine className="h-4 w-4 text-chart-5" />
                  <span className="text-xs text-muted-foreground">Writing</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {weeklyWriting}
                </p>
                <p className="text-xs text-muted-foreground">phiên</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Thời gian
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {weeklyMinutes}
                </p>
                <p className="text-xs text-muted-foreground">phút</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Luyện tập nhanh</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_QUICK_ACTIONS.map((qa) => (
              <Button
                key={qa.id}
                asChild
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Link href={qa.href}>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      qa.skill === "SPEAKING"
                        ? "bg-primary/10 text-primary"
                        : "bg-chart-5/10 text-chart-5",
                    )}
                  >
                    {qa.skill === "SPEAKING" ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <PenLine className="h-4 w-4" />
                    )}
                  </div>
                  <span className="flex-1 text-left">{qa.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
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
