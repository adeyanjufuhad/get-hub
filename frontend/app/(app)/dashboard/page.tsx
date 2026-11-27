"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrescribedTextbooks } from "@/components/dashboard/prescribed-textbooks";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  COURSE_BANNER_IMAGES,
  COURSE_TOPICS_FALLBACK,
  TEXTBOOKS,
} from "@/lib/config";
import type { DashboardPayload } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let active = true;
    api
      .dashboard()
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="h-64 animate-pulse rounded-[24px] bg-[var(--bg-surface)] lg:col-span-7" />
          <div className="h-64 animate-pulse rounded-[24px] bg-[var(--bg-surface)] lg:col-span-5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-72 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />
          <div className="h-72 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />
          <div className="h-72 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.user.full_name.split(" ")[0] || "Engineer";
  const heroSlug = data.continue_topic?.course_slug ?? "get-205";
  const heroBanner = COURSE_BANNER_IMAGES[heroSlug] ?? "/images/courses/get-205.webp";
  const accuracyPct = Math.max(0, Math.min(100, data.summary.overall_accuracy));
  const totalTopics = Math.max(1, data.summary.total_topics);
  const folioCoveragePct = Math.round((data.summary.completed_topics / totalTopics) * 100);
  const readinessPct =
    data.summary.total_attempts > 0
      ? Math.round(folioCoveragePct * 0.45 + accuracyPct * 0.55)
      : folioCoveragePct;

  const completedIds = new Set(
    data.topic_stats.filter((s) => s.completed).map((s) => s.topic_id)
  );

  return (
    <div className="space-y-7">
      {/* ==================== 1. EDITORIAL COMMAND HEADER + PILL NAV ==================== */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
              {data.user.department} · {data.user.level}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 font-mono text-[11px] font-extrabold text-[var(--accent)] tabular">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              {data.streak_days} {data.streak_days === 1 ? "day" : "days"} streak
            </span>
          </div>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] text-balance sm:text-3xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)] text-pretty sm:text-sm">
            Pick up your lined coursebook folio, drill textbook schematics, or run a timed CBT mock.
          </p>
        </div>

        {/* Concentric Segmented Quick-Jump Strip: Outer 16px = Inner 12px + Padding 4px (p-1) */}
        <div className="-mx-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex items-center gap-1 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1">
            <Link
              href="/courses"
              className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
            >
              Study Folios
            </Link>
            <Link
              href="/tests"
              className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] px-3.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              Test Center
            </Link>
            <a
              href="#textbooks"
              className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] px-3.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              3 Textbooks
            </a>
          </div>
        </div>
      </section>

      {/* ==================== 2. BENTO HERO: RESUME FOLIO + SEMESTER MASTERY ==================== */}
      <section className="grid gap-4 lg:grid-cols-12">
        {/* Left 7 cols: Concentric Obsidian Hero (Outer 28px = Inner 12px + p-4 [16px]; sm: Outer 32px = 12 + 20) */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-[#141413] p-4 text-white sm:rounded-[32px] sm:p-5 lg:col-span-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBanner}
            alt=""
            aria-hidden="true"
            width={800}
            height={450}
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-22 mix-blend-luminosity"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413]/92 to-[#141413]/60"
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EA580C] px-3 py-1 font-mono text-[11px] font-bold text-white">
                {data.continue_topic ? "RESUME LINED FOLIO" : "START FIRST FOLIO"}
              </span>
              <span
                translate="no"
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] font-medium text-neutral-200"
              >
                {data.continue_topic ? data.continue_topic.course_code : "GET 205 · Çengel Ch. 2 & 11"}
              </span>
            </div>

            {data.continue_topic ? (
              <>
                <h2 className="mt-3.5 text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">
                  {data.continue_topic.topic_title}
                </h2>
                <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-neutral-300 sm:text-sm">
                  {data.continue_topic.course_title} — open the lined coursebook notes with real textbook figures and worked steps.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-3.5 text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">
                  Fluid Properties, Hydrostatic Pressure &amp; Manometry
                </h2>
                <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-neutral-300 sm:text-sm">
                  Read the lined study folio backed by Çengel schematics and step-by-step worked manometer &amp; submerged-gate examples.
                </p>
              </>
            )}
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-1 gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center">
            <Link
              href={
                data.continue_topic
                  ? `/courses/${data.continue_topic.course_slug}/${data.continue_topic.topic_slug}`
                  : "/courses/get-205/fluid-properties-and-hydrostatics"
              }
              className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#EA580C] px-5 text-sm font-semibold text-white hover:bg-[#C2410C]"
            >
              Open lined folio →
            </Link>
            <Link
              href={
                data.continue_topic
                  ? `/practice/${data.continue_topic.topic_id}`
                  : "/practice/22222222-2222-4222-8222-222222220205"
              }
              className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
            >
              Drill chapter questions
            </Link>
          </div>
        </div>

        {/* Right 5 cols: Concentric Readiness Bento (Outer 28px = 12+16; sm: Outer 32px = 12+20) */}
        <div className="flex flex-col justify-between rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5 lg:col-span-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  Semester Readiness
                </p>
                <p className="tabular mt-1 text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {readinessPct}%
                </p>
              </div>
              <Link
                href="/tests"
                className="pressable inline-flex min-h-[40px] shrink-0 items-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 font-mono text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                Take a test →
              </Link>
            </div>

            {/* GPU-composited scaleX Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={readinessPct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
            >
              <div
                className="h-full w-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-200 ease-[var(--ease-out)]"
                style={{ transform: `scaleX(${Math.max(0.04, readinessPct / 100)})` }}
              />
            </div>

            {/* 3 Crisp Status Mini-Tiles (rounded-[12px] concentric with parent) */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="min-w-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5 sm:p-3">
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">Folios</p>
                <p className="tabular mt-1 font-mono text-sm font-extrabold text-[var(--text-primary)] sm:text-base">
                  {data.summary.completed_topics}/{data.summary.total_topics}
                </p>
              </div>
              <div className="min-w-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5 sm:p-3">
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">Solved</p>
                <p className="tabular mt-1 font-mono text-sm font-extrabold text-[var(--text-primary)] sm:text-base">
                  {data.summary.total_attempts}
                </p>
              </div>
              <div className="min-w-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5 sm:p-3">
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">Accuracy</p>
                <p className="tabular mt-1 font-mono text-sm font-extrabold text-[var(--accent)] sm:text-base">
                  {accuracyPct}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-3.5 text-xs">
            <span className="text-[var(--text-secondary)]">
              72 textbook-verified questions ready
            </span>
            <Link href="/progress" className="font-semibold text-[var(--accent)] hover:underline">
              Analytics →
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 3. ORGANIZED COURSEBOOKS & FOLIO ROADMAP ==================== */}
      <section>
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Notes &amp; Assessments by Course
            </p>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] sm:text-xl">
              Your 200L First-Semester Coursebooks
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex min-h-[38px] items-center font-mono text-xs font-bold text-[var(--accent)] hover:underline"
          >
            All folios →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => {
            const total = course.total_topics ?? 3;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const bannerSrc =
              COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";
            const matchedBook = TEXTBOOKS.find((b) => b.courseSlug === course.slug);
            const folios = COURSE_TOPICS_FALLBACK[course.slug] ?? [];

            return (
              /* Concentric course card: Outer 24px, bottom action bar p-3 (12px) -> inner buttons 12px (12+12=24) */
              <article
                key={course.id}
                className="flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141413]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bannerSrc}
                      alt={`${course.code} ${course.title}`}
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                    />
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span
                        translate="no"
                        className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white shadow-sm"
                      >
                        {course.code}
                      </span>
                      <span className="tabular rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-xs">
                        {done}/{total} folios · {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-extrabold leading-snug text-[var(--text-primary)]">
                      {course.title}
                    </h3>
                    {matchedBook && (
                      <p className="mt-1 truncate font-mono text-[11px] font-medium text-[var(--text-muted)]">
                        Text: {matchedBook.authors.split("&")[0]?.trim()} ({matchedBook.edition})
                      </p>
                    )}

                    {/* Concentric inner folio list: Outer 20px = Inner 12px + Padding 8px (p-2) */}
                    <div className="mt-3.5 space-y-1 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--paper-bg)] p-2">
                      {folios.map((folio) => {
                        const isRead = completedIds.has(folio.id);
                        return (
                          <Link
                            key={folio.id}
                            href={`/courses/${course.slug}/${folio.slug}`}
                            className="pressable flex items-center justify-between gap-2 rounded-[12px] px-2.5 py-1.5 text-xs hover:bg-[var(--bg-subtle)]"
                          >
                            <span className="min-w-0 truncate font-medium text-[var(--text-primary)]">
                              <span
                                className={cn(
                                  "mr-1.5 font-mono text-[10px] font-bold",
                                  isRead ? "text-[var(--success)]" : "text-[var(--accent)]"
                                )}
                              >
                                {isRead ? "✓" : `0${folio.display_order}`}
                              </span>
                              {folio.title}
                            </span>
                            <span className="tabular shrink-0 font-mono text-[10px] text-[var(--text-muted)]">
                              {folio.question_count}Q
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
                    >
                      <div
                        className="h-full w-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-200 ease-[var(--ease-out)]"
                        style={{ transform: `scaleX(${pct / 100})` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Concentric card footer: p-3 (12px) + inner buttons 12px = 24px outer */}
                <div className="grid grid-cols-1 gap-2 border-t border-[var(--border-hairline)] p-3 min-[340px]:grid-cols-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
                  >
                    Open folios →
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[var(--border-hairline)] px-3.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  >
                    Timed CBT
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ==================== 4. TOPIC RISK ALERTS + RECENT CBT EXAMS ==================== */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Outer 28px = Inner row 16px + p-3 (12px); Inner row 16px = Button 8px + p-2 (8px) */}
        <div className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--danger)]">
                Revision Priority
              </p>
              <h2 className="mt-0.5 text-base font-extrabold text-[var(--text-primary)]">
                Weak Topics (&lt; 70% Accuracy)
              </h2>
            </div>
            <Link
              href="/progress"
              className="font-mono text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Full breakdown →
            </Link>
          </div>

          {data.weak_topics.length === 0 ? (
            <div className="mt-3.5 rounded-[16px] bg-[var(--bg-canvas)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">
              No weak topics flagged yet! Solve chapter drills in the{" "}
              <Link href="/tests" className="font-bold text-[var(--accent)] underline">
                Test Center
              </Link>{" "}
              to automatically track accuracy across GET 205, 207, and 209.
            </div>
          ) : (
            <ul className="mt-3.5 space-y-2">
              {data.weak_topics.slice(0, 4).map((wt) => (
                <li
                  key={wt.topic_id}
                  className="flex flex-col items-start justify-between gap-2.5 rounded-[16px] border border-[var(--danger)]/20 bg-[var(--bg-canvas)] p-2 min-[420px]:flex-row min-[420px]:items-center"
                >
                  <div className="min-w-0 px-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--danger)]"
                      />
                      <span className="font-mono text-[11px] font-bold text-[var(--danger)]">
                        {wt.course_code} · High Risk
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-bold leading-snug text-[var(--text-primary)] min-[420px]:truncate">
                      {wt.topic_title}
                    </p>
                  </div>
                  <Link
                    href={`/practice/${wt.topic_id}`}
                    className="pressable inline-flex min-h-[38px] shrink-0 items-center rounded-[8px] bg-[var(--danger-soft)] px-3.5 font-mono text-xs font-bold text-[var(--danger)]"
                  >
                    {wt.accuracy_pct}% · Drill
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Exam Simulation History
              </p>
              <h2 className="mt-0.5 text-base font-extrabold text-[var(--text-primary)]">
                Recent Timed Mock Exams
              </h2>
            </div>
            <Link
              href="/tests"
              className="font-mono text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Launch new →
            </Link>
          </div>

          {data.recent_exams.length === 0 ? (
            <div className="mt-3.5 flex flex-col justify-between gap-3 rounded-[16px] bg-[var(--bg-canvas)] p-2.5 sm:flex-row sm:items-center">
              <p className="px-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                No timed CBT papers taken yet. Simulate OAU test pressure with 5, 10, or 15 questions.
              </p>
              <Link
                href="/tests"
                className="pressable inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
              >
                Start CBT →
              </Link>
            </div>
          ) : (
            <ul className="mt-3.5 space-y-2">
              {data.recent_exams.slice(0, 4).map((ex) => {
                const pct =
                  ex.score != null && ex.total_questions > 0
                    ? Math.round((ex.score / ex.total_questions) * 100)
                    : null;
                return (
                  <li key={ex.id}>
                    <Link
                      href={`/mock-exams/${ex.id}`}
                      className="pressable hover-lift flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
                          {ex.course_code}
                        </span>
                        <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                          {ex.total_questions} questions · {Math.round(ex.duration_seconds / 60)} min
                        </p>
                      </div>
                      <Badge variant={pct != null && pct >= 70 ? "success" : "neutral"} className="tabular shrink-0 font-mono">
                        {ex.submitted_at ? `${ex.score}/${ex.total_questions} (${pct}%)` : "In progress"}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ==================== 6. 3 MATCHED TEXTBOOKS + STRICT TEXTBOOK PROBLEMS ==================== */}
      <PrescribedTextbooks />
    </div>
  );
}
