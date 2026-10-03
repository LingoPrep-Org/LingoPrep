"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mic,
  PenLine,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  TrendingUp,
  Lightbulb,
  FileText,
  Type,
  Clock,
  RotateCcw,
  UserCheck,
  Volume2,
  Loader2,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { toUnifiedSubmission } from "@/services/learner.services/type";
import {
  getUnifiedSubmission,
  SUBMISSION_STATUS_LABELS,
  type UnifiedSubmission,
} from "@/lib/data/mock-assignments";

const TRANSCRIPT_HIGHLIGHTS: Record<
  string,
  { className: string; label: string }
> = {
  grammar: {
    className:
      "bg-destructive/15 text-destructive underline decoration-destructive/50",
    label: "Grammar",
  },
  vocabulary: {
    className: "bg-primary/15 text-primary underline decoration-primary/50",
    label: "Vocabulary",
  },
  pronunciation: {
    className: "bg-warning/15 text-warning underline decoration-warning/50",
    label: "Pronunciation",
  },
};

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: "border-warning/30 bg-warning/10 text-warning",
  AI_REVIEWED: "border-primary/20 bg-primary/10 text-primary",
  TEACHER_REVIEWED: "border-success/20 bg-success/10 text-success",
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const submissionId = String(params?.submissionId ?? "");
  const [submission, setSubmission] = React.useState<UnifiedSubmission | null>(
    () => getUnifiedSubmission(submissionId) ?? null,
  );
  const [showRequestDialog, setShowRequestDialog] = React.useState(false);
  const [reviewRequested, setReviewRequested] = React.useState(false);

  React.useEffect(() => {
    LearnerService.getSubmission(submissionId)
      .then((item) => setSubmission(toUnifiedSubmission(item)))
      .catch(() => undefined);
  }, [submissionId]);

  React.useEffect(() => {
    if (submission?.teacherReview.reviewRequested) {
      setReviewRequested(true);
    }
  }, [submission]);

  if (!submission) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Không tìm thấy bài nộp
              </h2>
              <p className="text-sm text-muted-foreground">
                Bài nộp này không tồn tại.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/learner/submissions">
                <ArrowLeft className="h-4 w-4" />
                Xem bài đã nộp
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSpeaking = submission.skill === "SPEAKING";
  const practiceHref = isSpeaking
    ? `/learner/speaking/practice/${submission.taskNumber}`
    : `/learner/writing/practice/${submission.taskNumber}`;
  const isProcessing = submission.status === "PROCESSING";
  const hasResult =
    submission.status === "AI_REVIEWED" ||
    submission.status === "TEACHER_REVIEWED";
  const hasTeacher = submission.teacherReview.reviewed;
  const audioSrc = submission.audioPath
    ? submission.audioPath.startsWith("http")
      ? submission.audioPath
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${submission.audioPath}`
    : null;

  const handleRequestReview = async () => {
    try {
      await LearnerService.requestReview(submissionId);
      setShowRequestDialog(false);
      setReviewRequested(true);
      toast.success("Đã gửi yêu cầu đánh giá đến giáo viên.");
    } catch {
      toast.error("Không thể gửi yêu cầu đánh giá.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/learner/submissions">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isSpeaking
                  ? "bg-primary/10 text-primary"
                  : "bg-chart-5/10 text-chart-5",
              )}
            >
              {isSpeaking ? (
                <Mic className="h-5 w-5" />
              ) : (
                <PenLine className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground md:text-2xl">
                {submission.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {isSpeaking ? "Speaking" : "Writing"}
                </Badge>
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {submission.task}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {submission.submittedAt}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "px-2.5 py-1 text-xs shrink-0",
            STATUS_STYLES[submission.status],
          )}
        >
          {SUBMISSION_STATUS_LABELS[submission.status]}
        </Badge>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  Đang xử lý bài của bạn
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI đang đánh giá bài {isSpeaking ? "nói" : "viết"} của bạn
                </p>
              </div>
              <div className="w-full max-w-md space-y-3">
                {[
                  { label: "Bài đã nhận", done: true },
                  { label: "AI đang đánh giá", done: false, current: true },
                  { label: "Feedback", done: false },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        step.done
                          ? "bg-success/10 text-success"
                          : step.current
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : step.current ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        step.done
                          ? "text-foreground"
                          : step.current
                            ? "text-warning"
                            : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Result */}
      {hasResult && submission.aiScore !== undefined && (
        <>
          {/* Score + CEFR */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  AI Score
                </p>
                <p className="mt-2 text-4xl font-bold text-primary">
                  {submission.aiScore.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">/ 10</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  CEFR
                </p>
                <p className="mt-2 text-4xl font-bold text-success">
                  {submission.cefr}
                </p>
                <p className="text-sm text-muted-foreground">Cấp độ hiện tại</p>
              </CardContent>
            </Card>
          </div>

          {/* AI vs Teacher comparison */}
          {hasTeacher &&
            submission.teacherReview.teacherScore !== undefined && (
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-success" />
                    <CardTitle className="text-base">
                      So sánh AI vs Teacher
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        AI Evaluation
                      </p>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        {submission.aiScore.toFixed(1)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {submission.cefr}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        Teacher Review
                      </p>
                      <p className="mt-1 text-2xl font-bold text-success">
                        {submission.teacherReview.teacherScore.toFixed(1)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {submission.teacherReview.teacherCEFR}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Rubric */}
          {submission.rubric.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Award className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">Chi tiết đánh giá</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {submission.rubric.map((r) => (
                  <div key={r.criterion} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {r.criterion}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {r.score.toFixed(1)}
                      </span>
                    </div>
                    <Progress value={(r.score / 10) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Feedback */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Phản hồi AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {submission.aiFeedback.strengths.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-semibold text-foreground">
                      Điểm mạnh
                    </span>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {submission.aiFeedback.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {submission.aiFeedback.improvements.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-semibold text-foreground">
                      Cần cải thiện
                    </span>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {submission.aiFeedback.improvements.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {submission.aiFeedback.suggestions.length > 0 && (
                <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      Gợi ý luyện tập
                    </span>
                  </div>
                  <ul className="space-y-1 pl-6">
                    {submission.aiFeedback.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Speaking: Audio + Transcript */}
      {isSpeaking && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Volume2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Audio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {audioSrc ? (
              <audio
                controls
                preload="metadata"
                src={audioSrc}
                className="w-full"
              />
            ) : (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Chưa có file audio cho bài nộp này.
              </p>
            )}

            {/* Transcript */}
            {submission.transcript && submission.transcript.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Transcript
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TRANSCRIPT_HIGHLIGHTS).map(([key, val]) => (
                    <Badge
                      key={key}
                      variant="outline"
                      className={cn("gap-1.5 text-xs", val.className)}
                    >
                      {val.label}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed">
                  {submission.transcript.map((seg, i) => (
                    <span
                      key={i}
                      className={
                        seg.type !== "normal"
                          ? TRANSCRIPT_HIGHLIGHTS[seg.type].className
                          : "text-foreground"
                      }
                    >
                      {seg.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Writing: Content */}
      {!isSpeaking && submission.writingContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                  <FileText className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Bài viết của bạn</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {submission.wordCount !== undefined && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Type className="h-3 w-3" />
                    {submission.wordCount} words
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {submission.submittedAt}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">
                {submission.writingContent}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teacher Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <UserCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Teacher Review</CardTitle>
            </div>
            {hasTeacher ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-success/20 bg-success/10 text-success"
              >
                <CheckCircle2 className="h-3 w-3" />
                Đã được giáo viên đánh giá
              </Badge>
            ) : reviewRequested ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/20 bg-primary/10 text-primary"
              >
                <Clock className="h-3 w-3" />
                Đã yêu cầu Teacher Review
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">
                Chưa được đánh giá
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasTeacher ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Teacher Score</p>
                  <p className="mt-1 text-2xl font-bold text-success">
                    {submission.teacherReview.teacherScore?.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Teacher CEFR</p>
                  <p className="mt-1 text-2xl font-bold text-success">
                    {submission.teacherReview.teacherCEFR}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm text-foreground">
                  {submission.teacherReview.feedback}
                </p>
              </div>
              {submission.teacherReview.reviewDate && (
                <p className="text-xs text-muted-foreground">
                  Ngày đánh giá: {submission.teacherReview.reviewDate}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {reviewRequested
                  ? "Bạn đã gửi yêu cầu đánh giá. Giáo viên sẽ xem lại bài của bạn trong thời gian tới."
                  : "Bài này chưa được giáo viên đánh giá."}
              </p>
              {!reviewRequested && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowRequestDialog(true)}
                >
                  <UserCheck className="h-4 w-4" />
                  Yêu cầu giáo viên đánh giá
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Practice Again */}
      {hasResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiếp tục luyện tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link href={practiceHref}>
                  <RotateCcw className="h-4 w-4" />
                  {isSpeaking ? "Luyện lại Part này" : "Luyện lại Task này"}
                </Link>
              </Button>
              {submission.taskNumber < 4 && (
                <Button asChild className="flex-1 gap-2">
                  <Link
                    href={
                      isSpeaking
                        ? `/learner/speaking/practice/${submission.taskNumber + 1}`
                        : `/learner/writing/practice/${submission.taskNumber + 1}`
                    }
                  >
                    {isSpeaking
                      ? "Luyện Part tiếp theo"
                      : "Luyện Task tiếp theo"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link href="/learner/progress">
                  <TrendingUp className="h-4 w-4" />
                  Xem tiến độ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request review dialog */}
      <AlertDialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi yêu cầu đánh giá?</AlertDialogTitle>
            <AlertDialogDescription>
              Giáo viên sẽ nhận được yêu cầu xem lại bài của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestReview}>
              Gửi yêu cầu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
