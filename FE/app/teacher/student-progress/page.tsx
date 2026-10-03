"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Mic,
  PenLine,
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  Activity,
  Award,
  Calendar,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import TeacherService from "@/services/teacher.services/teacher.services";
import {
  MOCK_STUDENT_PROGRESS,
  MOCK_PRACTICE_HISTORY,
  DEFAULT_STUDENT_DETAIL,
  PROGRESS_STATUS_LABELS,
  PRACTICE_STATUS_LABELS,
  SCORE_RANGE_LABELS,
  SCORE_HISTORY_BY_RANGE,
  type StudentProgress,
  type ProgressStatus,
  type ScoreRange,
  type PracticeStatus,
} from "@/lib/data/mock-student-progress";

const STATUS_STYLES: Record<ProgressStatus, string> = {
  PRACTICING: "border-primary/20 bg-primary/10 text-primary",
  IMPROVING: "border-success/20 bg-success/10 text-success",
  NEEDS_IMPROVEMENT: "border-destructive/20 bg-destructive/10 text-destructive",
};

const PRACTICE_STATUS_STYLES: Record<PracticeStatus, string> = {
  AI_REVIEWED: "border-primary/20 bg-primary/10 text-primary",
  TEACHER_REVIEWED: "border-success/20 bg-success/10 text-success",
  PENDING_REVIEW: "border-warning/30 bg-warning/10 text-warning",
};

type FilterValue = "ALL" | "SPEAKING" | "WRITING" | ProgressStatus;

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

export default function TeacherStudentProgressPage() {
  const [students, setStudents] = React.useState<StudentProgress[]>([]);
  const [search, setSearch] = React.useState("");
  const [fSkill, setFSkill] = React.useState<FilterValue>("ALL");
  const [fCefr, setFCefr] = React.useState<string>("ALL");
  const [fStatus, setFStatus] = React.useState<FilterValue>("ALL");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [scoreRange, setScoreRange] = React.useState<ScoreRange>("30D");

  React.useEffect(() => {
    TeacherService.getStudentProgress()
      .then((items) =>
        setStudents(
          items.map((item) => ({
            id: String(item.id),
            name: item.name,
            email: item.email,
            speakingScore: item.speaking_score,
            writingScore: item.writing_score,
            cefr: item.cefr,
            totalSubmissions: item.total_submissions,
            lastPractice: "—",
            status: item.status,
            joinDate: new Date(item.joined_at).toLocaleDateString("vi-VN"),
          })),
        ),
      )
      .catch(() => toast.error("Không thể tải tiến độ người học."));
  }, []);

  const filtered = React.useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase().trim();
      const mSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const mSkill =
        fSkill === "ALL" ||
        (fSkill === "SPEAKING" && s.speakingScore >= s.writingScore) ||
        (fSkill === "WRITING" && s.writingScore >= s.speakingScore);
      const mCefr = fCefr === "ALL" || s.cefr === fCefr;
      const mStatus = fStatus === "ALL" || s.status === fStatus;
      return mSearch && mSkill && mCefr && mStatus;
    });
  }, [students, search, fSkill, fCefr, fStatus]);

  const clearFilters = () => {
    setSearch("");
    setFSkill("ALL");
    setFCefr("ALL");
    setFStatus("ALL");
  };

  if (selectedId) {
    const student =
      MOCK_STUDENT_PROGRESS.find((s) => s.id === selectedId) ??
      MOCK_STUDENT_PROGRESS[0];
    const detail = DEFAULT_STUDENT_DETAIL;
    const scoreData = SCORE_HISTORY_BY_RANGE[scoreRange];

    return (
      <>
        <PageHeader
          title="Tiến độ người học"
          description="Theo dõi lịch sử kết quả, xu hướng tiến bộ và các kỹ năng cần cải thiện."
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </PageHeader>

        {/* Student Info */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">
                  {student.name}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{student.email}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Tham gia: {student.joinDate}
                  </span>
                  <span>·</span>
                  <span>Tổng bài nộp: {student.totalSubmissions}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "px-2.5 py-1 text-xs",
                  STATUS_STYLES[student.status],
                )}
              >
                {PROGRESS_STATUS_LABELS[student.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            icon={Mic}
            label="Speaking Score"
            value={student.speakingScore.toFixed(1)}
          />
          <KpiCard
            icon={PenLine}
            label="Writing Score"
            value={student.writingScore.toFixed(1)}
            iconClassName="bg-chart-5/10 text-chart-5"
          />
          <KpiCard
            icon={Award}
            label="Overall CEFR"
            value={student.cefr}
            iconClassName="bg-success/10 text-success"
          />
          <KpiCard
            icon={Activity}
            label="Tổng phiên luyện"
            value={String(detail.totalPracticeSessions)}
            iconClassName="bg-primary/10 text-primary"
          />
        </div>

        {/* Score History Chart */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Lịch sử điểm số</CardTitle>
                <CardDescription>
                  Xu hướng điểm Speaking và Writing theo thời gian
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
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={scoreData} margin={{ left: -16, right: 8 }}>
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
                <Line
                  type="monotone"
                  dataKey="speaking"
                  name="Speaking"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="writing"
                  name="Writing"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--chart-5))" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CEFR Progression + Strengths/Weaknesses */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tiến trình CEFR</CardTitle>
              <CardDescription>Sự thay đổi CEFR theo thời gian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {detail.cefrProgression.map((entry, i) => (
                  <React.Fragment key={i}>
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <Badge
                        variant="outline"
                        className="px-3 py-1 text-sm font-bold border-primary/20 bg-primary/10 text-primary"
                      >
                        {entry.cefr}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.date}
                      </span>
                    </div>
                    {i < detail.cefrProgression.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm sm:flex-row sm:justify-between">
                <div>
                  <span className="text-muted-foreground">CEFR hiện tại: </span>
                  <span className="font-semibold text-foreground">
                    {student.cefr}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Cập nhật gần nhất:{" "}
                  </span>
                  <span className="font-semibold text-foreground">
                    {detail.cefrUpdated}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                * Chỉ thể hiện kết quả đánh giá trong hệ thống, không phải điểm
                thi Aptis chính thức.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Điểm mạnh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detail.strengths.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="gap-1.5 px-2.5 py-1 text-xs border-success/20 bg-success/10 text-success"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cần cải thiện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detail.weaknesses.map((w) => (
                    <Badge
                      key={w}
                      variant="outline"
                      className="gap-1.5 px-2.5 py-1 text-xs border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {w}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Practice History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Lịch sử luyện tập gần đây</CardTitle>
            <CardDescription>
              Các bài luyện tập và kết quả đánh giá
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Kỹ năng</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>CEFR</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_PRACTICE_HISTORY.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
                          {p.skill === "SPEAKING" ? "Speaking" : "Writing"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.task}
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.score.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
                          {p.cefr}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.evaluation}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            PRACTICE_STATUS_STYLES[p.status],
                          )}
                        >
                          {PRACTICE_STATUS_LABELS[p.status]}
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
                              p.skill === "SPEAKING"
                                ? "/teacher/speaking-review"
                                : "/teacher/writing-review"
                            }
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Xem bài
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

  return (
    <>
      <PageHeader
        title="Tiến độ người học"
        description="Theo dõi lịch sử kết quả, xu hướng tiến bộ và các kỹ năng cần cải thiện."
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên người học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              value={fSkill}
              onValueChange={(v) => setFSkill(v as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kỹ năng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả kỹ năng</SelectItem>
                <SelectItem value="SPEAKING">Speaking</SelectItem>
                <SelectItem value="WRITING">Writing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fCefr} onValueChange={setFCefr}>
              <SelectTrigger>
                <SelectValue placeholder="CEFR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả CEFR</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={fStatus}
              onValueChange={(v) => setFStatus(v as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PRACTICING">Đang luyện tập</SelectItem>
                <SelectItem value="IMPROVING">Có tiến bộ</SelectItem>
                <SelectItem value="NEEDS_IMPROVEMENT">Cần cải thiện</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table / Empty */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <TrendingUp className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Không tìm thấy người học
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người học</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Speaking</TableHead>
                    <TableHead>Writing</TableHead>
                    <TableHead>CEFR</TableHead>
                    <TableHead>Bài đã nộp</TableHead>
                    <TableHead>Luyện gần nhất</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs border-primary/20 bg-primary/5 text-primary"
                        >
                          {s.speakingScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs border-chart-5/20 bg-chart-5/5 text-chart-5"
                        >
                          {s.writingScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
                          {s.cefr}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.totalSubmissions}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.lastPractice}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            STATUS_STYLES[s.status],
                          )}
                        >
                          {PROGRESS_STATUS_LABELS[s.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setSelectedId(s.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem tiến độ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
