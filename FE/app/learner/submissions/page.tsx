"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCheck,
  Mic,
  PenLine,
  Search,
  ArrowRight,
  Award,
  Sparkles,
  UserCheck,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { KpiCard } from "@/components/shared/kpi-card";
import { cn } from "@/lib/utils";
import {
  SUBMISSION_STATUS_LABELS,
  type UnifiedSubmission,
  type SubmissionStatus,
} from "@/lib/data/mock-assignments";
import LearnerService from "@/services/learner.services/learner.services";
import { toUnifiedSubmission } from "@/services/learner.services/type";

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  PROCESSING: "border-warning/30 bg-warning/10 text-warning",
  AI_REVIEWED: "border-primary/20 bg-primary/10 text-primary",
  TEACHER_REVIEWED: "border-success/20 bg-success/10 text-success",
};

type SortMode = "newest" | "oldest" | "score_high" | "score_low";

export default function LearnerSubmissionsPage() {
  const [submissions, setSubmissions] = React.useState<UnifiedSubmission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [skillFilter, setSkillFilter] = React.useState<string>("all");
  const [taskFilter, setTaskFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("newest");

  React.useEffect(() => {
    LearnerService.getSubmissions()
      .then((items) => setSubmissions(items.map(toUnifiedSubmission)))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    let result = submissions.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.task.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === "all" || s.skill === skillFilter;
      const matchesTask =
        taskFilter === "all" || String(s.taskNumber) === taskFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesSkill && matchesTask && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      switch (sortMode) {
        case "oldest":
          return a.submittedAt.localeCompare(b.submittedAt);
        case "newest":
          return b.submittedAt.localeCompare(a.submittedAt);
        case "score_high":
          return (b.aiScore ?? 0) - (a.aiScore ?? 0);
        case "score_low":
          return (a.aiScore ?? 99) - (b.aiScore ?? 99);
        default:
          return 0;
      }
    });

    return result;
  }, [submissions, search, skillFilter, taskFilter, statusFilter, sortMode]);

  const total = submissions.length;
  const speakingCount = submissions.filter(
    (s) => s.skill === "SPEAKING",
  ).length;
  const writingCount = submissions.filter((s) => s.skill === "WRITING").length;
  const teacherReviewed = submissions.filter(
    (s) => s.status === "TEACHER_REVIEWED",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Bài đã nộp
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Xem lại các bài Speaking và Writing bạn đã hoàn thành.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={FileCheck}
          label="Tổng bài đã nộp"
          value={String(total)}
        />
        <KpiCard icon={Mic} label="Speaking" value={String(speakingCount)} />
        <KpiCard
          icon={PenLine}
          label="Writing"
          value={String(writingCount)}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
        <KpiCard
          icon={UserCheck}
          label="Teacher review"
          value={String(teacherReviewed)}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm bài đã nộp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Kỹ năng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="SPEAKING">Speaking</SelectItem>
                <SelectItem value="WRITING">Writing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={taskFilter} onValueChange={setTaskFilter}>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="1">Task 1</SelectItem>
                <SelectItem value="2">Task 2</SelectItem>
                <SelectItem value="3">Task 3</SelectItem>
                <SelectItem value="4">Task 4</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                <SelectItem value="AI_REVIEWED">Đã đánh giá</SelectItem>
                <SelectItem value="TEACHER_REVIEWED">Teacher review</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortMode}
              onValueChange={(v) => setSortMode(v as SortMode)}
            >
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="score_high">Điểm cao → thấp</SelectItem>
                <SelectItem value="score_low">Điểm thấp → cao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submission list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <FileCheck className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Bạn chưa có bài nộp nào
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Hãy bắt đầu luyện Speaking hoặc Writing để bài nộp của bạn xuất
              hiện ở đây.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href="/learner/speaking">Luyện Speaking</Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/learner/writing">Luyện Writing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden sm:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bài</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Ngày nộp</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>CEFR</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s: UnifiedSubmission) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-0.5 text-xs",
                              s.skill === "SPEAKING"
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-chart-5/20 bg-chart-5/10 text-chart-5",
                            )}
                          >
                            {s.skill === "SPEAKING" ? "Speaking" : "Writing"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.task}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.submittedAt.split(" ")[0]}
                        </TableCell>
                        <TableCell className="font-medium">
                          {s.aiScore !== undefined ? s.aiScore.toFixed(1) : "—"}
                        </TableCell>
                        <TableCell>
                          {s.cefr ? (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {s.cefr}
                            </Badge>
                          ) : (
                            "—"
                          )}
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
                            <Link href={`/learner/submissions/${s.id}`}>
                              Xem kết quả
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

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((s: UnifiedSubmission) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            s.skill === "SPEAKING"
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-chart-5/20 bg-chart-5/10 text-chart-5",
                          )}
                        >
                          {s.skill === "SPEAKING" ? "Speaking" : "Writing"}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">
                          {s.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{s.submittedAt.split(" ")[0]}</span>
                        {s.aiScore !== undefined && (
                          <span>Score: {s.aiScore.toFixed(1)}</span>
                        )}
                        {s.cefr && (
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {s.cefr}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs shrink-0",
                        STATUS_STYLES[s.status],
                      )}
                    >
                      {SUBMISSION_STATUS_LABELS[s.status]}
                    </Badge>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full gap-1.5"
                  >
                    <Link href={`/learner/submissions/${s.id}`}>
                      Xem kết quả
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground italic">
        * Điểm và CEFR thể hiện kết quả luyện tập trong hệ thống, không phải
        chứng chỉ hoặc điểm thi Aptis chính thức.
      </p>
    </div>
  );
}
