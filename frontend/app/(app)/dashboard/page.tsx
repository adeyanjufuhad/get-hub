"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Flame,
  Play,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { ProgressArc } from "@/components/ui/progress-arc";
import { ApiError, api } from "@/lib/api";
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
          <div className="h-40 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          <div className="h-40 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          <div className="h-40 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.user.full_name.split(" ")[0] || "Engineer";

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
          <Flame className="h-5 w-5 text-[var(--accent)]" />
          <span className="tabular text-sm font-extrabold text-[var(--accent)]">
            {data.streak_days} {data.streak_days === 1 ? "day" : "days"} streak
          </span>
        </div>
      </section>

      {/* Continue Where You Stopped + Quick Stats */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-[24px] bg-[#141413] p-5 text-white sm:p-6 lg:col-span-7">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-orange-300">
              <Play className="h-3 w-3" />
              {data.continue_topic ? "Continue where you stopped" : "Jump into your first topic"}
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
                  GET 203: Projection of Straight Lines
                </h2>
                <p className="mt-1 text-sm text-neutral-300">
                  Start with crisp orthographic diagrams and 5 instant-feedback practice drills.
                </p>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href={
                data.continue_topic
                  ? `/courses/${data.continue_topic.course_slug}/${data.continue_topic.topic_slug}`
                  : "/courses/get-203/projection-of-lines"
              }
              className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#EA580C] px-5 text-sm font-semibold text-white"
            >
              Open topic
              <ArrowRight className="h-4 w-4" />
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

        {/* 3 Compact Metric Tiles */}
        <div className="grid grid-cols-3 gap-3 lg:col-span-5 lg:grid-cols-1">
          <div className="flex items-center justify-between rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Topics done</p>
              <p className="tabular mt-1 text-xl font-extrabold text-[var(--text-primary)]">
                {data.summary.completed_topics}
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  /{data.summary.total_topics}
                </span>
              </p>
            </div>
            <BookOpen className="hidden h-5 w-5 text-[var(--accent)] sm:block" />
          </div>

          <div className="flex items-center justify-between rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Attempted</p>
              <p className="tabular mt-1 text-xl font-extrabold text-[var(--text-primary)]">
                {data.summary.total_attempts}
              </p>
            </div>
            <Badge variant="neutral" className="hidden sm:inline-flex">
              Questions
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">Accuracy</p>
              <p className="tabular mt-1 text-xl font-extrabold text-[var(--text-primary)]">
                {data.summary.overall_accuracy}%
              </p>
            </div>
            <div className="hidden sm:block">
              <ProgressArc percentage={data.summary.overall_accuracy} size={44} strokeWidth={5} />
            </div>
          </div>
        </div>
      </section>

      {/* My Courses */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            Your 200L First-Semester Courses
          </h2>
          <Link href="/courses" className="text-xs font-semibold text-[var(--accent)]">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => {
            const total = course.total_topics ?? 0;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={course.id}
                className="hover-lift flex flex-col justify-between rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="accent" className="font-mono">
                        {course.code}
                      </Badge>
                      <h3 className="mt-2.5 text-base font-bold leading-snug text-[var(--text-primary)]">
                        {course.title}
                      </h3>
                    </div>
                    <ProgressArc percentage={pct} size={52} strokeWidth={5} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {course.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-3.5">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                  >
                    Open topics
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[var(--border-hairline)] px-3 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    <Timer className="h-3.5 w-3.5" />
                    Mock
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weak Topics + Recent Mock Exams */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Weak topics to revisit</h2>
            <Link href="/progress" className="text-xs font-semibold text-[var(--accent)]">
              Full progress
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
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
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
              No mock exams taken yet. Pick any course above and tap <strong>Mock</strong> to test yourself under exam timing.
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
    </div>
  );
}
