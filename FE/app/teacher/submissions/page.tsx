"use client";

import * as React from "react";
import Link from "next/link";
import { Search, FileText, ArrowRight, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import TeacherService from "@/services/teacher.services/teacher.services";
import { toTeacherSubmission } from "@/services/teacher.services/type";
import {
  SUBMISSION_STATUS_LABELS,
  type Submission,
  type SubmissionSkill,
  type SubmissionTask,
  type SubmissionStatus,
} from "@/lib/data/mock-teacher";

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  PENDING: "border-warning/30 bg-warning/10 text-warning",
  IN_PROGRESS: "border-primary/20 bg-primary/10 text-primary",
  REVIEWED: "border-success/20 bg-success/10 text-success",
  NEEDS_RECHECK: "border-destructive/20 bg-destructive/10 text-destructive",
};

type DateFilter = "ALL" | "TODAY" | "7D" | "30D";

const DATE_LABELS: Record<DateFilter, string> = {
  ALL: "Tất cả",
  TODAY: "Hôm nay",
  "7D": "7 ngày gần đây",
  "30D": "30 ngày gần đây",
};

type FilterValue = "ALL" | SubmissionSkill | SubmissionTask | SubmissionStatus;

function isWithinDays(dateStr: string, days: number): boolean {
  const parts = dateStr.split(" ");
  const datePart = parts[0];
  const [dd, mm, yyyy] = datePart.split("/");
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const now = new Date("2026-09-23");
  const diff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff >= 0 && diff <= days;
}

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [fSkill, setFSkill] = React.useState<FilterValue>("ALL");
  const [fTask, setFTask] = React.useState<FilterValue>("ALL");
  const [fStatus, setFStatus] = React.useState<FilterValue>("ALL");
  const [fDate, setFDate] = React.useState<DateFilter>("ALL");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    TeacherService.getReviewQueue()
      .then((items) => setSubmissions(items.map(toTeacherSubmission)))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    return submissions.filter((s) => {
      const q = search.toLowerCase().trim();
      const mSearch = !q || s.learnerName.toLowerCase().includes(q);
      const mSkill = fSkill === "ALL" || s.skill === fSkill;
      const mTask = fTask === "ALL" || s.task === fTask;
      const mStatus = fStatus === "ALL" || s.status === fStatus;
      let mDate = true;
      if (fDate === "TODAY") mDate = isWithinDays(s.submittedAt, 0);
      else if (fDate === "7D") mDate = isWithinDays(s.submittedAt, 7);
      else if (fDate === "30D") mDate = isWithinDays(s.submittedAt, 30);
      return mSearch && mSkill && mTask && mStatus && mDate;
    });
  }, [submissions, search, fSkill, fTask, fStatus, fDate]);

  React.useEffect(() => setPage(1), [search, fSkill, fTask, fStatus, fDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setFSkill("ALL");
    setFTask("ALL");
    setFStatus("ALL");
    setFDate("ALL");
  };

  return (
    <>
      <PageHeader
        title="Bài nộp"
        description="Danh sách các bài Speaking và Writing cần giáo viên kiểm tra."
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <Select
              value={fTask}
              onValueChange={(v) => setFTask(v as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả task</SelectItem>
                <SelectItem value="TASK_1">Task 1</SelectItem>
                <SelectItem value="TASK_2">Task 2</SelectItem>
                <SelectItem value="TASK_3">Task 3</SelectItem>
                <SelectItem value="TASK_4">Task 4</SelectItem>
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
                <SelectItem value="PENDING">Chờ đánh giá</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                <SelectItem value="REVIEWED">Đã đánh giá</SelectItem>
                <SelectItem value="NEEDS_RECHECK">Cần kiểm tra lại</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={fDate}
              onValueChange={(v) => setFDate(v as DateFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả thời gian</SelectItem>
                <SelectItem value="TODAY">Hôm nay</SelectItem>
                <SelectItem value="7D">7 ngày gần đây</SelectItem>
                <SelectItem value="30D">30 ngày gần đây</SelectItem>
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
      {pageItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Không tìm thấy bài nộp
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
                  {pageItems.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.learnerName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
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
                          <Link
                            href={
                              s.skill === "SPEAKING"
                                ? `/teacher/speaking-review?submissionId=${s.id}`
                                : `/teacher/writing-review?submissionId=${s.id}`
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
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages} ({filtered.length} bài nộp)
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setPage(currentPage - 1);
                  }}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setPage(currentPage + 1);
                  }}
                  className={cn(
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
