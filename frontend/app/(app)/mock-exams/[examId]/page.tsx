"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  Grid2x2,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { ProgressArc } from "@/components/ui/progress-arc";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type {
  Course,
  GradedQuestionReview,
  MockExam,
  PublicQuestion,
  TopicBreakdownItem,
} from "@/lib/types";

interface DraftAnswer {
  selectedOptionId?: string;
  numericText?: string;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MockExamRunnerPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [exam, setExam] = useState<MockExam | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [reviews, setReviews] = useState<GradedQuestionReview[] | null>(null);
  const [breakdown, setBreakdown] = useState<TopicBreakdownItem[]>([]);
  const [remaining, setRemaining] = useState<number>(0);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!examId) return;

    api
      .getMockExam(examId)
      .then((res) => {
        setExam(res.exam);
        setCourse(res.course);
        if (res.reviews) {
          setReviews(res.reviews);
          setBreakdown(res.topic_breakdown ?? []);
        } else {
          setQuestions(res.questions ?? []);
          setRemaining(res.remaining_seconds ?? res.exam.duration_seconds);
        }
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Could not load mock exam.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, examId, router]);

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting || reviews) return;
    setSubmitting(true);
    try {
      const payload = questions
        .map((q) => {
          const a = answers[q.id];
          if (!a) return null;
          if (q.question_type === "mcq" && a.selectedOptionId) {
            return { question_id: q.id, selected_option_id: a.selectedOptionId };
          }
          if (q.question_type === "numeric" && a.numericText && a.numericText.trim() !== "") {
            const parsed = Number.parseFloat(a.numericText.trim());
            if (!Number.isNaN(parsed)) {
              return { question_id: q.id, numeric_input: parsed };
            }
          }
          return null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const res = await api.submitMockExam(exam.id, payload);
      setExam(res.exam);
      setReviews(res.reviews);
      setBreakdown(res.topic_breakdown);
      toast.success("Mock exam graded!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit mock exam.");
    } finally {
      setSubmitting(false);
    }
  }, [exam, submitting, reviews, questions, answers]);

  const handleManualSubmit = useCallback(() => {
    const answeredSoFar = questions.filter((q) => {
      const a = answers[q.id];
      return Boolean(a?.selectedOptionId || (a?.numericText && a.numericText.trim() !== ""));
    }).length;
    const unanswered = questions.length - answeredSoFar;
    if (
      unanswered > 0 &&
      !window.confirm(
        `You still have ${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"}. Submit and grade your exam now?`
      )
    ) {
      return;
    }
    void handleSubmit();
  }, [questions, answers, handleSubmit]);

  // Countdown timer
  useEffect(() => {
    if (loading || reviews || !exam) return;
    if (remaining <= 0) {
      void handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, reviews, exam, remaining, handleSubmit]);

  if (authLoading || loading) {
    return <div className="h-96 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />;
  }

  if (!exam) {
    return (
      <div className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
        <p className="font-bold">Mock exam not found.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]">
          Back to dashboard
        </Link>
      </div>
    );
  }

  // ==================== GRADED RESULTS VIEW ====================
  if (reviews) {
    const score = exam.score ?? 0;
    const total = exam.total_questions;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:rounded-[26px] sm:p-8">
          <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="w-full sm:w-auto">
              <Badge variant="accent" className="font-mono">
                {course?.code} · Mock Exam Graded
              </Badge>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                You scored {score} / {total}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {pct >= 70
                  ? "Solid performance! Keep sharpening your speed."
                  : "Good run — review the missed steps below and drill weak topics."}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap">
                {course && (
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)]"
                  >
                    Retake new mock
                  </Link>
                )}
                <Link
                  href="/progress"
                  className="pressable inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border-hairline)] px-5 text-sm font-semibold text-[var(--text-primary)]"
                >
                  View progress
                </Link>
              </div>
            </div>
            <div className="self-center sm:self-auto">
              <ProgressArc percentage={pct} size={100} strokeWidth={9} />
            </div>
          </div>

          {/* Score Breakdown By Topic */}
          {breakdown.length > 0 && (
            <div className="mt-6 border-t border-[var(--border-hairline)] pt-5">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Score breakdown by topic</h2>
              <div className="mt-3 space-y-3">
                {breakdown.map((b) => (
                  <div key={b.topic_id} className="rounded-xl bg-[var(--bg-canvas)] p-3.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)]">{b.topic_title}</span>
                      <span className="tabular font-mono text-[var(--text-secondary)]">
                        {b.correct}/{b.total} ({b.accuracy_pct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          b.accuracy_pct >= 70 ? "bg-[var(--success)]" : "bg-[var(--accent)]"
                        )}
                        style={{ width: `${b.accuracy_pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Question-by-question solutions */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold tracking-tight">Full Solutions Review</h2>
          {reviews.map((rev, idx) => (
            <article
              key={rev.question.id}
              className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                  Question {idx + 1}
                </span>
                <Badge variant={rev.is_correct ? "success" : "danger"}>
                  {rev.is_correct ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" /> Incorrect
                    </>
                  )}
                </Badge>
              </div>
              <div className="math-scroll-x mt-3 text-sm font-medium leading-relaxed text-[var(--text-primary)]">
                <MathText text={rev.question.prompt_md} />
              </div>

              {rev.question.question_type === "numeric" && (
                <p className="tabular mt-2 font-mono text-xs text-[var(--text-secondary)]">
                  Your answer: <strong>{rev.numeric_input ?? "Unanswered"}</strong> · Expected:{" "}
                  <strong className="text-[var(--success)]">
                    {rev.numeric_answer} {rev.question.numeric_unit}
                  </strong>
                </p>
              )}

              {rev.question.question_type === "mcq" && rev.question.options && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {rev.question.options.map((opt) => {
                    const isRight = rev.correct_option_id === opt.id;
                    const isMine = rev.selected_option_id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={cn(
                          "math-scroll-x min-w-0 rounded-xl border px-3 py-2 text-xs",
                          isRight
                            ? "border-[var(--success)] bg-[var(--success-soft)] font-semibold"
                            : isMine
                              ? "border-[var(--danger)] bg-[var(--danger-soft)]"
                              : "border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                        )}
                      >
                        <span className="mr-1.5 font-mono font-bold">{opt.label}.</span>
                        <MathText text={opt.content_md} />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="math-scroll-x mt-4 rounded-xl bg-[var(--bg-canvas)] p-3.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                <p className="mb-1 font-mono text-[10px] font-bold uppercase text-[var(--text-muted)]">
                  Solution
                </p>
                <MathText text={rev.solution_md} />
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }

  // ==================== ACTIVE TIMED EXAM RUNNER ====================
  const current = questions[index];
  if (!current) return null;

  const curAnswer = answers[current.id] ?? {};
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return Boolean(a?.selectedOptionId || (a?.numericText && a.numericText.trim() !== ""));
  }).length;
  const hasOptionImages = Boolean(current.options?.some((o) => o.image_url));

  const navigatorGrid = (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, i) => {
        const a = answers[q.id];
        const isAnswered = Boolean(a?.selectedOptionId || (a?.numericText && a.numericText.trim() !== ""));
        const isFlagged = Boolean(flagged[q.id]);
        const isCurrent = i === index;
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setIndex(i);
              setDrawerOpen(false);
            }}
            className={cn(
              "tabular pressable flex h-11 items-center justify-center rounded-xl border font-mono text-xs font-bold cursor-pointer",
              isCurrent
                ? "border-2 border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                : isFlagged
                  ? "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]"
                  : isAnswered
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* Main Question Area */}
      <div className="space-y-4 lg:col-span-8">
        {/* Sticky Exam Top Strip */}
        <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 px-3.5 py-2.5 shadow-2xs backdrop-blur-md sm:px-4 sm:py-3 md:top-4">
          <div className="min-w-0">
            <span className="font-mono text-xs font-bold text-[var(--accent)]">{course?.code}</span>
            <span className="tabular ml-1.5 text-xs text-[var(--text-muted)] sm:ml-2">
              Q{index + 1}/{questions.length} · {answeredCount} done
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "tabular inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold",
                remaining <= 60
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
              )}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatClock(remaining)}
            </span>

            {/* Mobile Vaul Bottom Sheet Question Navigator */}
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Drawer.Trigger asChild>
                <button
                  type="button"
                  className="pressable inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-xs font-semibold lg:hidden cursor-pointer"
                >
                  <Grid2x2 className="h-3.5 w-3.5" />
                  Map
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                <Drawer.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[82dvh] overflow-y-auto overscroll-contain rounded-t-[24px] border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                  <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--border-strong)]" />
                  <Drawer.Title className="text-sm font-bold text-[var(--text-primary)]">
                    Question Navigator ({answeredCount}/{questions.length} answered)
                  </Drawer.Title>
                  <div className="mt-4">{navigatorGrid}</div>
                  <Button
                    type="button"
                    variant="accent"
                    disabled={submitting}
                    onClick={() => {
                      setDrawerOpen(false);
                      handleManualSubmit();
                    }}
                    className="mt-5 w-full"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {submitting ? "Grading…" : "Submit & grade exam"}
                  </Button>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[24px] sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="neutral" className="capitalize">
              {current.difficulty} · {current.question_type}
            </Badge>
            <button
              type="button"
              onClick={() => setFlagged((f) => ({ ...f, [current.id]: !f[current.id] }))}
              className={cn(
                "pressable inline-flex min-h-[42px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold cursor-pointer",
                flagged[current.id]
                  ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                  : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
              )}
            >
              <Flag className="h-3.5 w-3.5" />
              {flagged[current.id] ? "Flagged" : "Flag"}
            </button>
          </div>

          <div className="math-scroll-x mt-4 text-base font-medium leading-relaxed text-[var(--text-primary)]">
            <MathText text={current.prompt_md} />
          </div>

          {current.prompt_image_url && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.prompt_image_url}
                alt="Question diagram"
                width={560}
                height={340}
                decoding="async"
                className="mx-auto max-h-56 w-auto max-w-full object-contain"
              />
            </div>
          )}

          {current.question_type === "mcq" && current.options && (
            <div
              className={cn(
                "mt-5 grid gap-3",
                hasOptionImages ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
              )}
            >
              {current.options.map((opt) => {
                const selected = curAnswer.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [current.id]: { selectedOptionId: opt.id },
                      }))
                    }
                    className={cn(
                      "flex min-h-[54px] flex-col items-start gap-2 rounded-2xl border p-3.5 text-left cursor-pointer",
                      selected
                        ? "border-2 border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                    )}
                  >
                    <div className="flex w-full min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold",
                          selected
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                        )}
                      >
                        {opt.label}
                      </span>
                      {opt.content_md && (
                        <span className="math-scroll-x min-w-0 flex-1 text-sm font-medium text-[var(--text-primary)]">
                          <MathText text={opt.content_md} />
                        </span>
                      )}
                    </div>
                    {opt.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={opt.image_url}
                        alt={`Option ${opt.label}`}
                        width={360}
                        height={220}
                        decoding="async"
                        className="h-auto w-full rounded-xl border border-[var(--border-hairline)] bg-white p-1"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {current.question_type === "numeric" && (
            <div className="mt-5">
              <label htmlFor="exam-numeric-answer" className="block text-xs font-semibold text-[var(--text-secondary)]">
                Enter your calculated numeric value
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="exam-numeric-answer"
                  name="numeric_answer"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  value={curAnswer.numericText ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [current.id]: { numericText: e.target.value },
                    }))
                  }
                  placeholder="e.g. 42.5…"
                  className="tabular min-h-[48px] min-w-0 flex-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 font-mono text-base text-[var(--text-primary)] sm:px-4"
                />
                {current.numeric_unit && (
                  <span className="shrink-0 rounded-xl bg-[var(--bg-subtle)] px-3 py-3 font-mono text-xs font-semibold text-[var(--text-secondary)] sm:px-3.5 sm:text-sm">
                    {current.numeric_unit}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Prev / Next / Submit Footer */}
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Prev
            </Button>

            {index + 1 < questions.length ? (
              <Button
                type="button"
                variant="ink"
                onClick={() => setIndex((i) => i + 1)}
                className="flex-1 sm:flex-initial"
              >
                Next
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="accent"
                disabled={submitting}
                onClick={handleManualSubmit}
                className="flex-1 sm:flex-initial"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {submitting ? "Grading…" : "Submit exam"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Right-Side Navigator Panel */}
      <aside className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-20 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Question Navigator</h2>
          <p className="tabular mt-1 text-xs text-[var(--text-muted)]">
            {answeredCount} of {questions.length} answered
          </p>
          <div className="mt-4">{navigatorGrid}</div>
          <Button
            type="button"
            variant="accent"
            disabled={submitting}
            onClick={handleManualSubmit}
            className="mt-5 w-full"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitting ? "Grading…" : "Submit & grade exam"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
