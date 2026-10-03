"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Mic,
  PenLine,
  ArrowRight,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Activity,
  Sparkles,
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
import { cn } from "@/lib/utils";
import LearnerService from "@/services/learner.services/learner.services";
import type { LearnerProgressResponse } from "@/services/learner.services/type";
import {
  MOCK_LEARNER_PROGRESS,
  MOCK_SPEAKING_PART_PROGRESS,
  MOCK_WRITING_TASK_PROGRESS,
  MOCK_SPEAKING_SKILL_ANALYSIS,
  MOCK_WRITING_SKILL_ANALYSIS,
  MOCK_STRENGTHS,
  MOCK_AREAS_TO_IMPROVE,
  MOCK_RECOMMENDATIONS,
  MOCK_RECENT_ACTIVITY,
  SCORE_HISTORY_BY_RANGE,
  type ScoreRange,
  type SkillAnalysisItem,
  type PartProgress,
} from "@/lib/data/mock-progress";

type ChartMode = "all" | "speaking" | "writing";

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

function SkillAnalysisSection({
  title,
  data,
  accentClass,
}: {
  title: string;
  data: SkillAnalysisItem[];
  accentClass: string;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.criterion} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {item.criterion}
              </span>
              <span className="text-muted-foreground">{item.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  accentClass,
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartProgressSection({
  items,
  accentClass,
}: {
  items: PartProgress[];
  accentClass: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {item.label}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{item.practices} lần</span>
              <span className="font-bold text-foreground">
                {item.avgScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", accentClass)}
              style={{ width: `${(item.avgScore / 10) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LearnerProgressPage() {
  const [scoreRange, setScoreRange] = React.useState<ScoreRange>("30D");
  const [chartMode, setChartMode] = React.useState<ChartMode>("all");
  const [progress, setProgress] =
    React.useState<LearnerProgressResponse | null>(null);

  React.useEffect(() => {
    LearnerService.getProgress()
      .then(setProgress)
      .catch(() => undefined);
  }, []);

  const scoreData = progress
    ? progress.trend_history.map((item) => ({
        label: item.date,
        speaking: item.type === "SPEAKING" ? item.band : undefined,
        writing: item.type === "WRITING" ? item.band : undefined,
      }))
    : SCORE_HISTORY_BY_RANGE[scoreRange];

  const goalPct = progress
    ? (progress.weekly_completed / progress.weekly_goal) * 100
    : (MOCK_LEARNER_PROGRESS.weeklyCompleted /
        MOCK_LEARNER_PROGRESS.weeklyGoal) *
      100;
  const remaining = progress
    ? progress.weekly_goal - progress.weekly_completed
    : MOCK_LEARNER_PROGRESS.weeklyGoal - MOCK_LEARNER_PROGRESS.weeklyCompleted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Tiến độ học tập
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Theo dõi quá trình luyện Speaking & Writing và biết mình cần cải thiện
          gì.
        </p>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Activity}
          label="Tổng bài đã luyện"
          value={progress ? String(progress.total_practices) : "—"}
        />
        <KpiCard
          icon={Mic}
          label="Speaking"
          value={progress ? `${progress.speaking_practices} bài` : "—"}
        />
        <KpiCard
          icon={PenLine}
          label="Writing"
          value={progress ? `${progress.writing_practices} bài` : "—"}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
        <KpiCard
          icon={Award}
          label="CEFR hiện tại"
          value={progress?.current_cefr ?? "—"}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Current Level + Progress Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Current Level */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Trình độ hiện tại</CardTitle>
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
                {progress?.current_cefr ?? "—"}
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
                  {progress?.overall_progress ?? 0}%
                </span>
              </div>
              <Progress
                value={progress?.overall_progress ?? 0}
                className="h-2.5"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Bạn đang trên hành trình cải thiện từ{" "}
              {progress?.current_cefr ?? "—"} lên {progress?.target_cefr ?? "—"}
              .
            </p>
            <p className="text-xs italic text-muted-foreground">
              * Đây là kết quả tham khảo, không phải chứng chỉ hoặc kết quả thi
              chính thức.
            </p>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Xu hướng tiến bộ</CardTitle>
                <CardDescription>
                  Điểm Speaking và Writing theo thời gian
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={chartMode}
                  onValueChange={(v) => setChartMode(v as ChartMode)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="speaking">Speaking</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={scoreRange}
                  onValueChange={(v) => setScoreRange(v as ScoreRange)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7D">7 ngày</SelectItem>
                    <SelectItem value="30D">30 ngày</SelectItem>
                    <SelectItem value="3M">3 tháng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={scoreData} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient
                    id="speakingGradProg"
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
                    id="writingGradProg"
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
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip content={<ChartTooltip />} />
                {(chartMode === "all" || chartMode === "speaking") && (
                  <Area
                    type="monotone"
                    dataKey="speaking"
                    name="Speaking"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#speakingGradProg)"
                  />
                )}
                {(chartMode === "all" || chartMode === "writing") && (
                  <Area
                    type="monotone"
                    dataKey="writing"
                    name="Writing"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    fill="url(#writingGradProg)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Speaking + Writing Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Speaking Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mic className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Tiến độ Speaking</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Điểm TB</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {progress?.speaking_average.toFixed(1) ?? "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">CEFR</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {progress?.current_cefr ?? "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Bài luyện</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {progress?.speaking_practices ?? "—"}
                </p>
              </div>
            </div>
            <PartProgressSection
              items={
                progress?.speaking_parts.map((item) => ({
                  label: item.label,
                  practices: item.practices,
                  avgScore: item.avg_score,
                })) ?? MOCK_SPEAKING_PART_PROGRESS
              }
              accentClass="bg-primary"
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Link href="/learner/speaking">
                <Mic className="h-4 w-4" />
                Luyện Speaking
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Writing Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                  <PenLine className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Tiến độ Writing</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Điểm TB</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {progress?.writing_average.toFixed(1) ?? "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">CEFR</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {progress?.current_cefr ?? "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Bài luyện</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {progress?.writing_practices ?? "—"}
                </p>
              </div>
            </div>
            <PartProgressSection
              items={
                progress?.writing_tasks.map((item) => ({
                  label: item.label,
                  practices: item.practices,
                  avgScore: item.avg_score,
                })) ?? MOCK_WRITING_TASK_PROGRESS
              }
              accentClass="bg-chart-5"
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Link href="/learner/writing">
                <PenLine className="h-4 w-4" />
                Luyện Writing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Skill Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Kỹ năng cần cải thiện</CardTitle>
              <CardDescription>
                Đây là kết quả tham khảo từ các bài luyện gần đây.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SkillAnalysisSection
            title="Speaking"
            data={
              progress?.speaking_skill_analysis ?? MOCK_SPEAKING_SKILL_ANALYSIS
            }
            accentClass="bg-primary"
          />
          <SkillAnalysisSection
            title="Writing"
            data={
              progress?.writing_skill_analysis ?? MOCK_WRITING_SKILL_ANALYSIS
            }
            accentClass="bg-chart-5"
          />
        </CardContent>
      </Card>

      {/* Strengths + Areas to Improve */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Điểm mạnh</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              {MOCK_STRENGTHS.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Bạn đang duy trì tốt những kỹ năng này.
            </p>
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Cần cải thiện</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              {MOCK_AREAS_TO_IMPROVE.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span className="flex items-start gap-2 text-sm text-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    {item.label}
                  </span>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <Link href={item.href}>
                      Luyện ngay
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Practice Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lightbulb className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Gợi ý luyện tập</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_RECOMMENDATIONS.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {rec.title}
                </p>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
              <Button asChild size="sm" className="shrink-0 gap-2">
                <Link href={rec.href}>
                  <Zap className="h-3.5 w-3.5" />
                  {rec.cta}
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity + Weekly Goal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href="/learner/submissions">
                  Xem tất cả
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_RECENT_ACTIVITY.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      item.skill === "SPEAKING"
                        ? "bg-primary/10 text-primary"
                        : "bg-chart-5/10 text-chart-5",
                    )}
                  >
                    {item.skill === "SPEAKING" ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <PenLine className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {item.skill === "SPEAKING" ? "Speaking" : "Writing"}{" "}
                      {item.task}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">
                    {item.score.toFixed(1)}
                  </span>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {item.cefr}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Mục tiêu luyện tập</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">Mục tiêu tuần này</p>
              <p className="text-3xl font-bold text-foreground">
                {progress?.weekly_goal ?? MOCK_LEARNER_PROGRESS.weeklyGoal} bài
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Đã hoàn thành</span>
                <span className="font-semibold text-foreground">
                  {progress?.weekly_completed ??
                    MOCK_LEARNER_PROGRESS.weeklyCompleted}{" "}
                  / {progress?.weekly_goal ?? MOCK_LEARNER_PROGRESS.weeklyGoal}
                </span>
              </div>
              <Progress value={goalPct} className="h-2.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining > 0
                ? `Còn ${remaining} bài để hoàn thành mục tiêu tuần này.`
                : "Bạn đã hoàn thành mục tiêu tuần này!"}
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Link href="/learner/speaking">
                Luyện ngay
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground italic">
        * Tất cả điểm số, CEFR và phân tích kỹ năng trên trang này là kết quả
        tham khảo từ các bài luyện trong hệ thống, không phải chứng chỉ hoặc kết
        quả thi Aptis chính thức.
      </p>
    </div>
  );
}
