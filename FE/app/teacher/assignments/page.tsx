"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ClipboardList,
  Play,
  CheckCircle2,
  FileText,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TeacherService from "@/services/teacher.services/teacher.services";
import type { TeacherAssignmentResponse, TeacherQuestionResponse, TeacherStudentProgressResponse } from "@/services/teacher.services/type";
import {
  ASSIGNMENT_STATUS_LABELS,
  type Assignment,
  type AssignmentStatus,
  type AssignmentSubmission,
} from "@/lib/data/mock-teacher-assignments";
import {
  SKILL_LABELS,
  TASK_LABELS,
  type QuestionSkill,
  type QuestionTask,
} from "@/lib/data/mock-question-bank";

const PAGE_SIZE = 6;

function mapAssignment(item: TeacherAssignmentResponse): Assignment {
  return {
    id: String(item.id), name: item.name, description: item.description,
    skill: item.skill,
    task: item.part.toUpperCase().replace("PART", "TASK").replace(" ", "_") as QuestionTask,
    questionId: String(item.question_id), questionContent: item.question_content,
    learnerIds: item.learner_ids.map(String),
    startDate: new Date(item.start_date).toLocaleDateString("vi-VN"),
    dueDate: item.due_date ? new Date(item.due_date).toLocaleDateString("vi-VN") : "—",
    duration: item.duration, status: item.status, totalLearners: item.total_learners,
    submittedCount: item.submitted_count,
  };
}

function toApiDate(value: string): string | null {
  if (!value.trim() || value === "—") return null;
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day).toISOString();
}

const STATUS_STYLES: Record<AssignmentStatus, string> = {
  DRAFT: "border-muted-foreground/20 bg-muted text-muted-foreground",
  ACTIVE: "border-success/20 bg-success/10 text-success",
  COMPLETED: "border-primary/20 bg-primary/10 text-primary",
};

const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Đã nộp",
  NOT_SUBMITTED: "Chưa nộp",
  IN_PROGRESS: "Đang làm",
};

const SUBMISSION_STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "border-success/20 bg-success/10 text-success",
  NOT_SUBMITTED: "border-muted-foreground/20 bg-muted text-muted-foreground",
  IN_PROGRESS: "border-warning/30 bg-warning/10 text-warning",
};

type FilterValue = "ALL" | QuestionSkill | QuestionTask | AssignmentStatus;

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [questions, setQuestions] = React.useState<TeacherQuestionResponse[]>([]);
  const [learners, setLearners] = React.useState<TeacherStudentProgressResponse[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = React.useState<
    AssignmentSubmission[]
  >([]);
  const [search, setSearch] = React.useState("");
  const [fSkill, setFSkill] = React.useState<FilterValue>("ALL");
  const [fTask, setFTask] = React.useState<FilterValue>("ALL");
  const [fStatus, setFStatus] = React.useState<FilterValue>("ALL");
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [detailId, setDetailId] = React.useState<string | null>(null);

  React.useEffect(() => {
    TeacherService.getAssignments()
      .then((items) => setAssignments(items.map(mapAssignment)))
      .catch(() => toast.error("Không thể tải danh sách bài kiểm tra."));
    TeacherService.getQuestions().then(setQuestions).catch(() => toast.error("Không thể tải ngân hàng câu hỏi."));
    TeacherService.getStudentProgress().then(setLearners).catch(() => toast.error("Không thể tải danh sách người học."));
  }, []);

  React.useEffect(() => {
    if (!detailId) return;
    TeacherService.getAssignmentSubmissions(detailId)
      .then((items) =>
        setAssignmentSubmissions(
          items.map((item) => ({
            id: String(item.id),
            learnerName: item.learner_name,
            status:
              item.status === "REVIEWED" || item.status === "EVALUATED" || item.status === "REVIEW_REQUESTED"
                ? "SUBMITTED"
                : item.status === "PENDING" ? "NOT_SUBMITTED" : "IN_PROGRESS",
            score: item.score ?? null,
            cefr: item.cefr ?? null,
            submittedAt: item.submitted_at
              ? new Date(item.submitted_at).toLocaleString("vi-VN")
              : null,
            skill: item.skill,
          })),
        ),
      )
      .catch(() => toast.error("Không thể tải người học của bài kiểm tra."));
  }, [detailId]);

  // Create/Edit form state
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    skill: "SPEAKING" as QuestionSkill,
    task: "TASK_1" as QuestionTask,
    questionId: "",
    learnerIds: [] as string[],
    startDate: "",
    dueDate: "",
    duration: 15,
    status: "DRAFT" as AssignmentStatus,
  });

  const filtered = React.useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase().trim();
      const mSearch = !q || a.name.toLowerCase().includes(q);
      const mSkill = fSkill === "ALL" || a.skill === fSkill;
      const mTask = fTask === "ALL" || a.task === fTask;
      const mStatus = fStatus === "ALL" || a.status === fStatus;
      return mSearch && mSkill && mTask && mStatus;
    });
  }, [assignments, search, fSkill, fTask, fStatus]);

  React.useEffect(() => setPage(1), [search, fSkill, fTask, fStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setFSkill("ALL");
    setFTask("ALL");
    setFStatus("ALL");
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      skill: "SPEAKING",
      task: "TASK_1",
      questionId: "",
      learnerIds: [],
      startDate: "",
      dueDate: "",
      duration: 15,
      status: "DRAFT",
    });
    setEditId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (a: Assignment) => {
    setForm({
      name: a.name,
      description: a.description,
      skill: a.skill,
      task: a.task,
      questionId: a.questionId,
      learnerIds: a.learnerIds,
      startDate: a.startDate,
      dueDate: a.dueDate,
      duration: a.duration,
      status: a.status,
    });
    setEditId(a.id);
    setShowCreate(true);
  };

  const openCopy = (a: Assignment) => {
    setForm({
      name: `${a.name} (Bản sao)`,
      description: a.description,
      skill: a.skill,
      task: a.task,
      questionId: a.questionId,
      learnerIds: a.learnerIds,
      startDate: a.startDate,
      dueDate: a.dueDate,
      duration: a.duration,
      status: "DRAFT",
    });
    setEditId(null);
    setShowCreate(true);
  };

  const handleSave = async (saveAsDraft: boolean) => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên bài kiểm tra.");
      return;
    }
    if (!form.questionId) {
      toast.error("Vui lòng chọn câu hỏi.");
      return;
    }
    if (form.learnerIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người học.");
      return;
    }

    const status: AssignmentStatus = saveAsDraft
      ? "DRAFT"
      : form.status === "DRAFT"
        ? "ACTIVE"
        : form.status;

    const startDate = toApiDate(form.startDate) ?? new Date().toISOString();
    const payload = { question_id: Number(form.questionId), name: form.name.trim(), description: form.description.trim(), learner_ids: form.learnerIds.map(Number), start_date: startDate, due_date: toApiDate(form.dueDate), duration: form.duration, status };
    try {
      const saved = editId
        ? await TeacherService.updateAssignment(editId, payload)
        : await TeacherService.createAssignment(payload);
      setAssignments((prev) => editId ? prev.map((a) => a.id === editId ? mapAssignment(saved) : a) : [mapAssignment(saved), ...prev]);
      toast.success(editId ? "Đã cập nhật bài kiểm tra." : saveAsDraft ? "Đã lưu bản nháp." : "Đã tạo bài kiểm tra.");
      setShowCreate(false);
      resetForm();
    } catch {
      toast.error("Không thể lưu bài kiểm tra lên máy chủ.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await TeacherService.deleteAssignment(deleteId);
      setAssignments((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
      toast.success("Đã xóa bài kiểm tra.");
    } catch { toast.error("Không thể xóa bài kiểm tra."); }
  };

  const availableQuestions = questions.filter(
    (q) =>
      q.skill === form.skill && q.part.toUpperCase().replace("PART", "TASK").replace(" ", "_") === form.task && q.is_active !== false,
  );

  // Detail View
  if (detailId) {
    const assignment = assignments.find((a) => a.id === detailId);
    if (!assignment) {
      setDetailId(null);
      return null;
    }
    const submissions = assignmentSubmissions;
    const submitted = submissions.filter(
      (s) => s.status === "SUBMITTED",
    ).length;
    const notSubmitted = submissions.filter(
      (s) => s.status !== "SUBMITTED",
    ).length;

    return (
      <>
        <PageHeader title="Chi tiết bài kiểm tra" description={assignment.name}>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setDetailId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </PageHeader>

        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {SKILL_LABELS[assignment.skill]}
                </Badge>
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {TASK_LABELS[assignment.task]}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2 py-0.5 text-xs",
                    STATUS_STYLES[assignment.status],
                  )}
                >
                  {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {assignment.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {assignment.startDate} → {assignment.dueDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {assignment.duration} phút
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {assignment.totalLearners} người học
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2">
            <span className="text-sm text-muted-foreground">Đã nộp:</span>
            <Badge
              variant="outline"
              className="border-success/20 bg-success/10 text-success"
            >
              {submitted}
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2">
            <span className="text-sm text-muted-foreground">Chưa nộp:</span>
            <Badge
              variant="outline"
              className="border-muted-foreground/20 bg-muted text-muted-foreground"
            >
              {notSubmitted}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách người học</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người học</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead>CEFR</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.learnerName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            SUBMISSION_STATUS_STYLES[s.status],
                          )}
                        >
                          {SUBMISSION_STATUS_LABELS[s.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.score !== null ? s.score.toFixed(1) : "—"}
                      </TableCell>
                      <TableCell>
                        {s.cefr ? (
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-xs"
                          >
                            {s.cefr}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.submittedAt ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.status === "SUBMITTED" ? (
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
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
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
        title="Bài kiểm tra"
        description="Tạo và quản lý các bài luyện Speaking & Writing cho người học."
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tạo bài kiểm tra
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={ClipboardList}
          label="Tổng bài kiểm tra"
          value={String(assignments.length)}
        />
        <KpiCard
          icon={Play}
          label="Đang hoạt động"
          value={String(assignments.filter((a) => a.status === "ACTIVE").length)}
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Đã kết thúc"
          value={String(assignments.filter((a) => a.status === "COMPLETED").length)}
          iconClassName="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={FileText}
          label="Bản nộp"
          value={String(assignments.reduce((sum, a) => sum + a.submittedCount, 0))}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
      </div>

      {/* Filters */}
      <Card className="mt-6 mb-4">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên bài kiểm tra..."
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
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
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
              <ClipboardList className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Không tìm thấy bài kiểm tra
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
                    <TableHead>Tên bài kiểm tra</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Người học</TableHead>
                    <TableHead>Đã nộp</TableHead>
                    <TableHead>Hạn nộp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
                          {SKILL_LABELS[a.skill]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {TASK_LABELS[a.task]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.totalLearners}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.submittedCount}/{a.totalLearners}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.dueDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            STATUS_STYLES[a.status],
                          )}
                        >
                          {ASSIGNMENT_STATUS_LABELS[a.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDetailId(a.id)}
                            title="Xem"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(a)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openCopy(a)}
                            title="Sao chép"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(a.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
            Trang {currentPage} / {totalPages} ({filtered.length} bài kiểm tra)
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setShowCreate(open);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Cập nhật thông tin bài kiểm tra."
                : "Tạo bài luyện Speaking hoặc Writing cho người học."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a-name">Tên bài kiểm tra</Label>
              <Input
                id="a-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nhập tên bài kiểm tra..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-desc">Mô tả</Label>
              <Textarea
                id="a-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Mô tả ngắn về bài kiểm tra..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại bài</Label>
                <Select
                  value={form.skill}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      skill: v as QuestionSkill,
                      questionId: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPEAKING">Speaking</SelectItem>
                    <SelectItem value="WRITING">Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Task</Label>
                <Select
                  value={form.task}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      task: v as QuestionTask,
                      questionId: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TASK_1">Task 1</SelectItem>
                    <SelectItem value="TASK_2">Task 2</SelectItem>
                    <SelectItem value="TASK_3">Task 3</SelectItem>
                    <SelectItem value="TASK_4">Task 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Chọn câu hỏi</Label>
              {availableQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Không có câu hỏi phù hợp cho kỹ năng và task này.
                </p>
              ) : (
                <Select
                  value={form.questionId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, questionId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn câu hỏi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestions.map((q) => (
                      <SelectItem key={q.id} value={String(q.id)}>
                        {q.topic ?? q.title} — {q.prompt.slice(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Người học</Label>
              <ScrollArea className="h-32 rounded-md border border-border p-3">
                <div className="space-y-2">
                  {learners.map((l) => (
                    <div key={l.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`learner-${l.id}`}
                        checked={form.learnerIds.includes(String(l.id))}
                        onCheckedChange={(checked) => {
                          setForm((f) => ({
                            ...f,
                            learnerIds: checked
                              ? [...f.learnerIds, String(l.id)]
                              : f.learnerIds.filter((id) => id !== String(l.id)),
                          }));
                        }}
                      />
                      <Label
                        htmlFor={`learner-${l.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {l.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="a-start">Ngày bắt đầu</Label>
                <Input
                  id="a-start"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-due">Hạn nộp</Label>
                <Input
                  id="a-due"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="a-duration">Thời lượng (phút)</Label>
                <Input
                  id="a-duration"
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as AssignmentStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Bản nháp</SelectItem>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Hủy
            </Button>
            <Button variant="outline" onClick={() => handleSave(true)}>
              Lưu bản nháp
            </Button>
            <Button onClick={() => handleSave(false)}>
              {editId ? "Cập nhật" : "Tạo bài kiểm tra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài kiểm tra</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
