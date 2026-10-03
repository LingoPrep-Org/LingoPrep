"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  Lock,
  Activity,
  Mic,
  PenLine,
  Bot,
  Server,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/badges";
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
import AdminService from "@/services/admin.services/admin.services";
import type { AdminStats } from "@/services/admin.services/type";
import {
  MOCK_ACCOUNT_ACTIVITY,
  MOCK_SYSTEM_STATUS,
  USER_GROWTH_DATA,
  PRACTICE_ACTIVITY_DATA,
  AI_EVALUATION_DATA,
} from "@/lib/data/mock-users";

const SERVICE_STATUS_META: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  operational: {
    label: "Hoạt động",
    className: "border-success/20 bg-success/10 text-success",
    icon: CheckCircle2,
  },
  warning: {
    label: "Cảnh báo",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: AlertCircle,
  },
  down: {
    label: "Ngừng hoạt động",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

const ACTIVITY_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  success: {
    label: "Thành công",
    className: "border-success/20 bg-success/10 text-success",
  },
  pending: {
    label: "Chờ xử lý",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  warning: {
    label: "Cảnh báo",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
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
          {entry.name}: {entry.value.toLocaleString("vi-VN")}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);

  React.useEffect(() => {
    AdminService.getStats()
      .then(setStats)
      .catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Tổng quan về tài khoản, hoạt động luyện tập và tình trạng hệ thống."
      />

      {/* Account KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Tổng người dùng"
          value={stats ? stats.total_users.toLocaleString("vi-VN") : "—"}
        />
        <KpiCard
          icon={UserCheck}
          label="Tổng câu hỏi"
          value={stats ? stats.total_questions.toLocaleString("vi-VN") : "—"}
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={Clock}
          label="Tổng bài nộp"
          value={stats ? stats.total_submissions.toLocaleString("vi-VN") : "—"}
          iconClassName="bg-warning/10 text-warning"
        />
        <KpiCard
          icon={Lock}
          label="Job AI đang chờ"
          value={
            stats ? stats.pending_assessment_jobs.toLocaleString("vi-VN") : "—"
          }
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      {/* System Activity KPIs */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          icon={Activity}
          label="Tổng phiên luyện tập"
          value="8.642"
          trend="+12,1% so với tháng trước"
          trendType="positive"
        />
        <KpiCard
          icon={Mic}
          label="Phiên Speaking"
          value="4.321"
          iconClassName="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={PenLine}
          label="Phiên Writing"
          value="4.321"
          iconClassName="bg-chart-5/10 text-chart-5"
        />
        <KpiCard
          icon={Bot}
          label="Yêu cầu đánh giá AI"
          value="6.321"
          trend="+15,3% so với tháng trước"
          trendType="positive"
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={Server}
          label="Uptime hệ thống"
          value="99,8%"
          trend="Ổn định trong 30 ngày qua"
          trendType="positive"
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tăng trưởng người dùng</CardTitle>
            <CardDescription>Số lượng người dùng theo tuần</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={USER_GROWTH_DATA}
                margin={{ left: -16, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
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
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Người dùng"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động luyện tập</CardTitle>
            <CardDescription>
              So sánh phiên Speaking và Writing theo tuần
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={PRACTICE_ACTIVITY_DATA}
                margin={{ left: -16, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
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
                  dataKey="speaking"
                  name="Speaking"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="writing"
                  name="Writing"
                  fill="hsl(var(--chart-5))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Evaluation Chart */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Hoạt động đánh giá AI</CardTitle>
          <CardDescription>
            Số lượng yêu cầu đánh giá AI theo tuần
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={AI_EVALUATION_DATA}
              margin={{ left: -16, right: 8 }}
            >
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--success))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--success))"
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
                dataKey="week"
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
              <Area
                type="monotone"
                dataKey="requests"
                name="Yêu cầu AI"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fill="url(#aiGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Status + Recent Activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trạng thái hệ thống</CardTitle>
            <CardDescription>Tình trạng các dịch vụ hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_SYSTEM_STATUS.map((svc) => {
              const meta = SERVICE_STATUS_META[svc.status];
              const Icon = meta.icon;
              return (
                <div
                  key={svc.name}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {svc.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 px-2.5 py-0.5 text-xs font-medium",
                      meta.className,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Hoạt động tài khoản gần đây
            </CardTitle>
            <CardDescription>Sự kiện vòng đời tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Người dùng</TableHead>
                  <TableHead className="text-xs">Sự kiện</TableHead>
                  <TableHead className="text-xs">Thời gian</TableHead>
                  <TableHead className="text-xs">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ACCOUNT_ACTIVITY.map((act) => {
                  const meta = ACTIVITY_STATUS_META[act.status];
                  return (
                    <TableRow key={act.id}>
                      <TableCell className="font-medium">
                        {act.userName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {act.event}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {act.timeAgo}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium",
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Quản lý tài khoản
              </p>
              <p className="text-xs text-muted-foreground">
                Xem và quản lý trạng thái tài khoản người dùng.
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="gap-1.5">
              <Link href="/admin/users">
                Xem tài khoản
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Đăng ký Teacher
              </p>
              <p className="text-xs text-muted-foreground">
                Xem các yêu cầu đăng ký Teacher đang chờ xử lý.
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="gap-1.5">
              <Link href="/admin/users?status=PENDING">
                Xem yêu cầu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
