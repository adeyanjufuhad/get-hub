"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { Counter } from "@/components/reactbits/counter";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { COURSES } from "@/lib/config";
import type { DashboardPayload, TopicAccuracy } from "@/lib/types";

/** Accuracy colour bands, shared by the bars and the numbers. */
function tone(pct: number) {
  if (pct >= 70) return { bar: "bg-[var(--success)]", text: "text-[var(--success)]" };
  if (pct >= 50) return { bar: "bg-[var(--warning)]", text: "text-[var(--warning)]" };
  return { bar: "bg-[var(--danger)]", text: "text-[var(--danger)]" };
}

/** A thin bar that grows from 0 to `pct` once mounted (transform only, so it stays on the compositor). */
function AccuracyBar({ pct, className }: { pct: number; className?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
    >
      <div
        className={cn(
          "h-full w-full origin-left rounded-full transition-transform duration-700 ease-[var(--ease-out)] motion-reduce:transition-none",
          className
        )}
        style={{ transform: `scaleX(${Math.max(0, Math.min(100, shown)) / 100})` }}
      />
    </div>
  );
}

export default function ProgressPage() {
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
    api
      .dashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-64 rounded-[12px] bg-[var(--bg-surface)]" />
        <div className="h-24 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
        <div className="h-80 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
      </div>
    );
  }
  if (!data) return null;

  const stats = [
    { label: "Topics completed", value: data.summary.completed_topics, suffix: `/${data.summary.total_topics}` },
    { label: "Questions answered", value: data.summary.total_attempts, suffix: "" },
    { label: "Overall accuracy", value: data.summary.overall_accuracy, suffix: "%" },
    { label: "Weak topics", value: data.weak_topics.length, suffix: "" },
  ];

  // Group topic stats by course, in course order, with a per-course accuracy over attempted topics.
  const byCourse = COURSES.map((course) => {
    const topics = data.topic_stats.filter((t) => t.course_slug === course.slug);
    const attempts = topics.reduce((sum, t) => sum + t.attempts_count, 0);
    const correct = topics.reduce((sum, t) => sum + t.correct_count, 0);
    return {
      course,
      topics,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : null,
    };
  }).filter((group) => group.topics.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Study progress
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-secondary)]">
          <span>Accuracy per topic, weakest first.</span>
          <StreakLabel days={data.streak_days} />
        </p>
      </header>

      {/* One stat strip, four cells */}
      <section
        aria-label="Summary"
        className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] sm:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "p-4 sm:p-5",
              i % 2 === 1 && "border-l border-[var(--border-hairline)]",
              i >= 2 && "border-t border-[var(--border-hairline)] sm:border-t-0",
              i === 2 && "sm:border-l"
            )}
          >
            <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
            <p className="tabular mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              <Counter value={stat.value} />
              {stat.suffix && (
                <span className="text-base font-medium text-[var(--text-muted)] sm:text-lg">{stat.suffix}</span>
              )}
            </p>
          </div>
        ))}
      </section>

      {/* Weak topics */}
      <section aria-labelledby="weak-heading">
        <h2 id="weak-heading" className="text-lg font-semibold tracking-tight">
          Needs review
        </h2>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Topics under 70% accuracy. Revise the notes, then practise again.
        </p>

        {data.weak_topics.length === 0 ? (
          <p className="mt-3 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)]">
            Nothing under 70% right now.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-hairline)] rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            {data.weak_topics.map((wt) => (
              <TopicRow key={wt.topic_id} topic={wt} showCourse />
            ))}
          </ul>
        )}
      </section>

      {/* Accuracy by topic, grouped by course */}
      <section aria-labelledby="all-heading" className="space-y-5">
        <div>
          <h2 id="all-heading" className="text-lg font-semibold tracking-tight">
            Accuracy by topic
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Green is 70% and above, amber 50–69%, red below 50%.
          </p>
        </div>

        {byCourse.map(({ course, topics, accuracy }) => (
          <div key={course.slug}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 className="min-w-0 truncate text-sm font-semibold text-[var(--text-primary)]">
                <span translate="no" className="text-[var(--accent)]">
                  {course.code}
                </span>{" "}
                {course.title}
              </h3>
              <span className="tabular shrink-0 text-xs text-[var(--text-muted)]">
                {accuracy == null ? "Not started" : `${accuracy}% overall`}
              </span>
            </div>
            <ul className="divide-y divide-[var(--border-hairline)] rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
              {topics.map((st) => (
                <TopicRow key={st.topic_id} topic={st} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function StreakLabel({ days }: { days: number }) {
  if (days <= 0) {
    return <span className="text-[var(--text-muted)]">No streak yet — answer a question today to start one.</span>;
  }
  return (
    <span className="tabular inline-flex items-center gap-1 font-medium text-[var(--accent)]">
      <Flame className="h-4 w-4" aria-hidden="true" />
      {days}-day streak
    </span>
  );
}

function TopicRow({ topic, showCourse = false }: { topic: TopicAccuracy; showCourse?: boolean }) {
  const started = topic.attempts_count > 0;
  const t = tone(topic.accuracy_pct);

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
      <div className="col-start-1 row-start-1 min-w-0">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          {showCourse && (
            <span translate="no" className="mr-1.5 text-[var(--text-muted)]">
              {topic.course_code}
            </span>
          )}
          {topic.topic_title}
        </p>
        <p className="tabular mt-0.5 text-xs text-[var(--text-muted)]">
          {started ? `${topic.correct_count} of ${topic.attempts_count} correct` : "Not started"}
          {topic.completed && " · notes read"}
        </p>
      </div>

      {/* Bar + number: own column on wide screens, full-width second line on phones */}
      <div className="col-span-2 col-start-1 row-start-2 flex items-center gap-3 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        {started ? (
          <>
            <AccuracyBar pct={topic.accuracy_pct} className={t.bar} />
            <span className={cn("tabular w-10 shrink-0 text-right text-sm font-semibold", t.text)}>
              {topic.accuracy_pct}%
            </span>
          </>
        ) : (
          <>
            <AccuracyBar pct={0} />
            <span className="w-10 shrink-0 text-right text-sm text-[var(--text-muted)]">—</span>
          </>
        )}
      </div>

      <div className="col-start-2 row-start-1 flex items-center gap-3 sm:col-start-3">
        <Link
          href={`/courses/${topic.course_slug}/${topic.topic_slug}`}
          className="hidden text-sm text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline sm:inline"
        >
          Notes
        </Link>
        <Link
          href={`/practice/${topic.topic_id}`}
          className="pressable inline-flex min-h-[36px] items-center rounded-[10px] bg-[var(--ink-cta)] px-3.5 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
        >
          Practice
        </Link>
      </div>
    </li>
  );
}
