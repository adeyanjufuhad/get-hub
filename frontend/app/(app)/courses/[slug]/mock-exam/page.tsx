"use client";

import { ArrowLeft, ArrowRight, ShieldCheck, Timer } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { COURSES, TEXTBOOKS } from "@/lib/config";

const PRESETS = [
  { label: "Quick Quiz", q: 5, m: 8, desc: "Fast pre-lecture warm-up" },
  { label: "Mid-Semester CBT", q: 10, m: 15, desc: "Standard OAU continuous test" },
  { label: "Full Mock Exam", q: 15, m: 25, desc: "Comprehensive syllabus test" },
] as const;

export default function MockExamLauncherPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { user } = useAuth();

  const course = COURSES.find((c) => c.slug === slug);
  const book = TEXTBOOKS.find((b) => b.courseSlug === slug);
  const [questionCount, setQuestionCount] = useState(10);
  const [minutes, setMinutes] = useState(15);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (!user) {
      router.push("/login");
      return;
    }
    setStarting(true);
    try {
      const res = await api.startMockExam(slug, {
        question_count: questionCount,
        duration_seconds: minutes * 60,
      });
      router.push(`/mock-exams/${res.exam.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start mock exam.");
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/courses/${slug}`}
          className="-ml-1 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {course?.code || "course"}
        </Link>
        <Link
          href="/tests"
          className="font-mono text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          All tests &amp; drills →
        </Link>
      </div>

      {/* Concentric launcher card: Outer 28px (12+16) mobile / 32px (12+20) sm -> inner presets, selects, CTA 12px */}
      <div className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="font-mono">
            {course?.code || slug.toUpperCase()} · Timed CBT Simulation
          </Badge>
          {book && (
            <Badge variant="neutral">
              {book.authors.split(",")[0]} bank
            </Badge>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
          {course?.title || "Timed Mock Exam"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
          Randomized questions pulled across all <span translate="no">{course?.code}</span> study folios (including diagram-backed textbook problems), graded on the Go server with per-topic breakdown.
        </p>

        {/* Tactile Preset Cards (rounded-[12px] concentric with parent) */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Choose an exam format
          </p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
            {PRESETS.map((p) => {
              const active = questionCount === p.q && minutes === p.m;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setQuestionCount(p.q);
                    setMinutes(p.m);
                  }}
                  className={cn(
                    "pressable flex flex-col items-start rounded-[12px] border p-3.5 text-left cursor-pointer",
                    active
                      ? "border-2 border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <span className="text-xs font-extrabold text-[var(--text-primary)]">
                    {p.label}
                  </span>
                  <span className="tabular mt-1 font-mono text-xs font-bold text-[var(--accent)]">
                    {p.q} Qs · {p.m} min
                  </span>
                  <span className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-tune controls */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="q-count" className="block text-xs font-semibold text-[var(--text-primary)]">
              Question count
            </label>
            <select
              id="q-count"
              name="question_count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="mt-1.5 min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
            >
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
              <option value={15}>15 questions</option>
              <option value={20}>20 questions</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-xs font-semibold text-[var(--text-primary)]">
              Time limit
            </label>
            <select
              id="duration"
              name="duration_minutes"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1.5 min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
            >
              <option value={8}>8 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={25}>25 minutes</option>
              <option value={35}>35 minutes</option>
            </select>
          </div>
        </div>

        <ul className="mt-5 space-y-2 rounded-[12px] bg-[var(--bg-canvas)] p-4 text-xs text-[var(--text-secondary)]">
          <li className="flex items-center gap-2">
            <Timer className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
            Live countdown timer with question map flagging and auto-submit at 00:00.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
            Full step-by-step worked solutions unlock immediately upon submission.
          </li>
        </ul>

        <Button
          type="button"
          variant="ink"
          size="lg"
          disabled={starting}
          onClick={handleStart}
          className="mt-6 w-full text-xs min-[380px]:text-sm"
        >
          {starting ? "Generating CBT paper…" : `Start ${questionCount}-question exam (${minutes} min)`}
          {!starting && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}
