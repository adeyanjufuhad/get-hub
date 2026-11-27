"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { ProgressArc } from "@/components/ui/progress-arc";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { AttemptFeedback, Course, PublicQuestion, Topic } from "@/lib/types";

interface QuestionAttemptState {
  selectedOptionId: string;
  numericText: string;
  feedback: AttemptFeedback | null;
}

export default function PracticeTopicPage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params.topicId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Record<string, QuestionAttemptState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!topicId) return;

    api
      .listTopicQuestions(topicId)
      .then((res) => {
        // Put diagram-backed questions first so students see visual problems upfront.
        const sorted = [...res.questions].sort((a, b) => {
          const aHasImg = Number(Boolean(a.prompt_image_url));
          const bHasImg = Number(Boolean(b.prompt_image_url));
          return bHasImg - aHasImg;
        });
        setCourse(res.course);
        setTopic(res.topic);
        setQuestions(sorted);
        startedAtRef.current = Date.now();
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        } else {
          toast.error(err instanceof ApiError ? err.message : "Could not load practice questions");
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, topicId, router]);

  const current = questions[index];
  const curState: QuestionAttemptState = (current && history[current.id]) || {
    selectedOptionId: "",
    numericText: "",
    feedback: null,
  };
  const feedback = curState.feedback;

  const answeredEntries = Object.values(history).filter((h) => h.feedback !== null);
  const correctCount = answeredEntries.filter((h) => h.feedback?.is_correct).length;

  function updateCurrentState(patch: Partial<QuestionAttemptState>) {
    if (!current) return;
    setHistory((prev) => ({
      ...prev,
      [current.id]: {
        selectedOptionId: prev[current.id]?.selectedOptionId ?? "",
        numericText: prev[current.id]?.numericText ?? "",
        feedback: prev[current.id]?.feedback ?? null,
        ...patch,
      },
    }));
  }

  async function handleCheckAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!current || feedback) return;

    const payload: {
      selected_option_id?: string;
      numeric_input?: number;
      time_taken_ms: number;
    } = {
      time_taken_ms: Math.max(0, Date.now() - startedAtRef.current),
    };

    if (current.question_type === "mcq") {
      if (!curState.selectedOptionId) {
        toast.info("Pick an option first.");
        return;
      }
      payload.selected_option_id = curState.selectedOptionId;
    } else {
      const parsed = Number.parseFloat(curState.numericText.trim());
      if (Number.isNaN(parsed)) {
        toast.info("Enter a valid number.");
        return;
      }
      payload.numeric_input = parsed;
    }

    setSubmitting(true);
    try {
      const res = await api.submitAttempt(current.id, payload);
      updateCurrentState({ feedback: res });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function jumpTo(nextIdx: number) {
    setIndex(nextIdx);
    startedAtRef.current = Date.now();
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    jumpTo(index + 1);
  }

  function handleRestart() {
    setIndex(0);
    setHistory({});
    setFinished(false);
    startedAtRef.current = Date.now();
  }

  if (authLoading || loading) {
    return <div className="mx-auto max-w-2xl h-80 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />;
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
        <h1 className="text-lg font-semibold">No practice questions yet</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Questions for this topic haven&apos;t been added yet.
        </p>
        <Link href="/tests" className="mt-4 inline-block text-sm font-medium text-[var(--accent)]">
          Back to test center
        </Link>
      </div>
    );
  }

  if (finished) {
    const totalDone = Math.max(1, answeredEntries.length);
    const pct = Math.round((correctCount / totalDone) * 100);
    return (
      /* Concentric completion card: Outer 28px (12+16) / sm: 32px (12+20) -> inner buttons 12px */
      <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 text-center sm:rounded-[32px] sm:p-5">
        <div className="mx-auto flex justify-center">
          <ProgressArc percentage={pct} size={96} strokeWidth={8} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Topic practice complete</h1>
        <p className="tabular mt-2 text-sm text-[var(--text-secondary)]">
          You solved <strong className="font-semibold text-[var(--text-primary)]">{correctCount}</strong> of{" "}
          <strong className="font-semibold text-[var(--text-primary)]">{questions.length}</strong> correctly on{" "}
          <strong className="font-semibold text-[var(--text-primary)]">{topic?.title}</strong>.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="ink" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Practice again
          </Button>
          {course && (
            <Link
              href={`/courses/${course.slug}/mock-exam`}
              className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] px-5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Take timed {course.code} exam
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          <Link
            href="/tests"
            className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[var(--border-hairline)] px-5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            Test center
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const hasOptionImages = Boolean(current.options?.some((o) => o.image_url));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Top Bar: Back to Notes + Test Center + Score Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/tests"
            className="-ml-1 inline-flex min-h-[40px] shrink-0 items-center gap-1.5 px-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Test center
          </Link>
          {course && topic && (
            <>
              <span className="text-[var(--border-strong)]">/</span>
              <Link
                href={`/courses/${course.slug}/${topic.slug}`}
                className="inline-flex min-h-[40px] min-w-0 items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Read {course.code} notes</span>
              </Link>
            </>
          )}
        </div>

        <span className="tabular shrink-0 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1 font-mono text-xs font-medium text-[var(--text-primary)]">
          Score {correctCount}/{answeredEntries.length} · Q {index + 1}/{questions.length}
        </span>
      </div>

      {/* Concentric Question Navigator Strip: Outer 20px = Inner 12px + Padding 8px (p-2) */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {questions.map((q, i) => {
          const st = history[q.id]?.feedback;
          const isCurrent = i === index;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => jumpTo(i)}
              className={cn(
                "tabular pressable flex h-10 min-w-[40px] shrink-0 items-center justify-center rounded-[12px] border px-2 font-mono text-xs font-semibold cursor-pointer",
                isCurrent
                  ? "border-2 border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                  : st?.is_correct
                    ? "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
                    : st && !st.is_correct
                      ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Concentric Question Card: Outer 28px (12+16) / sm: 32px (12+20) -> options, inputs, buttons 12px */}
      <form
        onSubmit={handleCheckAnswer}
        className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {current.prompt_image_url && (
              <Badge variant="accent">Diagram problem</Badge>
            )}
            <Badge variant="neutral" className="capitalize">
              {current.difficulty}
            </Badge>
            <Badge variant="neutral">
              Objective
            </Badge>
          </div>
          {topic && (
            <span className="max-w-full truncate text-xs text-[var(--text-muted)]">
              {topic.title}
            </span>
          )}
        </div>

        <div className="math-scroll-x mt-4 text-base font-normal leading-relaxed text-[var(--text-primary)] sm:text-[17px]">
          <MathText text={current.prompt_md} />
        </div>

        {current.prompt_image_url && (
          <figure className="mt-5 overflow-hidden rounded-[12px] border border-[var(--border-strong)] bg-white p-3">
            <span className="mb-2 block text-xs font-medium text-[var(--accent)]">
              Diagram
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.prompt_image_url}
              alt="Problem diagram"
              width={560}
              height={340}
              decoding="async"
              className="mx-auto max-h-72 w-auto max-w-full object-contain"
            />
          </figure>
        )}

        {/* MCQ Options (tactile .pressable + rounded-[12px]) */}
        {current.question_type === "mcq" && current.options && (
          <div
            className={cn(
              "mt-5 grid gap-2.5",
              hasOptionImages ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            )}
          >
            {current.options.map((opt) => {
              const selected = curState.selectedOptionId === opt.id;
              const isCorrectOption = feedback?.correct_option_id === opt.id;
              const isWrongSelected = Boolean(feedback && selected && !feedback.is_correct);

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(feedback)}
                  onClick={() => updateCurrentState({ selectedOptionId: opt.id })}
                  className={cn(
                    "pressable flex min-h-[54px] flex-col items-start gap-2 rounded-[12px] border p-3.5 text-left cursor-pointer disabled:cursor-default",
                    !feedback && !selected && "border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]",
                    !feedback && selected && "border-2 border-[var(--accent)] bg-[var(--accent-soft)]",
                    isCorrectOption && "border-2 border-[var(--success)] bg-[var(--success-soft)]",
                    isWrongSelected && "border-2 border-[var(--danger)] bg-[var(--danger-soft)]"
                  )}
                >
                  <div className="flex w-full min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold",
                        isCorrectOption
                          ? "bg-[var(--success)] text-white"
                          : isWrongSelected
                            ? "bg-[var(--danger)] text-white"
                            : selected
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
                      alt={`Option ${opt.label} diagram`}
                      width={360}
                      height={220}
                      decoding="async"
                      className="h-auto w-full rounded-[8px] border border-[var(--border-hairline)] bg-white p-1"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Numeric Answer Input */}
        {current.question_type === "numeric" && (
          <div className="mt-5">
            <label htmlFor="numeric-answer" className="block text-xs font-semibold text-[var(--text-secondary)]">
              Enter your calculated numeric value
              {current.numeric_tolerance_pct ? ` (±${current.numeric_tolerance_pct}% tolerance)` : ""}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="numeric-answer"
                name="numeric_answer"
                type="text"
                inputMode="decimal"
                enterKeyHint="done"
                autoComplete="off"
                spellCheck={false}
                disabled={Boolean(feedback)}
                value={curState.numericText}
                onChange={(e) => updateCurrentState({ numericText: e.target.value })}
                placeholder="e.g. 101.24…"
                className="tabular min-h-[48px] min-w-0 flex-1 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 font-mono text-base text-[var(--text-primary)] sm:px-4"
              />
              {current.numeric_unit && (
                <span className="shrink-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 py-3 font-mono text-xs font-semibold text-[var(--text-secondary)] sm:px-3.5 sm:text-sm">
                  {current.numeric_unit}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Footer */}
        {!feedback && (
          <div className="mt-6 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={index === 0}
              onClick={() => jumpTo(Math.max(0, index - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Prev
            </Button>
            <Button type="submit" variant="ink" size="lg" disabled={submitting} className="flex-1 sm:flex-initial">
              {submitting ? "Checking…" : "Check answer"}
            </Button>
          </div>
        )}
      </form>

      {/* Concentric Feedback Card: Outer 28px (12+16) / sm: 32px (12+20) -> solution & buttons 12px */}
      {feedback && (
        <section
          aria-live="polite"
          className={cn(
            "rounded-[28px] border p-4 sm:rounded-[32px] sm:p-5",
            feedback.is_correct
              ? "border-[var(--success)]/40 bg-[var(--success-soft)]"
              : "border-[var(--danger)]/40 bg-[var(--danger-soft)]"
          )}
        >
          <div className="flex items-start gap-2.5 sm:items-center">
            {feedback.is_correct ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)] sm:mt-0" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)] sm:mt-0" aria-hidden="true" />
            )}
            <h2 className="text-sm font-semibold leading-snug text-[var(--text-primary)] sm:text-base">
              {feedback.is_correct ? "Correct answer" : "Review the worked solution below"}
            </h2>
          </div>

          {feedback.numeric_answer != null && (
            <p className="tabular mt-2 text-xs font-medium text-[var(--text-secondary)]">
              Verified answer:{" "}
              <span className="font-mono text-[var(--text-primary)]">
                {feedback.numeric_answer} {feedback.numeric_unit}
              </span>{" "}
              (±{feedback.numeric_tolerance_pct}%)
            </p>
          )}

          <div className="math-scroll-x mt-4 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-sm leading-relaxed text-[var(--text-secondary)] sm:p-4">
            <p className="mb-2 text-xs font-semibold text-[var(--accent)]">
              Step-by-step worked solution
            </p>
            <MathText text={feedback.solution_md} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={index === 0}
              onClick={() => jumpTo(Math.max(0, index - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Prev
            </Button>
            <Button type="button" variant="ink" size="lg" onClick={handleNext} className="flex-1 sm:flex-initial">
              {index + 1 >= questions.length ? "Finish topic drill" : "Next question"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
