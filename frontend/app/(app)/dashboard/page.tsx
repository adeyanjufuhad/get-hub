"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrescribedTextbooks } from "@/components/dashboard/prescribed-textbooks";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { ApiError, api } from "@/lib/api";
import { COURSE_BANNER_IMAGES } from "@/lib/config";
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
        <div className="h-24 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-56 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          <div className="h-56 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          <div className="h-56 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.user.full_name.split(" ")[0] || "Engineer";
  const heroSlug = data.continue_topic?.course_slug ?? "get-205";
  const heroBanner = COURSE_BANNER_IMAGES[heroSlug] ?? "/images/courses/get-205.webp";
  const accuracyPct = Math.max(0, Math.min(100, data.summary.overall_accuracy));

  return (
    <div className="space-y-6">
      {/* Greeting + Streak Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-[var(--text-muted)]">
            {data.user.department} · {data.user.level}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Hey {firstName}, ready to grind?
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
          />
          <span className="tabular text-sm font-extrabold text-[var(--accent)]">
            {data.streak_days} {data.streak_days === 1 ? "day" : "days"} streak
          </span>
        </div>
      </section>

      {/* Continue Where You Stopped + Quick Stats */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-[#141413] p-5 text-white sm:p-6 lg:col-span-7">
          {/* Subtle real photo backdrop on right edge */}
          <img
            src={heroBanner}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413]/90 to-[#141413]/65"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-orange-300">
              ▸ {data.continue_topic ? "Continue where you stopped" : "Jump into your first topic"}
            </span>
            {data.continue_topic ? (
              <>
                <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                  {data.continue_topic.course_code}: {data.continue_topic.topic_title}
                </h2>
                <p className="mt-1 text-sm text-neutral-300">{data.continue_topic.course_title}</p>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                  GET 205: Fluid Properties, Hydrostatic Pressure &amp; Manometry
                </h2>
                <p className="mt-1 text-sm text-neutral-300">
                  Start with clear worked notes and instant-feedback textbook-style practice drills.
                </p>
              </>
            )}
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2.5">
            <Link
              href={
                data.continue_topic
                  ? `/courses/${data.continue_topic.course_slug}/${data.continue_topic.topic_slug}`
                  : "/courses/get-205/fluid-properties-and-hydrostatics"
              }
              className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#EA580C] px-5 text-sm font-semibold text-white"
            >
              Open topic →
            </Link>
            <Link
              href={
                data.continue_topic
                  ? `/practice/${data.continue_topic.topic_id}`
                  : "/courses"
              }
              className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white"
            >
              Practice now
            </Link>
          </div>
        </div>

        {/* 3 Compact Metric Tiles (responsive 2+1 on phones, 3-up on sm, stacked on lg; zero SVG) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
          <div className="flex items-center justify-between gap-2 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--text-muted)]">Topics done</p>
              <p className="tabular mt-1 text-xl font-extrabold text-[var(--text-primary)]">
                {data.summary.completed_topics}
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  /{data.summary.total_topics}
                </span>
              </p>
            </div>
            <Badge variant="accent" className="hidden shrink-0 font-mono sm:inline-flex">
              CCMAS
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--text-muted)]">Attempted</p>
              <p className="tabular mt-1 text-xl font-extrabold text-[var(--text-primary)]">
                {data.summary.total_attempts}
              </p>
            </div>
            <Badge variant="neutral" className="hidden shrink-0 sm:inline-flex">
              Questions
            </Badge>
          </div>

          <div className="col-span-2 flex flex-col justify-center rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:col-span-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-medium text-[var(--text-muted)]">Accuracy</p>
              <p className="tabular text-xl font-extrabold text-[var(--text-primary)]">
                {accuracyPct}%
              </p>
            </div>
            <div
              role="progressbar"
              aria-valuenow={accuracyPct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
            >
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                style={{ width: `${accuracyPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Downloadable Part 2 Notes & Past Questions Library Banner (zero SVG) */}
      <section className="flex flex-col justify-between gap-4 rounded-[22px] border border-[var(--accent-border)] bg-[var(--accent-soft)]/70 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="font-mono">
              OAU PART 2 LIBRARY
            </Badge>
            <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
              14 Courses · PDFs &amp; Slides
            </span>
          </div>
          <h2 className="mt-1.5 text-base font-extrabold tracking-tight text-[var(--text-primary)]">
            Download lecture notes, tutorials, lab manuals &amp; past questions
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            Browse curated OAU Second Year materials (MTH 201/202, MEE 203/205/206, CHE 201, CSC 201, EEE 251–282 &amp; more) with file sizes shown upfront for campus data.
          </p>
        </div>
        <Link
          href="/library"
          className="pressable inline-flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-full bg-[var(--ink-cta)] px-5 text-xs font-semibold text-[var(--ink-cta-text)] sm:w-auto"
        >
          Open Notes Library →
        </Link>
      </section>

      {/* My Courses with real engineering photography */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            Your 200L First-Semester Courses
          </h2>
          <Link href="/courses" className="inline-flex min-h-[44px] items-center text-xs font-semibold text-[var(--accent)]">
            View all →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => {
            const total = course.total_topics ?? 0;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const bannerSrc =
              COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";

            return (
              <article
                key={course.id}
                className="hover-lift flex flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              >
                <div>
                  {/* Real engineering photo banner */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141413]">
                    <img
                      src={bannerSrc}
                      alt={`${course.code} ${course.title}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
                    />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white shadow-sm">
                        {course.code}
                      </span>
                      <span className="tabular rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-xs">
                        {pct}% done
                      </span>
                    </div>
                  </div>

                  <div className="p-4 pb-3">
                    <h3 className="text-base font-bold leading-snug text-[var(--text-primary)]">
                      {course.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {course.description}
                    </p>

                    {/* Pure CSS progress track */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span>Syllabus progress</span>
                        <span className="tabular font-mono font-semibold text-[var(--text-secondary)]">
                          {done}/{total} topics
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
                      >
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] px-4 py-3">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                  >
                    Open topics →
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[var(--border-hairline)] px-3.5 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    Timed mock
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Weak Topics + Recent Mock Exams */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Weak topics to revisit</h2>
            <Link href="/progress" className="inline-flex min-h-[44px] items-center text-xs font-semibold text-[var(--accent)]">
              Full progress →
            </Link>
          </div>
          {data.weak_topics.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              No weak topics flagged yet! Attempt practice questions to surface topics below 70% accuracy.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {data.weak_topics.slice(0, 4).map((wt) => (
                <li
                  key={wt.topic_id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-canvas)] p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--danger)]"
                      />
                      <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                        {wt.course_code}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {wt.topic_title}
                    </p>
                  </div>
                  <Link
                    href={`/practice/${wt.topic_id}`}
                    className="pressable shrink-0 rounded-full bg-[var(--danger-soft)] px-3 py-1.5 font-mono text-xs font-bold text-[var(--danger)]"
                  >
                    {wt.accuracy_pct}% · Drill
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Recent mock exams</h2>
          {data.recent_exams.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              No mock exams taken yet. Pick any course above and tap <strong>Timed mock</strong> to test yourself under exam timing.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {data.recent_exams.slice(0, 4).map((ex) => {
                const pct =
                  ex.score != null && ex.total_questions > 0
                    ? Math.round((ex.score / ex.total_questions) * 100)
                    : null;
                return (
                  <li key={ex.id}>
                    <Link
                      href={`/mock-exams/${ex.id}`}
                      className="pressable flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-canvas)] p-3"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">
                          {ex.course_code}
                        </span>
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {ex.total_questions} questions · {Math.round(ex.duration_seconds / 60)} min
                        </p>
                      </div>
                      <Badge variant={pct != null && pct >= 70 ? "success" : "neutral"} className="tabular">
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

      {/* Prescribed Textbooks & Textbook-Style Practice Drills */}
      <div id="textbooks" className="scroll-mt-20">
        <PrescribedTextbooks />
      </div>
    </div>
  );
}
