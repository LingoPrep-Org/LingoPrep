"use client";

import * as React from "react";
import {
  Library,
  Mic,
  PenLine,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  QUESTION_TOPICS,
  SKILL_LABELS,
  TASK_LABELS,
  DIFFICULTY_LABELS,
  EXAM_TYPE_LABELS,
  QUESTION_STATUS_LABELS,
  type Question,
  type QuestionSkill,
  type QuestionTask,
  type QuestionDifficulty,
  type ExamType,
  type QuestionStatus,
} from "@/lib/data/mock-question-bank";
import AdminService from "@/services/admin.services/admin.services";
import type { QuestionApiResponse } from "@/services/admin.services/type";

const PAGE_SIZE = 8;

const DIFFICULTY_STYLES: Record<QuestionDifficulty, string> = {
  EASY: "border-success/20 bg-success/10 text-success",
  MEDIUM: "border-warning/30 bg-warning/10 text-warning",
  HARD: "border-destructive/20 bg-destructive/10 text-destructive",
};

const QB_STATUS_STYLES: Record<QuestionStatus, string> = {
  ACTIVE: "border-success/20 bg-success/10 text-success",
  DISABLED: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

type FilterValue =
  | "ALL"
  | QuestionSkill
  | QuestionTask
  | QuestionDifficulty
  | ExamType
  | QuestionStatus;

interface QuestionForm {
  content: string;
  skill: QuestionSkill;
  task: QuestionTask;
  topic: string;
  difficulty: QuestionDifficulty;
  examType: ExamType;
  status: QuestionStatus;
}

const EMPTY_FORM: QuestionForm = {
  content: "",
  skill: "SPEAKING",
  task: "TASK_1",
  topic: "",
  difficulty: "EASY",
  examType: "APTIS_GENERAL",
  status: "ACTIVE",
};

function fromApiQuestion(question: QuestionApiResponse): Question {
  const difficulty = question.difficulty?.toUpperCase();
  return {
    id: String(question.id),
    content: question.prompt,
    skill: question.skill,
    task: question.part
      .toUpperCase()
      .replace("PART", "TASK")
      .replace(" ", "_") as QuestionTask,
    topic: question.topic ?? "General",
    difficulty:
      difficulty === "EASY" || difficulty === "HARD" ? difficulty : "MEDIUM",
    examType:
      question.exam_type === "APTIS" ? "APTIS_GENERAL" : "APTIS_ADVANCED",
    status: question.is_active ? "ACTIVE" : "DISABLED",
    updatedAt: question.created_at.slice(0, 10),
  };
}

function toApiQuestion(form: QuestionForm) {
  return {
    exam_type:
      form.examType === "APTIS_GENERAL" || form.examType === "APTIS_ADVANCED"
        ? "APTIS"
        : "IELTS",
    skill: form.skill,
    part: form.task.replace("_", " "),
    title: form.content.trim().slice(0, 255),
    topic: form.topic,
    difficulty: form.difficulty,
    prompt: form.content.trim(),
    is_active: form.status === "ACTIVE",
  };
}

function validateForm(
  form: QuestionForm,
): Partial<Record<keyof QuestionForm, string>> {
  const errors: Partial<Record<keyof QuestionForm, string>> = {};
  if (!form.content.trim()) errors.content = "Nội dung không được để trống.";
  if (!form.topic.trim()) errors.topic = "Chủ đề bắt buộc.";
  return errors;
}

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [fSkill, setFSkill] = React.useState<FilterValue>("ALL");
  const [fTask, setFTask] = React.useState<FilterValue>("ALL");
  const [fTopic, setFTopic] = React.useState<string>("ALL");
  const [fDifficulty, setFDifficulty] = React.useState<FilterValue>("ALL");
  const [fExamType, setFExamType] = React.useState<FilterValue>("ALL");
  const [fStatus, setFStatus] = React.useState<FilterValue>("ALL");
  const [page, setPage] = React.useState(1);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<QuestionForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = React.useState<
    Partial<Record<keyof QuestionForm, string>>
  >({});

  const [confirmToggle, setConfirmToggle] = React.useState<Question | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = React.useState<Question | null>(
    null,
  );

  React.useEffect(() => {
    AdminService.getQuestions()
      .then((items) => setQuestions(items.map(fromApiQuestion)))
      .catch(() => toast.error("Không thể tải ngân hàng câu hỏi."))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    return questions.filter((q) => {
      const s = search.toLowerCase().trim();
      const mSearch = !s || q.content.toLowerCase().includes(s);
      const mSkill = fSkill === "ALL" || q.skill === fSkill;
      const mTask = fTask === "ALL" || q.task === fTask;
      const mTopic = fTopic === "ALL" || q.topic === fTopic;
      const mDiff = fDifficulty === "ALL" || q.difficulty === fDifficulty;
      const mExam = fExamType === "ALL" || q.examType === fExamType;
      const mStatus = fStatus === "ALL" || q.status === fStatus;
      return mSearch && mSkill && mTask && mTopic && mDiff && mExam && mStatus;
    });
  }, [
    questions,
    search,
    fSkill,
    fTask,
    fTopic,
    fDifficulty,
    fExamType,
    fStatus,
  ]);

  React.useEffect(
    () => setPage(1),
    [search, fSkill, fTask, fTopic, fDifficulty, fExamType, fStatus],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const summary = React.useMemo(() => {
    return {
      total: questions.length,
      speaking: questions.filter((q) => q.skill === "SPEAKING").length,
      writing: questions.filter((q) => q.skill === "WRITING").length,
      active: questions.filter((q) => q.status === "ACTIVE").length,
      disabled: questions.filter((q) => q.status === "DISABLED").length,
    };
  }, [questions]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      content: q.content,
      skill: q.skill,
      task: q.task,
      topic: q.topic,
      difficulty: q.difficulty,
      examType: q.examType,
      status: q.status,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSaveForm = async () => {
    const errs = validateForm(form);
    setFormErrors(errs);
    if (Object.values(errs).some((v) => v !== undefined)) {
      toast.error("Vui lòng kiểm tra lại các trường.");
      return;
    }
    try {
      const saved = editingId
        ? await AdminService.updateQuestion(editingId, toApiQuestion(form))
        : await AdminService.createQuestion(toApiQuestion(form));
      const nextQuestion = fromApiQuestion(saved);
      setQuestions((prev) =>
        editingId
          ? prev.map((q) => (q.id === editingId ? nextQuestion : q))
          : [nextQuestion, ...prev],
      );
      toast.success(
        editingId ? "Đã cập nhật câu hỏi." : "Đã thêm câu hỏi thành công.",
      );
      setFormOpen(false);
    } catch {
      toast.error("Không thể lưu câu hỏi lên máy chủ.");
    }
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const next: QuestionStatus =
      confirmToggle.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      if (next === "ACTIVE") {
        await AdminService.updateQuestion(confirmToggle.id, {
          is_active: true,
        });
      } else {
        await AdminService.deleteQuestion(confirmToggle.id);
      }
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === confirmToggle.id ? { ...q, status: next } : q,
        ),
      );
      toast.success(
        next === "ACTIVE" ? "Đã kích hoạt câu hỏi." : "Đã vô hiệu hóa câu hỏi.",
      );
      setConfirmToggle(null);
    } catch {
      toast.error("Không thể cập nhật trạng thái câu hỏi.");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await AdminService.deleteQuestion(confirmDelete.id);
      setQuestions((prev) => prev.filter((q) => q.id !== confirmDelete.id));
      toast.success("Đã xóa câu hỏi.");
      setConfirmDelete(null);
    } catch {
      toast.error("Không thể xóa câu hỏi.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFSkill("ALL");
    setFTask("ALL");
    setFTopic("ALL");
    setFDifficulty("ALL");
    setFExamType("ALL");
    setFStatus("ALL");
  };

  return (
    <>
      <PageHeader
        title="Ngân hàng câu hỏi"
        description="Quản lý ngân hàng câu hỏi dùng chung cho hệ thống luyện thi APTIS Speaking và Writing."
      >
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          icon={Library}
          label="Tổng số câu hỏi"
          value={String(summary.total)}
        />
        <KpiCard
          icon={Mic}
          label="Speaking"
          value={String(summary.speaking)}
          iconClassName="bg-primary/10 text-primary"
        />
        <KpiCard
          icon={PenLine}
          label="Writing"
          value={String(summary.writing)}
          iconClassName="bg-chart-5/10 text-chart-5"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Đang hoạt động"
          value={String(summary.active)}
          iconClassName="bg-success/10 text-success"
        />
        <KpiCard
          icon={XCircle}
          label="Đã vô hiệu hóa"
          value={String(summary.disabled)}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo nội dung câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            <Select value={fTopic} onValueChange={setFTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Chủ đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả chủ đề</SelectItem>
                {QUESTION_TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={fDifficulty}
              onValueChange={(v) => setFDifficulty(v as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả độ khó</SelectItem>
                <SelectItem value="EASY">Dễ</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="HARD">Khó</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={fExamType}
              onValueChange={(v) => setFExamType(v as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại đề</SelectItem>
                <SelectItem value="APTIS_GENERAL">APTIS General</SelectItem>
                <SelectItem value="APTIS_ADVANCED">APTIS Advanced</SelectItem>
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
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="DISABLED">Đã vô hiệu hóa</SelectItem>
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
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Library className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Không tìm thấy câu hỏi
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
        <Card className="mt-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[280px]">
                      Nội dung câu hỏi
                    </TableHead>
                    <TableHead>Kỹ năng</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Chủ đề</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Loại đề</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="max-w-[320px]">
                        <p
                          className="truncate text-sm font-medium text-foreground"
                          title={q.content}
                        >
                          {q.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-xs"
                        >
                          {SKILL_LABELS[q.skill]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {TASK_LABELS[q.task]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {q.topic}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            DIFFICULTY_STYLES[q.difficulty],
                          )}
                        >
                          {DIFFICULTY_LABELS[q.difficulty]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {EXAM_TYPE_LABELS[q.examType]}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            QB_STATUS_STYLES[q.status],
                          )}
                        >
                          {QUESTION_STATUS_LABELS[q.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {q.updatedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openEdit(q)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setConfirmToggle(q)}
                          >
                            <Power className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">
                              {q.status === "ACTIVE"
                                ? "Vô hiệu hóa"
                                : "Kích hoạt"}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(q)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Xóa</span>
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
            Trang {currentPage} / {totalPages} ({filtered.length} câu hỏi)
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
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Cập nhật thông tin câu hỏi"
                : "Tạo câu hỏi mới trong ngân hàng hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-content">Nội dung câu hỏi</Label>
              <Textarea
                id="q-content"
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Nhập nội dung câu hỏi..."
                className="min-h-[80px]"
              />
              {formErrors.content && (
                <p className="text-xs text-destructive">{formErrors.content}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kỹ năng</Label>
                <Select
                  value={form.skill}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, skill: v as QuestionSkill }))
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
                    setForm((p) => ({ ...p, task: v as QuestionTask }))
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="q-topic">Chủ đề</Label>
                <Input
                  id="q-topic"
                  value={form.topic}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, topic: e.target.value }))
                  }
                  placeholder="Nhập chủ đề..."
                />
                {formErrors.topic && (
                  <p className="text-xs text-destructive">{formErrors.topic}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      difficulty: v as QuestionDifficulty,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Dễ</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="HARD">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại đề</Label>
                <Select
                  value={form.examType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, examType: v as ExamType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APTIS_GENERAL">APTIS General</SelectItem>
                    <SelectItem value="APTIS_ADVANCED">
                      APTIS Advanced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as QuestionStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="DISABLED">Đã vô hiệu hóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveForm}>
              {editingId ? "Lưu thay đổi" : "Thêm câu hỏi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Confirmation */}
      <AlertDialog
        open={confirmToggle !== null}
        onOpenChange={(o) => !o && setConfirmToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.status === "ACTIVE"
                ? "Vô hiệu hóa câu hỏi"
                : "Kích hoạt câu hỏi"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.status === "ACTIVE"
                ? "Bạn có chắc chắn muốn vô hiệu hóa câu hỏi này không?"
                : "Bạn có chắc chắn muốn kích hoạt câu hỏi này không?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>
              {confirmToggle?.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa câu hỏi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
