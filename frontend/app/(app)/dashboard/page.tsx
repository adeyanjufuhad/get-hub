"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DiagramPracticeShowcase } from "@/components/dashboard/prescribed-textbooks";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StarCta } from "@/components/landing/reactbits-showcase";
import { useAuth } from "@/components/providers";
import { Counter } from "@/components/reactbits/counter";
import GradientText from "@/components/reactbits/gradient-text";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  COURSE_BANNER_IMAGES,
  COURSE_TOPICS_FALLBACK,
} from "@/lib/config";
import type { DashboardPayload } from "@/lib/types";

const ORANGE_GRADIENT = ["#EA580C", "#FB923C", "#F59E0B", "#EA580C"];

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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
        <div className="h-24 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="h-64 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] lg:col-span-7" />
          <div className="h-64 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] lg:col-span-5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-72 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
          <div className="h-72 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
          <div className="h-72 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const heroSlug = data.continue_topic?.course_slug ?? "get-205";
  const heroBanner = COURSE_BANNER_IMAGES[heroSlug] ?? "/images/courses/get-205.webp";
  const accuracyPct = Math.max(0, Math.min(100, data.summary.overall_accuracy));
  const totalTopics = Math.max(1, data.summary.total_topics);
  const folioCoveragePct = Math.round((data.summary.completed_topics / totalTopics) * 100);
  const readinessPct =
    data.summary.total_attempts > 0
      ? Math.round(folioCoveragePct * 0.45 + accuracyPct * 0.55)
      : folioCoveragePct;

  const firstName = data.user.full_name?.trim().split(/\s+/)[0] || "there";

  const completedIds = new Set(
    data.topic_stats.filter((s) => s.completed).map((s) => s.topic_id)
  );

  return (
    <div className="space-y-7">
      {/* ==================== 1. COMMAND HEADER + QUICK JUMP ==================== */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {/* Department and level already sit in the app's top bar, so only the streak shows here. */}
          {data.streak_days > 0 && (
            <p className="tabular inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              {data.streak_days}-day streak
            </p>
          )}
          <h1 className="mt-2.5 text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] text-balance sm:text-3xl">
            {greeting()},{" "}
            <GradientText colors={ORANGE_GRADIENT} animationSpeed={7} className="font-bold">
              {firstName}
            </GradientText>
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)] text-pretty">
            Continue your study notes, solve practice questions, or take a timed mock exam.
          </p>
        </div>

        {/* Concentric Segmented Quick-Jump Strip: Outer 16px = Inner 12px + Padding 4px (p-1) */}
        <div className="-mx-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex items-center gap-1 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1">
            <Link
              href="/courses"
              className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
            >
              Study notes
            </Link>
            <Link
              href="/tests"
              className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] px-3.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              Test center
            </Link>
            <a
              href="#practice-diagrams"
              className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] px-3.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              Diagram drills
            </a>
          </div>
        </div>
      </section>

      {/* ==================== 2. BENTO HERO: CONTINUE STUDY + READINESS ==================== */}
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
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413]/92 to-[#141413]/65"
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#EA580C] px-3 py-1 text-xs font-medium text-white">
                {data.continue_topic ? "Continue studying" : "Start first topic"}
              </span>
              <span
                translate="no"
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-xs font-medium text-neutral-200"
              >
                {data.continue_topic ? data.continue_topic.course_code : "GET 205"}
              </span>
            </div>

            {data.continue_topic ? (
              <>
                <h2 className="mt-3.5 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                  {data.continue_topic.topic_title}
                </h2>
                <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-neutral-300 sm:text-sm">
                  {data.continue_topic.course_title} — review the study notes, engineering diagrams, and worked examples.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-3.5 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                  Fluid Properties, Hydrostatic Pressure &amp; Manometry
                </h2>
                <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-neutral-300 sm:text-sm">
                  Read the study notes with clear schematics and step-by-step worked manometer and submerged-gate examples.
                </p>
              </>
            )}
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-1 gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center">
            <StarCta
              tone="accent"
              size="md"
              href={
                data.continue_topic
                  ? `/courses/${data.continue_topic.course_slug}/${data.continue_topic.topic_slug}`
                  : "/courses/get-205/fluid-properties-and-hydrostatics"
              }
            >
              Open study notes
            </StarCta>
            <Link
              href={
                data.continue_topic
                  ? `/practice/${data.continue_topic.topic_id}`
                  : "/practice/22222222-2222-4222-8222-222222220205"
              }
              className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-white/20 bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/15"
            >
              Practice questions
            </Link>
          </div>
        </div>

        {/* Right 5 cols: Concentric Readiness Bento (Outer 28px = 12+16; sm: Outer 32px = 12+20) */}
        <SpotlightCard
          spotlightSize={320}
          className="flex flex-col justify-between rounded-[28px] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5 lg:col-span-5"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--accent)]">
                  Semester readiness
                </p>
                <p className="tabular mt-1 text-4xl font-bold tracking-tight">
                  <GradientText colors={ORANGE_GRADIENT} animationSpeed={6}>
                    <Counter value={readinessPct} suffix="%" durationMs={900} />
                  </GradientText>
                </p>
              </div>
              <Link
                href="/tests"
                className="pressable inline-flex min-h-[40px] shrink-0 items-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
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
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
            >
              <div
                className="h-full w-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-200 ease-[var(--ease-out)]"
                style={{ transform: `scaleX(${Math.max(0.04, readinessPct / 100)})` }}
              />
            </div>

            {/* 3 Crisp Status Mini-Tiles (rounded-[12px] concentric with parent) */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="min-w-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5 sm:p-3">
                <p className="truncate text-xs text-[var(--text-muted)]">Topics read</p>
                <p className="tabular mt-1 font-mono text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                  {data.summary.completed_topics}/{data.summary.total_topics}
                </p>
              </div>
              <div className="min-w-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5 sm:p-3">
                <p className="truncate text-xs text-[var(--text-muted)]">Solved</p>
                <p className="tabular mt-1 font-mono text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                  <Counter value={data.summary.total_attempts} />
                </p>
              </div>
              <div className="min-w-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5 sm:p-3">
                <p className="truncate text-xs text-[var(--text-muted)]">Accuracy</p>
                <p className="tabular mt-1 font-mono text-sm font-semibold text-[var(--accent)] sm:text-base">
                  <Counter value={accuracyPct} suffix="%" />
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-3.5 text-xs">
            <span className="text-[var(--text-secondary)]">
              290+ graded practice questions ready
            </span>
            <Link href="/progress" className="font-medium text-[var(--accent)] hover:underline">
              Analytics →
            </Link>
          </div>
        </SpotlightCard>
      </section>

      {/* ==================== 2b. QUICK ACTIONS (React Bits PixelCard) ==================== */}
      <QuickActions weakCount={data.weak_topics.length} />

      {/* ==================== 3. COURSE ROADMAP ==================== */}
      <section>
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[var(--accent)]">
              Notes and practice by course
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-xl">
              Your 200L first-semester courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex min-h-[38px] items-center text-xs font-medium text-[var(--accent)] hover:underline"
          >
            All courses →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => {
            const total = course.total_topics ?? 3;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const bannerSrc =
              COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";
            const folios = COURSE_TOPICS_FALLBACK[course.slug] ?? [];

            return (
              /* Concentric course card: Outer 24px, bottom action bar p-3 (12px) -> inner buttons 12px (12+12=24) */
              <SpotlightCard
                key={course.id}
                role="article"
                spotlightSize={300}
                className="group/course flex flex-col justify-between rounded-[24px] bg-[var(--bg-surface)]"
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
                      className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover/course:scale-[1.04] motion-reduce:transition-none"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                    />
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span
                        translate="no"
                        className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-xs font-semibold text-white shadow-sm"
                      >
                        {course.code}
                      </span>
                      <span className="tabular rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-xs font-medium text-white backdrop-blur-xs">
                        {done}/{total} topics · {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold leading-snug text-[var(--text-primary)]">
                      {course.title}
                    </h3>

                    {/* Concentric inner topic list: Outer 20px = Inner 12px + Padding 8px (p-2) */}
                    <div className="mt-3 space-y-1 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--paper-bg)] p-2">
                      {folios.slice(0, 5).map((folio) => {
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
                                  "tabular mr-1.5 font-mono text-xs font-medium",
                                  isRead ? "text-[var(--success)]" : "text-[var(--accent)]"
                                )}
                              >
                                {isRead ? "✓" : String(folio.display_order).padStart(2, "0")}
                              </span>
                              {folio.title}
                            </span>
                          </Link>
                        );
                      })}
                      {folios.length > 5 && (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="block rounded-[12px] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--bg-subtle)]"
                        >
                          +{folios.length - 5} more topics
                        </Link>
                      )}
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
                    className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
                  >
                    Open notes →
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[var(--border-hairline)] px-3.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  >
                    Timed exam
                  </Link>
                </div>
              </SpotlightCard>
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
              <p className="text-xs font-medium text-[var(--danger)]">
                Revision priority
              </p>
              <h2 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">
                Weak topics (under 70% accuracy)
              </h2>
            </div>
            <Link
              href="/progress"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Full breakdown →
            </Link>
          </div>

          {data.weak_topics.length === 0 ? (
            <div className="mt-3.5 rounded-[16px] bg-[var(--bg-canvas)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">
              No weak topics flagged yet. Practice questions in the{" "}
              <Link href="/tests" className="font-medium text-[var(--accent)] underline">
                Test Center
              </Link>{" "}
              to track your accuracy across GET 205, 207, and 209.
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
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]"
                      />
                      <span className="font-mono text-xs font-medium text-[var(--danger)]">
                        {wt.course_code} · Needs review
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-[var(--text-primary)] min-[420px]:truncate">
                      {wt.topic_title}
                    </p>
                  </div>
                  <Link
                    href={`/practice/${wt.topic_id}`}
                    className="pressable tabular inline-flex min-h-[38px] shrink-0 items-center rounded-[8px] bg-[var(--danger-soft)] px-3.5 font-mono text-xs font-semibold text-[var(--danger)]"
                  >
                    {wt.accuracy_pct}% · Practice
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div>
              <p className="text-xs font-medium text-[var(--accent)]">
                Exam history
              </p>
              <h2 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">
                Recent timed mock exams
              </h2>
            </div>
            <Link
              href="/tests"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Launch new →
            </Link>
          </div>

          {data.recent_exams.length === 0 ? (
            <div className="mt-3.5 flex flex-col justify-between gap-3 rounded-[16px] bg-[var(--bg-canvas)] p-2.5 sm:flex-row sm:items-center">
              <p className="px-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                No timed exams taken yet. Practice under exam timing with 5, 10, or 15 questions.
              </p>
              <Link
                href="/tests"
                className="pressable inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--ink-cta)] px-4 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
              >
                Start exam →
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
                        <span className="font-mono text-xs font-medium text-[var(--accent)]">
                          {ex.course_code}
                        </span>
                        <p className="tabular truncate text-sm font-medium text-[var(--text-primary)]">
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

      {/* ==================== 5. DIAGRAM PRACTICE PROBLEMS ==================== */}
      <DiagramPracticeShowcase />
    </div>
  );
}
