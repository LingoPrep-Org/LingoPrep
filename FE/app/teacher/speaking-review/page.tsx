"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  Check,
  Edit3,
  Mic,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TeacherService from "@/services/teacher.services/teacher.services";
import type { TeacherSubmissionResponse } from "@/services/teacher.services/type";
import {
  CEFR_OPTIONS,
  type CEFRLevel,
} from "@/lib/data/mock-speaking-review";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-warning/30 bg-warning/10 text-warning",
  NEEDS_RECHECK: "border-destructive/20 bg-destructive/10 text-destructive",
  REVIEWED: "border-success/20 bg-success/10 text-success",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FeedbackSection({
  title,
  items,
  icon,
  accent,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md",
            accent,
          )}
        >
          {icon}
        </span>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <ul className="space-y-1.5 pl-8">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TeacherSpeakingReviewPage() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const [submission, setSubmission] = React.useState<TeacherSubmissionResponse | null>(null);
  const [loadError, setLoadError] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(80);
  const [playbackSpeed, setPlaybackSpeed] = React.useState("1");

  const [reviewStatus, setReviewStatus] = React.useState("Đang tải...");
  const [reviewStatusKey, setReviewStatusKey] = React.useState("PENDING");
  const [teacherScore, setTeacherScore] = React.useState("");
  const [teacherCefr, setTeacherCefr] = React.useState<CEFRLevel>("A1");
  const [teacherFeedback, setTeacherFeedback] = React.useState("");
  const [overrideMode, setOverrideMode] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => {
    if (!submissionId) { setLoadError(true); return; }
    TeacherService.getSubmission(submissionId).then((data) => {
      setSubmission(data);
      setTeacherScore(String(data.teacher_review?.overall_band ?? data.assessment?.overall_band ?? ""));
      setTeacherCefr((data.teacher_review?.overall_cefr ?? data.assessment?.overall_cefr ?? "A1") as CEFRLevel);
      const reviewed = data.status === "REVIEWED";
      setReviewStatusKey(reviewed ? "REVIEWED" : data.status === "REVIEW_REQUESTED" ? "NEEDS_RECHECK" : "PENDING");
      setReviewStatus(reviewed ? "Đã đánh giá" : data.status === "REVIEW_REQUESTED" ? "Cần giáo viên kiểm tra" : "Chờ đánh giá");
    }).catch(() => setLoadError(true));
  }, [submissionId]);
  const sub = submission ? {
    learnerName: submission.user_name || `Người học #${submission.user_id}`,
    taskLabel: submission.question?.part ?? "Bài Speaking",
    topic: submission.question?.topic ?? submission.question?.title ?? "—",
    question: submission.question?.prompt ?? "Chưa có đề bài.",
    submittedAt: new Date(submission.created_at).toLocaleString("vi-VN"),
    aiScore: submission.assessment?.overall_band ?? 0,
    cefr: submission.assessment?.overall_cefr ?? "N/A",
    audioDurationSeconds: submission.duration_seconds || 0,
    audioPath: submission.audio_path,
  } : null;
  const transcript = submission?.content_text ?? "Chưa có transcript.";
  const assessment = submission?.assessment;
  const criteria = assessment ? [
    ["Fluency", assessment.fluency_score], ["Pronunciation", assessment.pronunciation_score],
    ["Grammar", assessment.grammar_score], ["Vocabulary", assessment.lexical_score],
    ["Task Response", assessment.task_response_score],
  ].filter((item): item is [string, number] => typeof item[1] === "number") : [];
  const audit = { aiEvaluatedAt: assessment?.evaluated_at ? new Date(assessment.evaluated_at).toLocaleString("vi-VN") : "—", teacherEvaluatedAt: submission?.teacher_review?.reviewed_at ? new Date(submission.teacher_review.reviewed_at).toLocaleString("vi-VN") : "Chưa đánh giá", aiVersion: "—" };

  const progress = sub?.audioDurationSeconds ? (currentTime / sub.audioDurationSeconds) * 100 : 0;

  React.useEffect(() => {
    if (!isPlaying || !sub?.audioDurationSeconds) return;
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const next = t + Number(playbackSpeed);
        if (next >= sub!.audioDurationSeconds) {
          setIsPlaying(false);
        return sub!.audioDurationSeconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, sub?.audioDurationSeconds]);

  const togglePlay = () => {
    if (sub && currentTime >= sub.audioDurationSeconds) setCurrentTime(0);
    setIsPlaying((p) => !p);
  };

  const handleAcceptAI = () => {
    if (!sub) return;
    setTeacherScore(String(sub.aiScore));
    setTeacherCefr(sub.cefr as CEFRLevel);
    setTeacherFeedback("");
    setOverrideMode(false);
    setReviewStatus("Đã đánh giá");
    setReviewStatusKey("REVIEWED");
    setSaved(true);
    toast.success("Đã xác nhận đánh giá AI.");
  };

  const handleOverride = () => {
    setOverrideMode(true);
    setSaved(false);
    toast.info(
      "Đã bật chế độ điều chỉnh. Bạn có thể thay đổi điểm, CEFR và nhận xét.",
    );
  };

  const handleSave = async () => {
    if (!submissionId) return;
    if (
      !teacherScore.trim() ||
      Number(teacherScore) < 0 ||
      Number(teacherScore) > 10
    ) {
      toast.error("Vui lòng nhập điểm giáo viên từ 0 đến 10.");
      return;
    }
    if (!teacherCefr) {
      toast.error("Vui lòng chọn CEFR giáo viên.");
      return;
    }
    if (!teacherFeedback.trim()) {
      toast.error("Vui lòng nhập nhận xét của giáo viên.");
      return;
    }
    try {
      await TeacherService.submitReview(submissionId, {
        overall_band: Number(teacherScore),
        overall_cefr: teacherCefr,
        teacher_notes: teacherFeedback.trim(),
      });
      setReviewStatus("Đã đánh giá");
      setReviewStatusKey("REVIEWED");
      setSaved(true);
      setOverrideMode(false);
      toast.success("Đã lưu đánh giá Speaking.");
    } catch {
      toast.error("Không thể lưu đánh giá lên máy chủ.");
    }
  };

  if (!submission) return <div className="p-6 text-sm text-muted-foreground">{loadError ? "Không thể tải bài Speaking. Vui lòng quay lại danh sách và thử lại." : "Đang tải bài Speaking..."}</div>;

  return (
    <>
      <PageHeader
        title="Đánh giá Speaking"
        description="Giáo viên xem bài Speaking, kết quả AI và thực hiện đánh giá bổ sung hoặc điều chỉnh feedback khi cần."
      >
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/teacher/submissions">
            <ArrowLeft className="h-4 w-4" />
            Quay lại bài nộp
          </Link>
        </Button>
      </PageHeader>

      {/* Submission Summary */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {sub!.learnerName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Speaking — {sub!.taskLabel} · {sub!.submittedAt}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  AI Score: {sub!.aiScore.toFixed(1)}
                </Badge>
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  CEFR: {sub!.cefr}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2 py-0.5 text-xs",
                    STATUS_STYLES[reviewStatusKey],
                  )}
                >
                  {reviewStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt + Audio/Transcript */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Prompt + Audio + Transcript */}
        <div className="space-y-6">
          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đề bài</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {sub!.taskLabel}
                </Badge>
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  Topic: {sub!.topic}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {sub!.question}
              </p>
            </CardContent>
          </Card>

          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bài nói</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1 space-y-1.5">
                  <div className="relative h-2 rounded-full bg-muted">
                    <div
                      className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(sub!.audioDurationSeconds)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-1 w-24 cursor-pointer p-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={playbackSpeed}
                    onValueChange={setPlaybackSpeed}
                  >
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Phát lại bài nói</p>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Transcript</CardTitle>
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  STT Transcript
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;{transcript}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Độ tin cậy transcript:
                </span>
                <Badge
                  variant="outline"
                  className="px-2 py-0.5 text-xs border-success/20 bg-success/10 text-success"
                >
                  {assessment ? "Có kết quả AI" : "Chưa có kết quả AI"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Evaluation + AI Feedback */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đánh giá từ AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">AI Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {sub!.aiScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">/ 10</p>
                </div>
                <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">CEFR</p>
                  <p className="text-2xl font-bold text-foreground">
                    {sub!.cefr}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2.5">
                {criteria.map(([name, score]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm font-semibold text-foreground">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {criteria.length === 0 ? "Chưa có điểm theo tiêu chí từ AI." : "Điểm theo tiêu chí từ kết quả AI."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback từ AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FeedbackSection
                title="Điểm mạnh"
                items={assessment?.strengths ?? []}
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                accent="bg-success/10"
              />
              <FeedbackSection
                title="Cần cải thiện"
                items={assessment?.weaknesses ?? []}
                icon={<AlertCircle className="h-3.5 w-3.5 text-warning" />}
                accent="bg-warning/10"
              />
              <FeedbackSection
                title="Gợi ý cải thiện"
                items={assessment?.recommendations ?? []}
                icon={<Info className="h-3.5 w-3.5 text-primary" />}
                accent="bg-primary/10"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Teacher Review */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Đánh giá của giáo viên</CardTitle>
          <CardDescription>
            Nhập đánh giá bổ sung hoặc điều chỉnh kết quả AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {overrideMode && (
            <Alert className="border-primary/30">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-sm">Điều chỉnh đánh giá</AlertTitle>
              <AlertDescription className="text-xs">
                Đánh giá của giáo viên sẽ được lưu thay cho kết quả AI trong
                phiên review này.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="teacher-score">Điểm giáo viên</Label>
              <div className="relative">
                <Input
                  id="teacher-score"
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={teacherScore}
                  onChange={(e) => setTeacherScore(e.target.value)}
                  disabled={!overrideMode}
                  placeholder="0 – 10"
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  /10
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>CEFR giáo viên</Label>
              <Select
                value={teacherCefr}
                onValueChange={(v) => setTeacherCefr(v as CEFRLevel)}
                disabled={!overrideMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn CEFR" />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái review</Label>
              <div className="flex h-9 items-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-1 text-xs",
                    STATUS_STYLES[reviewStatusKey],
                  )}
                >
                  {reviewStatus}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-feedback">Teacher Feedback</Label>
            <Textarea
              id="teacher-feedback"
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
              disabled={!overrideMode}
              placeholder="Nhập nhận xét của giáo viên..."
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleAcceptAI}
              disabled={saved && !overrideMode}
            >
              <Check className="h-4 w-4" />
              Giữ nguyên đánh giá AI
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleOverride}
              disabled={overrideMode}
            >
              <Edit3 className="h-4 w-4" />
              Điều chỉnh đánh giá
            </Button>
            <Button
              className="gap-2 sm:ml-auto"
              onClick={handleSave}
              disabled={!overrideMode && saved}
            >
              <Save className="h-4 w-4" />
              Lưu đánh giá
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Thông tin đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <span className="text-muted-foreground">AI đánh giá lúc: </span>
              <span className="font-medium text-foreground">
                {audit.aiEvaluatedAt}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                Giáo viên đánh giá lúc:{" "}
              </span>
              <span className="font-medium text-foreground">
                {audit.teacherEvaluatedAt}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Phiên bản AI: </span>
              <span className="font-medium text-foreground">
                {audit.aiVersion}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
