"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  PenLine,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Type,
  Save,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LearnerService from "@/services/learner.services/learner.services";
import {
  WRITING_TASKS,
  MOCK_WRITING_RESULT,
  type WritingTask,
  type WritingPrompt,
} from "@/lib/data/mock-writing";

type Phase = "practice" | "processing" | "submitted";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function draftKey(taskId: number): string {
  return `learner-writing-draft-${taskId}`;
}

export default function WritingPracticePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params?.taskId) || 1;
  const task = WRITING_TASKS.find((t) => t.id === taskId) ?? WRITING_TASKS[0];
  const prompt: WritingPrompt = task.prompts[0];

  const [phase, setPhase] = React.useState<Phase>("practice");
  const [answer, setAnswer] = React.useState("");
  const [timerSeconds, setTimerSeconds] = React.useState(
    task.estimatedTime * 60,
  );
  const [timerPaused, setTimerPaused] = React.useState(false);
  const [timerEnded, setTimerEnded] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [processingStep, setProcessingStep] = React.useState(0);
  const [newSubmissionId, setNewSubmissionId] = React.useState("");
  const [checklist, setChecklist] = React.useState<boolean[]>(() =>
    task.checklist.map(() => false),
  );
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Load draft from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey(task.id));
      if (saved) {
        setAnswer(saved);
        toast.info("Đã khôi phục bản nháp.");
      }
    } catch {
      // ignore
    }
  }, [task.id]);

  // Timer
  React.useEffect(() => {
    if (
      phase === "practice" &&
      !timerPaused &&
      !timerEnded &&
      timerSeconds > 0
    ) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerEnded(true);
            toast.warning("Thời gian luyện tập đã kết thúc.");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timerPaused, timerEnded, timerSeconds]);

  // Autosave
  React.useEffect(() => {
    if (phase !== "practice") return;
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(task.id), answer);
        const now = new Date();
        setSavedAt(
          `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        );
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [answer, task.id, phase]);

  // Processing simulation
  React.useEffect(() => {
    if (phase !== "processing") return;
    const steps = [0, 1, 2, 3];
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((step, i) => {
      timers.push(setTimeout(() => setProcessingStep(step), i * 1500));
    });
    timers.push(
      setTimeout(() => setPhase("submitted"), steps.length * 1500 + 500),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const words = countWords(answer);
  const characters = answer.length;
  const targetPct =
    task.mockWordTargetMax > 0
      ? Math.min((words / task.mockWordTargetMax) * 100, 100)
      : 0;
  const wordStatus: "under" | "within" | "above" =
    words < task.mockWordTargetMin
      ? "under"
      : words > task.mockWordTargetMax
        ? "above"
        : "within";
  const allChecklistChecked = checklist.every(Boolean);
  const canSubmit = words > 0 && !timerPaused;

  const handlePauseResume = () => {
    setTimerPaused((p) => !p);
  };

  const handleResetTimer = () => {
    setTimerSeconds(task.estimatedTime * 60);
    setTimerPaused(false);
    setTimerEnded(false);
  };

  const handleSubmit = async () => {
    if (words < task.mockWordTargetMin) {
      toast.warning(
        `Bài viết của bạn chỉ có ${words} từ. Mục tiêu: ${task.mockWordTargetMin}–${task.mockWordTargetMax} từ.`,
      );
    }
    setShowSubmitDialog(false);
    try {
      const question = await LearnerService.findPracticeQuestion(
        "WRITING",
        task.id,
      );
      if (!question) {
        toast.error("Không tìm thấy câu hỏi Writing tương ứng trên máy chủ.");
        return;
      }
      const submission = await LearnerService.submitWriting(
        question.id,
        answer.trim(),
      );
      setNewSubmissionId(String(submission.id));
    } catch {
      toast.error("Không thể nộp bài Writing lên máy chủ.");
      return;
    }
    try {
      localStorage.removeItem(draftKey(task.id));
    } catch {
      // ignore
    }
    setPhase("processing");
    setProcessingStep(0);
  };

  const toggleChecklist = (i: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  // RENDER: Processing
  if (phase === "processing") {
    const steps = [
      { label: "Bài viết đã được nhận", icon: CheckCircle2 },
      { label: "Kiểm tra nội dung", icon: CheckCircle2 },
      { label: "AI đang đánh giá", icon: Loader2 },
      { label: "Đang tạo feedback", icon: Clock },
    ];
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-chart-5/10">
                <Sparkles className="h-10 w-10 text-chart-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Đang phân tích bài viết...
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI đang đánh giá bài viết của bạn
                </p>
              </div>
              <div className="w-full space-y-3">
                {steps.map((step, i) => {
                  const done = i < processingStep;
                  const current = i === processingStep;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          done
                            ? "bg-success/10 text-success"
                            : current
                              ? "bg-chart-5/10 text-chart-5"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        <step.icon
                          className={cn("h-4 w-4", current && "animate-spin")}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          done
                            ? "text-foreground"
                            : current
                              ? "text-chart-5"
                              : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                      {done && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDER: Submitted
  if (phase === "submitted") {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success/10 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Đã nộp bài!
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI đang phân tích bài viết của bạn.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/learner/submissions">
                    <FileText className="h-4 w-4" />
                    Xem bài đã nộp
                  </Link>
                </Button>
                <Button asChild className="gap-2">
                  <Link href="/learner/writing">
                    <PenLine className="h-4 w-4" />
                    Luyện Writing khác
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDER: Practice workspace
  return (
    <div className="space-y-4">
      {/* Mini header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/learner/writing">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-chart-5 text-primary-foreground">
              <PenLine className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-foreground">APTIS AI</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              Writing Practice
            </span>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          {task.title} — {task.subtitle}
        </Badge>
      </div>

      {/* Timer bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                timerEnded
                  ? "bg-destructive/10 text-destructive"
                  : timerPaused
                    ? "bg-warning/10 text-warning"
                    : "bg-primary/10 text-primary",
              )}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thời gian còn lại</p>
              <p
                className={cn(
                  "text-xl font-bold tabular-nums",
                  timerEnded ? "text-destructive" : "text-foreground",
                )}
              >
                {formatTimer(timerSeconds)}
              </p>
            </div>
          </div>
          {timerEnded && (
            <Badge
              variant="outline"
              className="gap-1.5 border-destructive/20 bg-destructive/10 text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              Thời gian luyện tập đã kết thúc
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePauseResume}
              disabled={timerEnded}
              className="gap-1.5"
              aria-label={
                timerPaused
                  ? "Tiếp tục đếm thời gian"
                  : "Tạm dừng đếm thời gian"
              }
            >
              {timerPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
              {timerPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetTimer}
              className="gap-1.5"
              aria-label="Đặt lại thời gian"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main workspace: Task info + Editor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Task info panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">{task.title}</CardTitle>
                <p className="text-xs text-chart-5 font-medium">
                  {task.subtitle}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Your task
              </h3>
              <p className="text-sm text-muted-foreground">{prompt.scenario}</p>
              {prompt.recipient && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="text-sm font-medium text-foreground">
                    {prompt.recipient}
                  </p>
                </div>
              )}
              {prompt.purpose && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Purpose</p>
                  <p className="text-sm font-medium text-foreground">
                    {prompt.purpose}
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Instructions:
                </p>
                {prompt.instructions.map((inst, i) => (
                  <p
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chart-5/10 text-xs font-bold text-chart-5">
                      {i + 1}
                    </span>
                    {inst}
                  </p>
                ))}
              </div>
              {prompt.questions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Questions to answer:
                  </p>
                  {prompt.questions.map((q, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Q{i + 1}:
                      </span>{" "}
                      {q}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Checklist
              </h3>
              <div className="space-y-1.5">
                {task.checklist.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleChecklist(i)}
                    className="flex w-full items-start gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-accent"
                  >
                    {checklist[i] ? (
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        checklist[i]
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {item}
                    </span>
                  </button>
                ))}
              </div>
              {allChecklistChecked && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-success/20 bg-success/10 text-success"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Đã kiểm tra tất cả
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Type className="h-3 w-3" />
                Target: {task.mockWordTargetMin}–{task.mockWordTargetMax} words
              </Badge>
              <Badge
                variant="outline"
                className="text-xs border-warning/20 bg-warning/5 text-warning"
              >
                Mock practice target
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Editor panel */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your answer</CardTitle>
              {savedAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Save className="h-3 w-3" />
                  Đã lưu bản nháp lúc {savedAt}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="writing-editor" className="sr-only">
              Viết bài trả lời của bạn
            </Label>
            <Textarea
              id="writing-editor"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Start writing your answer here..."
              className="min-h-[300px] resize-y border-0 bg-muted/20 font-serif text-base leading-relaxed focus-visible:ring-1 md:min-h-[400px]"
              style={{ lineHeight: "1.7" }}
            />

            {/* Word count */}
            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-foreground">
                    Words: <span className="tabular-nums">{words}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Characters:{" "}
                    <span className="tabular-nums">{characters}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Target: {task.mockWordTargetMin}–{task.mockWordTargetMax}{" "}
                    words
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {wordStatus === "under" && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-xs border-warning/20 bg-warning/10 text-warning"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Under target
                    </Badge>
                  )}
                  {wordStatus === "within" && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-xs border-success/20 bg-success/10 text-success"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Within target
                    </Badge>
                  )}
                  {wordStatus === "above" && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-xs border-primary/20 bg-primary/10 text-primary"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Above target
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={targetPct} className="h-1.5" />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button asChild variant="ghost" className="gap-2">
                <Link href="/learner/writing">Hủy</Link>
              </Button>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={!canSubmit}
                className="gap-2"
                size="lg"
              >
                Nộp bài
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit confirmation */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nộp bài Writing?</AlertDialogTitle>
            <AlertDialogDescription>
              Sau khi nộp, bạn sẽ không thể chỉnh sửa phiên bản này. Bài viết sẽ
              được chuyển sang bước AI đánh giá.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục viết</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Nộp bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
