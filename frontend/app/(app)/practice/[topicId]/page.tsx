"use client";

import {
  ArrowLeft,
  ArrowRight,
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
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [numericText, setNumericText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
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
        setCourse(res.course);
        setTopic(res.topic);
        setQuestions(res.questions);
        startedAtRef.current = Date.now();
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        } else {
          toast.error(err instanceof ApiError ? err.message : "Could not load practice questions.");
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, topicId, router]);

  const current = questions[index];

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
      if (!selectedOptionId) {
        toast.info("Pick an option first.");
        return;
      }
      payload.selected_option_id = selectedOptionId;
    } else {
      const parsed = Number.parseFloat(numericText.trim());
      if (Number.isNaN(parsed)) {
        toast.info("Enter a valid number.");
        return;
      }
      payload.numeric_input = parsed;
    }

    setSubmitting(true);
    try {
      const res = await api.submitAttempt(current.id, payload);
      setFeedback(res);
      if (res.is_correct) {
        setCorrectCount((c) => c + 1);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelectedOptionId("");
    setNumericText("");
    setFeedback(null);
    startedAtRef.current = Date.now();
  }

  function handleRestart() {
    setIndex(0);
    setSelectedOptionId("");
    setNumericText("");
    setFeedback(null);
    setCorrectCount(0);
    setFinished(false);
    startedAtRef.current = Date.now();
  }

  if (authLoading || loading) {
    return <div className="mx-auto max-w-2xl h-80 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />;
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
        <h1 className="text-lg font-bold">No practice questions yet</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Questions for this topic haven&apos;t been added yet.
        </p>
        <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">
          Back to courses
        </Link>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto max-w-xl rounded-[26px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center sm:p-8">
        <div className="mx-auto flex justify-center">
          <ProgressArc percentage={pct} size={96} strokeWidth={8} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Practice complete!</h1>
        <p className="tabular mt-2 text-sm text-[var(--text-secondary)]">
          You got <strong className="text-[var(--text-primary)]">{correctCount}</strong> out of{" "}
          <strong className="text-[var(--text-primary)]">{questions.length}</strong> right on{" "}
          {topic?.title}.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button type="button" variant="ink" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
            Practice again
          </Button>
          {course && (
            <Link
              href={`/courses/${course.slug}/mock-exam`}
              className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white"
            >
              Try a timed mock exam
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/dashboard"
            className="pressable inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border-hairline)] px-5 text-sm font-semibold text-[var(--text-primary)]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const hasOptionImages = Boolean(current.options?.some((o) => o.image_url));
  const progressPct = Math.round(((index + (feedback ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={course && topic ? `/courses/${course.slug}/${topic.slug}` : "/courses"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {course?.code} · {topic?.title}
        </Link>
        <span className="tabular font-mono text-xs font-semibold text-[var(--text-secondary)]">
          Question {index + 1} / {questions.length}
        </span>
      </div>

      {/* Linear Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question Card */}
      <form
        onSubmit={handleCheckAnswer}
        className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" className="capitalize">
            {current.difficulty}
          </Badge>
          <Badge variant="accent" className="font-mono uppercase">
            {current.question_type}
          </Badge>
          {current.status === "draft" && <Badge variant="draft">Draft</Badge>}
        </div>

        <div className="mt-4 text-base font-medium leading-relaxed text-[var(--text-primary)] sm:text-[17px]">
          <MathText text={current.prompt_md} />
        </div>

        {current.prompt_image_url && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.prompt_image_url}
              alt="Question diagram"
              className="mx-auto max-h-60 w-full object-contain"
            />
          </div>
        )}

        {/* MCQ Options (text/KaTeX or 2x2 SVG grid) */}
        {current.question_type === "mcq" && current.options && (
          <div
            className={cn(
              "mt-5 grid gap-3",
              hasOptionImages ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            )}
          >
            {current.options.map((opt) => {
              const selected = selectedOptionId === opt.id;
              const isCorrectOption = feedback?.correct_option_id === opt.id;
              const isWrongSelected = Boolean(feedback && selected && !feedback.is_correct);

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(feedback)}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={cn(
                    "flex min-h-[54px] flex-col items-start gap-2 rounded-2xl border p-3.5 text-left cursor-pointer",
                    !feedback && !selected && "border-[var(--border-hairline)] bg-[var(--bg-canvas)]",
                    !feedback && selected && "border-2 border-[var(--accent)] bg-[var(--accent-soft)]",
                    isCorrectOption && "border-2 border-[var(--success)] bg-[var(--success-soft)]",
                    isWrongSelected && "border-2 border-[var(--danger)] bg-[var(--danger-soft)]"
                  )}
                >
                  <div className="flex w-full items-center gap-3">
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
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        <MathText text={opt.content_md} />
                      </span>
                    )}
                  </div>
                  {opt.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={opt.image_url}
                      alt={`Option ${opt.label} diagram`}
                      className="w-full rounded-xl border border-[var(--border-hairline)] bg-white p-1"
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
              Enter your numeric answer
              {current.numeric_tolerance_pct ? ` (±${current.numeric_tolerance_pct}% tolerance)` : ""}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="numeric-answer"
                type="text"
                inputMode="decimal"
                disabled={Boolean(feedback)}
                value={numericText}
                onChange={(e) => setNumericText(e.target.value)}
                placeholder="e.g. 65.5"
                className="tabular min-h-[48px] flex-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
              {current.numeric_unit && (
                <span className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 py-3 font-mono text-sm font-semibold text-[var(--text-secondary)]">
                  {current.numeric_unit}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!feedback && (
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="ink" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Checking on server…" : "Check answer"}
            </Button>
          </div>
        )}
      </form>

      {/* Instant Server Feedback + Full Step-by-Step Solution */}
      {feedback && (
        <section
          className={cn(
            "rounded-[24px] border p-5 sm:p-6",
            feedback.is_correct
              ? "border-[var(--success)]/40 bg-[var(--success-soft)]"
              : "border-[var(--danger)]/40 bg-[var(--danger-soft)]"
          )}
        >
          <div className="flex items-center gap-2.5">
            {feedback.is_correct ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <XCircle className="h-5 w-5 text-[var(--danger)]" />
            )}
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
              {feedback.is_correct ? "Spot on!" : "Not quite — check the solution below"}
            </h2>
          </div>

          {feedback.numeric_answer != null && (
            <p className="tabular mt-2 text-xs font-semibold text-[var(--text-secondary)]">
              Expected answer:{" "}
              <span className="font-mono text-[var(--text-primary)]">
                {feedback.numeric_answer} {feedback.numeric_unit}
              </span>{" "}
              (±{feedback.numeric_tolerance_pct}%)
            </p>
          )}

          <div className="mt-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Step-by-step solution
            </p>
            <MathText text={feedback.solution_md} />
          </div>

          <div className="mt-5 flex justify-end">
            <Button type="button" variant="ink" size="lg" onClick={handleNext} className="w-full sm:w-auto">
              {index + 1 >= questions.length ? "Finish practice" : "Next question"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
