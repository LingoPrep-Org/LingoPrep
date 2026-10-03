"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  FileText,
  Award,
  TrendingUp,
  Lightbulb,
  X,
  Volume2,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
  SPEAKING_PARTS,
  MOCK_SPEAKING_RESULT,
  MOCK_TEACHER_REVIEW,
  type SpeakingPart,
  type SpeakingQuestion,
} from "@/lib/data/mock-speaking";

type RecordingState = "idle" | "recording" | "recorded" | "submitting";
type Phase = "practice" | "processing" | "result";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function WaveformBars({ active }: { active: boolean }) {
  const bars = [8, 16, 24, 32, 24, 16, 8, 16, 24, 16, 8, 16, 24, 32, 24, 16, 8];
  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all",
            active ? "bg-primary animate-pulse" : "bg-muted-foreground/30",
          )}
          style={{
            height: active ? `${h + Math.random() * 12}px` : `${h / 2}px`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

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

export default function SpeakingPracticePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params?.taskId) || 1;
  const part = SPEAKING_PARTS.find((p) => p.id === taskId) ?? SPEAKING_PARTS[0];

  const [phase, setPhase] = React.useState<Phase>("practice");
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [recState, setRecState] = React.useState<RecordingState>("idle");
  const [recTime, setRecTime] = React.useState(0);
  const [prepTime, setPrepTime] = React.useState(part.preparationTime);
  const [prepActive, setPrepActive] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [completedRecordings, setCompletedRecordings] = React.useState<
    boolean[]
  >(() => part.questions.map(() => false));
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [processingStep, setProcessingStep] = React.useState(0);
  const [audioBlobs, setAudioBlobs] = React.useState<(Blob | null)[]>(() =>
    part.questions.map(() => null),
  );
  const [audioUrls, setAudioUrls] = React.useState<(string | null)[]>(() =>
    part.questions.map(() => null),
  );
  const [recordingDurations, setRecordingDurations] = React.useState<number[]>(
    () => part.questions.map(() => 0),
  );
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const prepTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const audioUrlsRef = React.useRef<(string | null)[]>(audioUrls);

  const question: SpeakingQuestion = part.questions[currentQuestion];
  const allCompleted = completedRecordings.every(Boolean);
  const totalQuestions = part.questions.length;
  const partProgress =
    ((currentQuestion + (recState === "recorded" ? 1 : 0)) / totalQuestions) *
    100;

  // Cleanup timers
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      audioUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Recording timer
  React.useEffect(() => {
    if (recState === "recording") {
      timerRef.current = setInterval(() => {
        setRecTime((t) => {
          if (t + 1 >= question.timeLimit) {
            if (timerRef.current) clearInterval(timerRef.current);
            recorderRef.current?.stop();
            setRecState("recorded");
            return question.timeLimit;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recState, question.timeLimit]);

  // Preparation timer (Part 4)
  React.useEffect(() => {
    if (prepActive && prepTime > 0) {
      prepTimerRef.current = setInterval(() => {
        setPrepTime((t) => {
          if (t <= 1) {
            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
            setPrepActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [prepActive, prepTime]);

  const handleStartRecording = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Trình duyệt không hỗ trợ ghi âm.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType,
        });
        setAudioBlobs((previous) => {
          const next = [...previous];
          next[currentQuestion] = blob;
          return next;
        });
        setAudioUrls((previous) => {
          const next = [...previous];
          if (next[currentQuestion])
            URL.revokeObjectURL(next[currentQuestion]!);
          next[currentQuestion] = URL.createObjectURL(blob);
          audioUrlsRef.current = next;
          return next;
        });
        setRecordingDurations((previous) => {
          const next = [...previous];
          next[currentQuestion] = recTime;
          return next;
        });
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecState("recording");
      setRecTime(0);
    } catch {
      toast.error("Không thể truy cập microphone.");
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setRecState("recorded");
    setCompletedRecordings((prev) => {
      const next = [...prev];
      next[currentQuestion] = true;
      return next;
    });
  };

  const handleRetry = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecState("idle");
    setRecTime(0);
    setAudioBlobs((previous) => {
      const next = [...previous];
      next[currentQuestion] = null;
      return next;
    });
    setAudioUrls((previous) => {
      const next = [...previous];
      if (next[currentQuestion]) URL.revokeObjectURL(next[currentQuestion]!);
      next[currentQuestion] = null;
      audioUrlsRef.current = next;
      return next;
    });
    setRecordingDurations((previous) => {
      const next = [...previous];
      next[currentQuestion] = 0;
      return next;
    });
    setCompletedRecordings((prev) => {
      const next = [...prev];
      next[currentQuestion] = false;
      return next;
    });
  };

  const handleContinue = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      setRecState("idle");
      setRecTime(0);
    } else {
      setShowSubmitDialog(true);
    }
  };

  const handleSubmit = async () => {
    if (audioBlobs.some((blob) => !blob)) {
      toast.error("Vui lòng hoàn tất tất cả phần ghi âm trước khi nộp.");
      return;
    }
    try {
      const question = await LearnerService.findPracticeQuestion(
        "SPEAKING",
        taskId,
      );
      if (!question) {
        toast.error("Không tìm thấy câu hỏi Speaking tương ứng trên máy chủ.");
        return;
      }
      await Promise.all(
        audioBlobs.map((blob, index) =>
          LearnerService.submitSpeaking(
            question.id,
            recordingDurations[index],
            blob as Blob,
          ),
        ),
      );
    } catch {
      toast.error("Không thể nộp bài Speaking lên máy chủ.");
      return;
    }
    setShowSubmitDialog(false);
    setRecState("submitting");
    setPhase("processing");
    setProcessingStep(0);
  };

  // Processing simulation
  React.useEffect(() => {
    if (phase !== "processing") return;
    const steps = [0, 1, 2, 3];
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((step, i) => {
      timers.push(setTimeout(() => setProcessingStep(step), i * 1500));
    });
    timers.push(
      setTimeout(() => setPhase("result"), steps.length * 1500 + 500),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleStartPrep = () => {
    setPrepActive(true);
  };

  const handleStartSpeaking = () => {
    setPrepActive(false);
    handleStartRecording();
  };

  // RENDER: Processing
  if (phase === "processing") {
    const steps = [
      { label: "Recording received", icon: CheckCircle2 },
      { label: "Speech transcription", icon: CheckCircle2 },
      { label: "AI evaluation", icon: Loader2 },
      { label: "Feedback generation", icon: Clock },
    ];
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Đang phân tích bài nói...
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI đang đánh giá câu trả lời của bạn
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
                              ? "bg-primary/10 text-primary"
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
                              ? "text-primary"
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

  // RENDER: Result
  if (phase === "result") {
    const result = MOCK_SPEAKING_RESULT;
    const teacher = MOCK_TEACHER_REVIEW;
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Đã nộp bài!
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI đã hoàn thành phân tích câu trả lời của bạn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score + CEFR */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                AI Score
              </p>
              <p className="mt-2 text-4xl font-bold text-primary">
                {result.aiScore.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">/ 10</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">CEFR</p>
              <p className="mt-2 text-4xl font-bold text-success">
                {result.cefr}
              </p>
              <p className="text-sm text-muted-foreground">Cấp độ hiện tại</p>
            </CardContent>
          </Card>
        </div>

        {/* Rubric */}
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
            {result.rubric.map((r) => (
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

        {/* AI Feedback */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">AI Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-foreground">
                  Điểm mạnh
                </span>
              </div>
              <ul className="space-y-1 pl-6">
                {result.strengths.map((s, i) => (
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-semibold text-foreground">
                  Cần cải thiện
                </span>
              </div>
              <ul className="space-y-1 pl-6">
                {result.improvements.map((s, i) => (
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
            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Gợi ý luyện tập
                </span>
              </div>
              <ul className="space-y-1 pl-6">
                {result.suggestions.map((s, i) => (
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
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Transcript</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {result.transcript.map((seg, i) => (
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
          </CardContent>
        </Card>

        {/* Teacher Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Award className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">Teacher Feedback</CardTitle>
              </div>
              {teacher.reviewed ? (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-success/20 bg-success/10 text-success"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Đã được giáo viên đánh giá
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Chưa có nhận xét từ giáo viên
                </Badge>
              )}
            </div>
          </CardHeader>
          {teacher.reviewed && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Teacher Score</p>
                  <p className="mt-1 text-2xl font-bold text-success">
                    {teacher.teacherScore?.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Teacher CEFR</p>
                  <p className="mt-1 text-2xl font-bold text-success">
                    {teacher.teacherCEFR}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm text-foreground">{teacher.feedback}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Practice Again */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiếp tục cải thiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link href={`/learner/speaking/practice/${part.id}`}>
                  <RotateCcw className="h-4 w-4" />
                  Luyện lại Part này
                </Link>
              </Button>
              {part.id < 4 && (
                <Button asChild className="flex-1 gap-2">
                  <Link href={`/learner/speaking/practice/${part.id + 1}`}>
                    Luyện Part tiếp theo
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
      </div>
    );
  }

  // RENDER: Practice
  return (
    <div className="space-y-6">
      {/* Mini header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/learner/speaking">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mic className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-foreground">APTIS AI</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              Speaking Practice
            </span>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          Part {part.id} of 4
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <Progress value={partProgress} className="h-1.5" />
      </div>

      {/* Task title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          {part.title} — {part.subtitle}
        </h1>
        <p className="text-sm text-muted-foreground">{part.description}</p>
      </div>

      {/* Part 4: Preparation phase */}
      {part.id === 4 &&
        prepTime > 0 &&
        !prepActive &&
        recState === "idle" &&
        !completedRecordings[currentQuestion] && (
          <Card className="border-warning/20">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Prepare your answer
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bạn có 1 phút để chuẩn bị trước khi nói
                </p>
              </div>
              {part.imageUrl && (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={part.imageUrl}
                    alt="Part 4 prompt"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Câu hỏi:</p>
                <div className="space-y-2">
                  {part.questions.map((q, i) => (
                    <p key={q.id} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {i + 1}.
                      </span>{" "}
                      {q.text}
                    </p>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Ghi chú nhanh:
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bạn có thể ghi chú nhanh..."
                  rows={3}
                />
              </div>
              <Button
                onClick={handleStartPrep}
                className="w-full gap-2"
                size="lg"
              >
                <Clock className="h-4 w-4" />
                Bắt đầu chuẩn bị (1 phút)
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Part 4: Preparation countdown */}
      {part.id === 4 && prepActive && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Thời gian chuẩn bị
            </p>
            <p className="text-5xl font-bold text-warning tabular-nums">
              {formatTimer(prepTime)}
            </p>
            <div className="mx-auto max-w-md">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bạn có thể ghi chú nhanh..."
                rows={3}
                disabled
              />
            </div>
            {prepTime <= 0 && (
              <Button onClick={handleStartSpeaking} size="lg" className="gap-2">
                <Mic className="h-4 w-4" />
                Bắt đầu nói
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Part 4: Speaking phase after prep */}
      {part.id === 4 &&
        !prepActive &&
        prepTime === 0 &&
        recState === "idle" &&
        !completedRecordings[currentQuestion] && (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                You now have 2 minutes to speak.
              </p>
              <p className="text-5xl font-bold text-primary tabular-nums">
                02:00
              </p>
              <Button
                onClick={handleStartRecording}
                size="lg"
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Bắt đầu ghi âm
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Part 2: Show photo */}
      {part.id === 2 && part.imageUrl && (
        <div className="overflow-hidden rounded-xl border border-border">
          <img
            src={part.imageUrl}
            alt="Part 2 photograph"
            className="mx-auto max-h-80 w-full object-cover"
          />
        </div>
      )}

      {/* Part 3: Show two photos */}
      {part.id === 3 && part.imageUrl && part.imageUrl2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={part.imageUrl}
              alt="Part 3 photo 1"
              className="h-48 w-full object-cover sm:h-64"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={part.imageUrl2}
              alt="Part 3 photo 2"
              className="h-48 w-full object-cover sm:h-64"
            />
          </div>
        </div>
      )}

      {/* Question display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
              {currentQuestion + 1}
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-foreground md:text-lg">
                {question.text}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatTimer(question.timeLimit)} tối đa
                </Badge>
                {totalQuestions > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion + 1} / {totalQuestions}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording panel */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6">
            {/* IDLE */}
            {recState === "idle" &&
              !completedRecordings[currentQuestion] &&
              (part.id !== 4 || prepTime === 0) && (
                <>
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <Mic className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Nhấn để bắt đầu ghi âm
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Thời gian tối đa: {formatTimer(question.timeLimit)}
                    </p>
                  </div>
                  <Button
                    onClick={handleStartRecording}
                    size="lg"
                    className="gap-2"
                    aria-label="Bắt đầu ghi âm"
                  >
                    <Mic className="h-5 w-5" />
                    Record
                  </Button>
                </>
              )}

            {/* RECORDING */}
            {recState === "recording" && (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
                    <Mic className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Đang ghi âm...
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {formatTimer(recTime)}
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <WaveformBars active />
                </div>
                <Button
                  onClick={handleStopRecording}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                  aria-label="Dừng ghi âm"
                >
                  <Square className="h-5 w-5" />
                  Stop
                </Button>
              </>
            )}

            {/* RECORDED */}
            {recState === "recorded" && (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Đã ghi âm xong
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thời lượng: {formatTimer(recTime)}
                  </p>
                </div>
                {audioUrls[currentQuestion] && (
                  <audio
                    controls
                    src={audioUrls[currentQuestion] ?? undefined}
                    className="w-full max-w-md"
                  />
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Xóa & ghi lại
                  </Button>
                  <Button onClick={handleContinue} size="lg" className="gap-2">
                    {currentQuestion < totalQuestions - 1 ? (
                      <>
                        Continue <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Nộp bài <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question navigation indicator */}
      {totalQuestions > 1 && (
        <div className="flex items-center justify-center gap-2">
          {part.questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === currentQuestion
                  ? "w-8 bg-primary"
                  : completedRecordings[i]
                    ? "w-2 bg-success"
                    : "w-2 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      )}

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc muốn nộp bài?</AlertDialogTitle>
            <AlertDialogDescription>
              Sau khi nộp, bài nói sẽ được xử lý để AI đánh giá. Bạn không thể
              thay đổi câu trả lời sau khi nộp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Nộp bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
