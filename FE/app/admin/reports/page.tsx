'use client';

import * as React from 'react';
import {
  Users,
  Activity,
  Mic,
  PenLine,
  Bot,
  AlertTriangle,
  Download,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout/page-header';
import { KpiCard } from '@/components/shared/kpi-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DATE_RANGE_LABELS,
  REPORT_SUMMARIES,
  USER_GROWTH_BY_RANGE,
  PRACTICE_ACTIVITY_BY_RANGE,
  SPEAKING_USAGE_BY_RANGE,
  WRITING_USAGE_BY_RANGE,
  AI_USAGE_BY_RANGE,
  AI_REQUESTS_BY_RANGE,
  SYSTEM_ERRORS_BY_RANGE,
  type DateRange,
  type ChartPoint,
  type DualChartPoint,
  type ErrorChartPoint,
  type SkillUsage,
  type AIUsage,
} from '@/lib/data/mock-reports';

function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value.toLocaleString('vi-VN')}
          {unit}
        </p>
      ))}
    </div>
  );
}

function UsageRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </span>
    </div>
  );
}

export default function AdminReportsPage() {
  const [range, setRange] = React.useState<DateRange>('30D');
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const summary = REPORT_SUMMARIES[range];
  const userGrowth = USER_GROWTH_BY_RANGE[range];
  const practiceActivity = PRACTICE_ACTIVITY_BY_RANGE[range];
  const speakingUsage = SPEAKING_USAGE_BY_RANGE[range];
  const writingUsage = WRITING_USAGE_BY_RANGE[range];
  const aiUsage = AI_USAGE_BY_RANGE[range];
  const aiRequests = AI_REQUESTS_BY_RANGE[range];
  const systemErrors = SYSTEM_ERRORS_BY_RANGE[range];

  const handleRangeChange = (v: string) => {
    setLoading(true);
    setRange(v as DateRange);
    setTimeout(() => setLoading(false), 400);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success('Đã xuất báo cáo hệ thống.');
    }, 800);
  };

  return (
    <>
      <PageHeader
        title="Báo cáo & thống kê"
        description="Theo dõi các số liệu tổng quan về hoạt động và mức độ sử dụng của hệ thống."
      >
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Hôm nay</SelectItem>
              <SelectItem value="7D">7 ngày</SelectItem>
              <SelectItem value="30D">30 ngày</SelectItem>
              <SelectItem value="3M">3 tháng</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Xuất báo cáo hệ thống
          </Button>
        </div>
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Users} label="Người dùng đăng ký" value={summary.registeredUsers.toLocaleString('vi-VN')} />
        <KpiCard icon={Activity} label="Phiên luyện tập" value={summary.practiceSessions.toLocaleString('vi-VN')} iconClassName="bg-primary/10 text-primary" />
        <KpiCard icon={Mic} label="Lượt luyện Speaking" value={summary.speakingSessions.toLocaleString('vi-VN')} />
        <KpiCard icon={PenLine} label="Lượt luyện Writing" value={summary.writingSessions.toLocaleString('vi-VN')} iconClassName="bg-chart-5/10 text-chart-5" />
        <KpiCard icon={Bot} label="Lượt đánh giá AI" value={summary.aiEvaluations.toLocaleString('vi-VN')} iconClassName="bg-success/10 text-success" />
        <KpiCard icon={AlertTriangle} label="Tỷ lệ lỗi hệ thống" value={summary.systemErrorRate} iconClassName="bg-destructive/10 text-destructive" />
      </div>

      {/* User Growth + Practice Activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tăng trưởng người dùng</CardTitle>
            <CardDescription>
              Số người dùng đăng ký theo thời gian — {DATE_RANGE_LABELS[range]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={userGrowth} margin={{ left: -16, right: 8 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <RTooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" name="Người dùng" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#userGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động luyện tập</CardTitle>
            <CardDescription>
              Phiên Speaking và Writing theo thời gian — {DATE_RANGE_LABELS[range]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={practiceActivity} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <RTooltip content={<ChartTooltip />} />
                  <Bar dataKey="speaking" name="Speaking" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="writing" name="Writing" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Speaking Usage + Writing Usage */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sử dụng Speaking</CardTitle>
            <CardDescription>Thống kê tổng hợp phiên Speaking</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div>
                <UsageRow label="Tổng phiên Speaking" value={speakingUsage.totalSessions} />
                <UsageRow label="Phiên hoàn thành" value={speakingUsage.completedSessions} />
                <UsageRow label="Lượt đánh giá AI" value={speakingUsage.aiEvaluations} />
                <UsageRow label="Thời gian xử lý trung bình" value={speakingUsage.avgProcessingTime} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sử dụng Writing</CardTitle>
            <CardDescription>Thống kê tổng hợp phiên Writing</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div>
                <UsageRow label="Tổng phiên Writing" value={writingUsage.totalSessions} />
                <UsageRow label="Phiên hoàn thành" value={writingUsage.completedSessions} />
                <UsageRow label="Lượt đánh giá AI" value={writingUsage.aiEvaluations} />
                <UsageRow label="Thời gian xử lý trung bình" value={writingUsage.avgProcessingTime} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Service Usage */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Sử dụng dịch vụ AI</CardTitle>
          <CardDescription>
            Thống kê yêu cầu và hiệu năng dịch vụ AI — {DATE_RANGE_LABELS[range]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
              <Skeleton className="h-[220px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <UsageRow label="Tổng yêu cầu AI" value={aiUsage.totalRequests} />
                <UsageRow label="Yêu cầu đánh giá Speaking" value={aiUsage.speakingRequests} />
                <UsageRow label="Yêu cầu đánh giá Writing" value={aiUsage.writingRequests} />
                <UsageRow label="Yêu cầu thành công" value={aiUsage.successfulRequests} />
                <UsageRow label="Yêu cầu thất bại" value={aiUsage.failedRequests} />
                <UsageRow label="Thời gian phản hồi trung bình" value={aiUsage.avgResponseTime} />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={aiRequests} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <RTooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="value" name="Yêu cầu AI" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--success))' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Errors */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Lỗi hệ thống</CardTitle>
          <CardDescription>
            Số lượng lỗi theo thời gian (API, AI, Hệ thống) — {DATE_RANGE_LABELS[range]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={systemErrors} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <RTooltip content={<ChartTooltip />} />
                <Bar dataKey="api" name="Lỗi API" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai" name="Lỗi AI" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="system" name="Lỗi hệ thống" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}
