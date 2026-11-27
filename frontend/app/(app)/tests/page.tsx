"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Layers,
  PenTool,
  ShieldCheck,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  COURSE_TOPICS_FALLBACK,
  COURSES,
  TEXTBOOK_DRILLS,
  TEXTBOOKS,
} from "@/lib/config";
import type { DashboardPayload } from "@/lib/types";

const EXAM_PRESETS = [
  { id: "quick", label: "Quick Quiz", questions: 5, minutes: 8, tag: "Warm-up" },
  { id: "midterm", label: "Mid-Sem CBT", questions: 10, minutes: 15, tag: "Test Prep" },
  { id: "full", label: "Full Mock", questions: 15, minutes: 25, tag: "Exam Standard" },
] as const;

export default function TestsHubPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [presetByCourse, setPresetByCourse] = useState<Record<string, string>>({
    "get-205": "midterm",
    "get-207": "midterm",
    "get-209": "midterm",
  });
  const [launchingSlug, setLaunchingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    api
      .dashboard()
      .then(setData)
      .catch(() => {});
  }, [authLoading, user]);

  async function handleQuickStartExam(courseSlug: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    const presetId = presetByCourse[courseSlug] ?? "midterm";
    const preset = EXAM_PRESETS.find((p) => p.id === presetId) ?? EXAM_PRESETS[1];

    setLaunchingSlug(courseSlug);
    try {
      const res = await api.startMockExam(courseSlug, {
        question_count: preset.questions,
        duration_seconds: preset.minutes * 60,
      });
      router.push(`/mock-exams/${res.exam.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start mock exam.");
      setLaunchingSlug(null);
    }
  }

  const visibleCourses =
    selectedCourse === "all"
      ? COURSES
      : COURSES.filter((c) => c.slug === selectedCourse);

  const visibleFigureDrills =
    selectedCourse === "all"
      ? TEXTBOOK_DRILLS
      : TEXTBOOK_DRILLS.filter((d) => d.courseSlug === selectedCourse);

  const statsMap = new Map(
    (data?.topic_stats ?? []).map((s) => [s.topic_id, s])
  );

  return (
    <div className="space-y-7">
      {/* Header + Course Scope Switcher */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="accent" className="font-mono">
            72 Verified Questions · Çengel · Hibbeler 14e · Stewart 7e
          </Badge>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            Tests, Textbook Drills &amp; Mock Exams
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)] text-pretty">
            Organized into two clear study modes: <strong>untimed step-by-step topic drills</strong> (instant solution reveal) and <strong>timed CBT mock exams</strong> (graded on the Go server).
          </p>
        </div>

        {/* Concentric Course Scope Tray: Outer 16px = Inner 12px + Padding 4px (p-1) */}
        <div className="-mx-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex w-max gap-1 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1">
            <button
              type="button"
              onClick={() => setSelectedCourse("all")}
              className={cn(
                "pressable min-h-[40px] shrink-0 whitespace-nowrap rounded-[12px] px-3.5 text-xs font-semibold cursor-pointer",
                selectedCourse === "all"
                  ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              )}
            >
              All courses
            </button>
            {COURSES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSelectedCourse(c.slug)}
                className={cn(
                  "pressable min-h-[40px] shrink-0 whitespace-nowrap rounded-[12px] px-3.5 font-mono text-xs font-semibold cursor-pointer",
                  selectedCourse === c.slug
                    ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                )}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 1. TIMED CBT MOCK EXAM STUDIO ==================== */}
      <section className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Mode 01 · Timed Exam Simulation
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
              Launch a Timed CBT Mock Exam
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)]">
            <ShieldCheck className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
            Solutions unlock after submission
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {visibleCourses.map((course) => {
            const activePresetId = presetByCourse[course.slug] ?? "midterm";
            const activePreset =
              EXAM_PRESETS.find((p) => p.id === activePresetId) ?? EXAM_PRESETS[1];
            const isLaunching = launchingSlug === course.slug;
            const book = TEXTBOOKS.find((b) => b.courseSlug === course.slug);

            return (
              /* Concentric CBT card: Outer 24px = Inner 12px + Padding 12px (p-3) */
              <article
                key={course.slug}
                className="flex flex-col justify-between rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="accent" className="font-mono">
                      {course.code}
                    </Badge>
                    <span className="tabular font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                      24 bank Qs
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-extrabold leading-snug text-[var(--text-primary)]">
                    {course.title}
                  </h3>
                  {book && (
                    <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                      Source: {book.authors.split(",")[0]} · {book.edition}
                    </p>
                  )}

                  {/* 3 Preset Selector Buttons (rounded-[12px]) */}
                  <div className="mt-3.5 grid grid-cols-3 gap-1.5">
                    {EXAM_PRESETS.map((preset) => {
                      const selected = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setPresetByCourse((prev) => ({
                              ...prev,
                              [course.slug]: preset.id,
                            }))
                          }
                          className={cn(
                            "pressable flex min-h-[48px] flex-col items-center justify-center rounded-[12px] border px-1.5 py-2 text-center cursor-pointer sm:px-2",
                            selected
                              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                          )}
                        >
                          <span className="text-[11px] font-bold leading-tight">
                            {preset.label}
                          </span>
                          <span className="tabular mt-0.5 font-mono text-[10px] opacity-80">
                            {preset.questions}Q · {preset.minutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border-hairline)] pt-3 min-[360px]:flex-row min-[360px]:items-center">
                  <button
                    type="button"
                    disabled={Boolean(launchingSlug)}
                    onClick={() => handleQuickStartExam(course.slug)}
                    className="pressable inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90 cursor-pointer disabled:opacity-60"
                  >
                    <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {isLaunching
                      ? "Starting…"
                      : `Start ${activePreset.questions}Q (${activePreset.minutes}m)`}
                  </button>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  >
                    Custom
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ==================== 2. ORGANIZED TOPIC-BY-TOPIC DRILL MATRIX ==================== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Mode 02 · Chapter-by-Chapter Practice
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
              Topic Drills Aligned with Your Lined Folios
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            Instant server check + full worked steps after every question
          </span>
        </div>

        <div className="space-y-4">
          {visibleCourses.map((course) => {
            const topics = COURSE_TOPICS_FALLBACK[course.slug] ?? [];
            return (
              <div
                key={course.slug}
                className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Badge variant="accent" className="font-mono">
                      {course.code}
                    </Badge>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      {course.title}
                    </h3>
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="font-mono text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Course overview →
                  </Link>
                </div>

                <div className="mt-3.5 grid gap-3 md:grid-cols-3">
                  {topics.map((topic) => {
                    const st = statsMap.get(topic.id);
                    const attempted = (st?.attempts_count ?? 0) > 0;
                    const acc = st?.accuracy_pct ?? 0;

                    return (
                      /* Concentric topic drill card: Outer 24px = Inner 12px + Padding 12px (p-3) */
                      <div
                        key={topic.id}
                        className="flex flex-col justify-between rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-[var(--accent)]">
                              Folio 0{topic.display_order}
                            </span>
                            {attempted ? (
                              <Badge
                                variant={acc >= 70 ? "success" : "danger"}
                                className="tabular font-mono"
                              >
                                {acc >= 70 ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {acc}%
                                  </>
                                ) : (
                                  `${acc}% · Review`
                                )}
                              </Badge>
                            ) : (
                              <Badge variant="neutral" className="tabular font-mono">
                                {topic.question_count} Qs
                              </Badge>
                            )}
                          </div>

                          <h4 className="mt-2 text-sm font-extrabold leading-snug text-[var(--text-primary)]">
                            {topic.title}
                          </h4>
                          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                            {topic.textbook_ref}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-[var(--border-hairline)] pt-3">
                          <Link
                            href={`/practice/${topic.id}`}
                            className="pressable inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
                          >
                            <PenTool className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Drill ({topic.question_count})
                          </Link>
                          <Link
                            href={`/courses/${course.slug}/${topic.slug}`}
                            className="pressable inline-flex min-h-[44px] items-center justify-center gap-1 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                            title="Read lined folio notes"
                          >
                            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Notes
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 3. STRICT TEXTBOOK FIGURE PROBLEMS + RECENT SCRIPTS ==================== */}
      <div className="grid gap-5 lg:grid-cols-12">
        <section className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5 lg:col-span-8">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Diagram-Backed Problems
              </p>
              <h2 className="mt-0.5 text-base font-extrabold text-[var(--text-primary)]">
                Strict Textbook Figure Questions
              </h2>
            </div>
            <Layers className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {visibleFigureDrills.slice(0, 6).map((drill) => (
              <Link
                key={drill.id}
                href={`/practice/${drill.topicId}`}
                className="pressable hover-lift flex flex-col justify-between overflow-hidden rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
              >
                <div>
                  {drill.figureImage && (
                    <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--border-hairline)] bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={drill.figureImage}
                        alt={drill.title}
                        width={400}
                        height={240}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full w-auto max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-1.5">
                    <Badge variant="accent" className="font-mono">
                      <span translate="no">{drill.courseCode}</span>
                    </Badge>
                    <span className="truncate font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                      {drill.textbookRef}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-extrabold leading-snug text-[var(--text-primary)] sm:text-sm">
                    {drill.title}
                  </h3>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-bold text-[var(--accent)]">
                  Solve in runner <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Graded Exam Scripts */}
        <aside className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
              Recent Exam Scripts
            </h2>
            <ClipboardCheck className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
          </div>

          {!user ? (
            <div className="mt-4 rounded-[24px] bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-secondary)]">
              <p className="px-1">Sign in to save your graded CBT exam scripts and track weak topics automatically.</p>
              <Link
                href="/login"
                className="pressable mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-4 font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
              >
                Log in →
              </Link>
            </div>
          ) : !data || data.recent_exams.length === 0 ? (
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              No timed mock exams submitted yet. Pick a preset in the Exam Studio above to generate your first CBT paper!
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.recent_exams.slice(0, 6).map((ex) => {
                const pct =
                  ex.score != null && ex.total_questions > 0
                    ? Math.round((ex.score / ex.total_questions) * 100)
                    : null;
                return (
                  <li key={ex.id}>
                    <Link
                      href={`/mock-exams/${ex.id}`}
                      className="pressable hover-lift flex items-center justify-between gap-2 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
                          {ex.course_code}
                        </span>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)]">
                          <Clock className="h-3 w-3 text-[var(--text-muted)]" aria-hidden="true" />
                          {ex.total_questions} Qs · {Math.round(ex.duration_seconds / 60)}m
                        </p>
                      </div>
                      <Badge
                        variant={pct != null && pct >= 70 ? "success" : "neutral"}
                        className="tabular font-mono"
                      >
                        {ex.submitted_at ? `${ex.score}/${ex.total_questions} (${pct}%)` : "Resume"}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
