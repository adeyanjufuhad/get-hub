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
import { COURSES } from "@/lib/config";

export default function MockExamLauncherPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { user } = useAuth();

  const course = COURSES.find((c) => c.slug === slug);
  const [questionCount, setQuestionCount] = useState(5);
  const [minutes, setMinutes] = useState(10);
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
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {course?.code || "course"}
      </Link>

      <div className="rounded-[26px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-8">
        <Badge variant="accent" className="font-mono">
          {course?.code || slug.toUpperCase()} · Timed Mock Exam
        </Badge>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Test yourself under exam timing
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Randomized questions pulled from the {course?.code} bank, graded strictly on the Go server with a full per-topic accuracy breakdown at the end.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="q-count" className="block text-xs font-semibold text-[var(--text-primary)]">
              Max questions
            </label>
            <select
              id="q-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
            >
              <option value={5}>5 questions (Quick drill)</option>
              <option value={10}>10 questions (Test prep)</option>
              <option value={15}>15 questions (Full mock)</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-xs font-semibold text-[var(--text-primary)]">
              Time limit
            </label>
            <select
              id="duration"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>

        <ul className="mt-5 space-y-2 rounded-2xl bg-[var(--bg-canvas)] p-4 text-xs text-[var(--text-secondary)]">
          <li className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-[var(--accent)]" />
            Live countdown timer with auto-submit when time runs out.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Correct answers &amp; step-by-step solutions unlock only after submission.
          </li>
        </ul>

        <Button
          type="button"
          variant="ink"
          size="lg"
          disabled={starting}
          onClick={handleStart}
          className="mt-6 w-full"
        >
          {starting ? "Generating exam…" : "Start mock exam now"}
          {!starting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
