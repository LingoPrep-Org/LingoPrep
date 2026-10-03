"use client";

import * as React from "react";
import {
  Server,
  Database,
  Bot,
  HardDrive,
  Cpu,
  MemoryStick,
  Timer,
  AlertTriangle,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AdminService from "@/services/admin.services/admin.services";
import {
  MOCK_SERVICES,
  MOCK_SYSTEM_METRICS,
  MOCK_RESOURCE_USAGE,
  PERFORMANCE_DATA,
  ERROR_RATE_DATA,
  type ServiceInfo,
  type ServiceStatus,
} from "@/lib/data/mock-monitoring";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "Backend API": Server,
  Database: Database,
  Redis: Database,
  "AI Service": Bot,
  Storage: HardDrive,
};

const STATUS_META: Record<
  ServiceStatus,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
    dotColor: string;
  }
> = {
  OPERATIONAL: {
    label: "Hoạt động",
    className: "border-success/20 bg-success/10 text-success",
    icon: CheckCircle2,
    dotColor: "bg-success",
  },
  WARNING: {
    label: "Cảnh báo",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: AlertCircle,
    dotColor: "bg-warning",
  },
  DOWN: {
    label: "Ngừng hoạt động",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
    icon: XCircle,
    dotColor: "bg-destructive",
  },
};

const METRIC_ICONS: Record<string, React.ElementType> = {
  cpu: Cpu,
  memory: MemoryStick,
  api: Timer,
  error: AlertTriangle,
  uptime: Activity,
};

function getThresholdColor(value: number): string {
  if (value >= 85) return "bg-destructive";
  if (value >= 65) return "bg-warning";
  return "bg-success";
}

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
          {entry.name.includes("lỗi") || entry.name.includes("Error")
            ? "%"
            : " ms"}
        </p>
      ))}
    </div>
  );
}

function formatTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminMonitoringPage() {
  const [services, setServices] = React.useState<ServiceInfo[]>(MOCK_SERVICES);
  const [lastUpdate, setLastUpdate] = React.useState("19:45");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const applyInfraStatus = React.useCallback(async () => {
    const infra = await AdminService.getInfraStatus();
    setServices((previous) =>
      previous.map((service) => {
        if (service.name === "Database" || service.name === "Redis") {
          return {
            ...service,
            name: "Redis",
            status: infra.redis.available ? "OPERATIONAL" : "WARNING",
            lastChecked: "Vừa xong",
          };
        }
        if (service.name === "Storage") {
          return {
            ...service,
            status: infra.object_storage.available ? "OPERATIONAL" : "WARNING",
            lastChecked: "Vừa xong",
          };
        }
        return service;
      }),
    );
  }, []);

  React.useEffect(() => {
    applyInfraStatus().catch(() => undefined);
  }, [applyInfraStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await applyInfraStatus();
      setLastUpdate(formatTime());
      toast.success("Đã cập nhật dữ liệu giám sát.");
    } catch {
      toast.error("Không thể tải trạng thái hạ tầng.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const allOperational = services.every((s) => s.status === "OPERATIONAL");

  return (
    <>
      <PageHeader
        title="Giám sát hệ thống"
        description="Theo dõi tình trạng hoạt động và hiệu năng của các dịch vụ trong hệ thống."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
          Làm mới dữ liệu
        </Button>
      </PageHeader>

      {/* Overall System Status */}
      <Card
        className={cn(
          "mb-6 border-2",
          allOperational ? "border-success/30" : "border-warning/40",
        )}
      >
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                allOperational ? "bg-success/10" : "bg-warning/10",
              )}
            >
              {allOperational ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : (
                <AlertCircle className="h-6 w-6 text-warning" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {allOperational
                  ? "Hệ thống đang hoạt động bình thường"
                  : "Hệ thống có cảnh báo"}
              </p>
              <p className="text-sm text-muted-foreground">
                {allOperational
                  ? "Tất cả dịch vụ chính đang hoạt động ổn định."
                  : "Một số dịch vụ cần chú ý."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 px-3 py-1 text-sm font-medium",
                allOperational
                  ? "border-success/20 bg-success/10 text-success"
                  : "border-warning/30 bg-warning/10 text-warning",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  allOperational ? "bg-success" : "bg-warning",
                )}
              />
              {allOperational ? "Hoạt động" : "Cảnh báo"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Cập nhật lần cuối: {lastUpdate}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((svc) => {
          const meta = STATUS_META[svc.status];
          const Icon = SERVICE_ICONS[svc.name] ?? Server;
          return (
            <Card key={svc.name}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 px-2 py-0.5 text-xs font-medium",
                      meta.className,
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", meta.dotColor)}
                    />
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {svc.name}
                </p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phản hồi</span>
                    <span className="font-medium text-foreground">
                      {svc.responseTime} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Kiểm tra lần cuối
                    </span>
                    <span className="font-medium text-foreground">
                      {svc.lastChecked}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Metrics */}
      <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground">
        Chỉ số hệ thống
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {MOCK_SYSTEM_METRICS.map((metric) => {
          const Icon = METRIC_ICONS[metric.icon] ?? Activity;
          const iconClass =
            metric.icon === "error"
              ? "bg-destructive/10 text-destructive"
              : metric.icon === "uptime"
                ? "bg-success/10 text-success"
                : "bg-primary/10 text-primary";
          return (
            <KpiCard
              key={metric.label}
              icon={Icon}
              label={metric.label}
              value={metric.value}
              iconClassName={iconClass}
            />
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Hiệu năng hệ thống</CardTitle>
          <CardDescription>
            Thời gian phản hồi API theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PERFORMANCE_DATA} margin={{ left: -16, right: 8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                unit=" ms"
              />
              <RTooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="responseTime"
                name="Thời gian phản hồi API"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground">
        Tài nguyên hệ thống
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {MOCK_RESOURCE_USAGE.map((res) => (
          <Card key={res.label}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {res.label}
                </CardTitle>
                <span className="text-lg font-bold text-foreground">
                  {res.value}
                  {res.unit}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    getThresholdColor(res.value),
                  )}
                  style={{ width: `${res.value}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span
                  className={cn(
                    "font-medium",
                    res.value >= 85
                      ? "text-destructive"
                      : res.value >= 65
                        ? "text-warning"
                        : "text-success",
                  )}
                >
                  {res.value >= 85
                    ? "Cao"
                    : res.value >= 65
                      ? "Trung bình"
                      : "Ổn định"}
                </span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Rate Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tỷ lệ lỗi</CardTitle>
          <CardDescription>
            Tỷ lệ lỗi theo thời gian (API, AI, Hệ thống)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={ERROR_RATE_DATA} margin={{ left: -16, right: 8 }}>
              <defs>
                <linearGradient id="apiErr" x1="0" y1="0" x2="0" y2="1">
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
                <linearGradient id="aiErr" x1="0" y1="0" x2="0" y2="1">
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
                <linearGradient id="sysErr" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--destructive))"
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
                dataKey="time"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <RTooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="api"
                name="Lỗi API"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#apiErr)"
              />
              <Area
                type="monotone"
                dataKey="ai"
                name="Lỗi AI"
                stroke="hsl(var(--chart-5))"
                strokeWidth={2}
                fill="url(#aiErr)"
              />
              <Area
                type="monotone"
                dataKey="system"
                name="Lỗi hệ thống"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fill="url(#sysErr)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
