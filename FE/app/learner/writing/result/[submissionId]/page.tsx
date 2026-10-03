'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  PenLine,
  ArrowRight,
  ArrowLeft,
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
  ArrowRightLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  getWritingSubmission,
  type InlineFeedbackItem,
} from '@/lib/data/mock-writing';

const INLINE_TYPE_STYLES: Record<InlineFeedbackItem['type'], { className: string; label: string; color: string }> = {
  grammar: { className: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Grammar', color: 'text-destructive' },
  vocabulary: { className: 'bg-primary/10 text-primary border-primary/30', label: 'Vocabulary', color: 'text-primary' },
  coherence: { className: 'bg-warning/10 text-warning border-warning/30', label: 'Coherence', color: 'text-warning' },
};

export default function WritingResultPage() {
  const params = useParams();
  const submissionId = String(params?.submissionId ?? '');
  const submission = getWritingSubmission(submissionId);

  if (!submission) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Không tìm thấy bài nộp</h2>
              <p className="text-sm text-muted-foreground">Bài nộp này không tồn tại hoặc đã bị xóa.</p>
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

  const { result, teacherReview, answer, wordCount, submittedAt, taskNumber } = submission;
  const hasTeacher = teacherReview.reviewed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/learner/submissions">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">Kết quả Writing</h1>
            <p className="text-sm text-muted-foreground">{submission.taskTitle}</p>
          </div>
        </div>
        {hasTeacher ? (
          <Badge variant="outline" className="gap-1.5 border-success/20 bg-success/10 text-success">
            <UserCheck className="h-3 w-3" />
            Đã được giáo viên đánh giá
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3" />
            AI đã đánh giá
          </Badge>
        )}
      </div>

      {/* AI Score + CEFR */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">AI Score</p>
            <p className="mt-2 text-4xl font-bold text-chart-5">{result.aiScore.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">/ 10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">CEFR</p>
            <p className="mt-2 text-4xl font-bold text-success">{result.cefr}</p>
            <p className="text-sm text-muted-foreground">Cấp độ hiện tại</p>
          </CardContent>
        </Card>
      </div>

      {/* AI vs Teacher comparison */}
      {hasTeacher && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-success" />
              <CardTitle className="text-base">So sánh AI vs Teacher</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-chart-5/20 bg-chart-5/5 p-4 text-center">
                <p className="text-xs font-medium text-muted-foreground">AI Evaluation</p>
                <p className="mt-1 text-2xl font-bold text-chart-5">{result.aiScore.toFixed(1)}</p>
                <Badge variant="outline" className="mt-1 text-xs">{result.cefr}</Badge>
              </div>
              <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-center">
                <p className="text-xs font-medium text-muted-foreground">Teacher Review</p>
                <p className="mt-1 text-2xl font-bold text-success">{teacherReview.teacherScore?.toFixed(1)}</p>
                <Badge variant="outline" className="mt-1 text-xs">{teacherReview.teacherCEFR}</Badge>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Hai kết quả mang tính tham khảo, không gọi bên nào là chính xác hơn.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rubric */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
              <Award className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Chi tiết đánh giá</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.rubric.map((r) => (
            <div key={r.criterion} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{r.criterion}</span>
                <span className="text-sm font-bold text-foreground">{r.score.toFixed(1)}</span>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">AI Feedback</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-foreground">Điểm mạnh</span>
            </div>
            <ul className="space-y-1 pl-6">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-foreground">Cần cải thiện</span>
            </div>
            <ul className="space-y-1 pl-6">
              {result.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 rounded-lg border border-chart-5/20 bg-chart-5/5 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-chart-5" />
              <span className="text-sm font-semibold text-foreground">Gợi ý luyện tập</span>
            </div>
            <ul className="space-y-1 pl-6">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Inline AI Feedback */}
      {result.inlineFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                <PenLine className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">AI Inline Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.inlineFeedback.map((item, i) => {
              const style = INLINE_TYPE_STYLES[item.type];
              return (
                <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-xs', style.className)}>
                      {style.label}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-muted-foreground shrink-0 w-16">Original:</span>
                      <span className="text-sm text-muted-foreground line-through">{item.original}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-muted-foreground shrink-0 w-16">AI suggest:</span>
                      <span className={cn('text-sm font-medium', style.color)}>{item.suggestion}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-[72px]">{item.explanation}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Your Submission (read-only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Your submission</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Type className="h-3 w-3" />
                {wordCount} words
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {submittedAt}
              </Badge>
              <Badge variant="outline" className="text-xs">Task {taskNumber}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">{answer}</p>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Feedback */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <UserCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Teacher Feedback</CardTitle>
            </div>
            {hasTeacher ? (
              <Badge variant="outline" className="gap-1.5 border-success/20 bg-success/10 text-success">
                <CheckCircle2 className="h-3 w-3" />
                Teacher reviewed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Chưa có nhận xét từ giáo viên
              </Badge>
            )}
          </div>
        </CardHeader>
        {hasTeacher && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Teacher Score</p>
                <p className="mt-1 text-2xl font-bold text-success">{teacherReview.teacherScore?.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Teacher CEFR</p>
                <p className="mt-1 text-2xl font-bold text-success">{teacherReview.teacherCEFR}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm text-foreground">{teacherReview.feedback}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Practice Again */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tiếp tục luyện tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="flex-1 gap-2">
              <Link href={`/learner/writing/practice/${taskNumber}`}>
                <RotateCcw className="h-4 w-4" />
                Luyện lại Task này
              </Link>
            </Button>
            {taskNumber < 4 && (
              <Button asChild className="flex-1 gap-2">
                <Link href={`/learner/writing/practice/${taskNumber + 1}`}>
                  Luyện Task tiếp theo
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
