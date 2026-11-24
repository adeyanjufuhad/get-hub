"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { ProgressArc } from "@/components/ui/progress-arc";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { DashboardPayload } from "@/lib/types";

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
    return <div className="h-80 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />;
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your Study Progress</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Accuracy per topic and weak areas ranked from lowest to highest.
          </p>
        </div>
        <Badge variant="accent" className="tabular px-3.5 py-2 text-xs">
          <Flame className="h-4 w-4" />
          {data.streak_days}-day streak
        </Badge>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Topics completed</p>
          <p className="tabular mt-1 text-2xl font-extrabold">
            {data.summary.completed_topics}/{data.summary.total_topics}
          </p>
        </div>
        <div className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Questions attempted</p>
          <p className="tabular mt-1 text-2xl font-extrabold">{data.summary.total_attempts}</p>
        </div>
        <div className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Overall accuracy</p>
          <p className="tabular mt-1 text-2xl font-extrabold">{data.summary.overall_accuracy}%</p>
        </div>
        <div className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Weak topics</p>
          <p className="tabular mt-1 text-2xl font-extrabold text-[var(--danger)]">
            {data.weak_topics.length}
          </p>
        </div>
      </div>

      {/* Weak Topics Priority Card */}
      <section className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
          <h2 className="text-base font-extrabold">Weak topics (&lt; 70% accuracy)</h2>
        </div>

        {data.weak_topics.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            You have no weak topics right now. Keep practicing across GET 203, 207, and 209!
          </p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {data.weak_topics.map((wt) => (
              <div
                key={wt.topic_id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-soft)]/50 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--danger)]">
                    {wt.course_code} · {wt.accuracy_pct}% accuracy ({wt.correct_count}/{wt.attempts_count})
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{wt.topic_title}</h3>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${wt.course_slug}/${wt.topic_slug}`}
                    className="pressable inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold"
                  >
                    Revise notes
                  </Link>
                  <Link
                    href={`/practice/${wt.topic_id}`}
                    className="pressable inline-flex min-h-[40px] items-center gap-1 rounded-full bg-[var(--danger)] px-4 text-xs font-semibold text-white"
                  >
                    Drill now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accuracy Per Topic */}
      <section className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <h2 className="text-base font-extrabold">Accuracy by topic</h2>
        <div className="mt-4 space-y-3">
          {data.topic_stats.map((st) => (
            <div
              key={st.topic_id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--bg-canvas)] p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral" className="font-mono">
                    {st.course_code}
                  </Badge>
                  {st.completed && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">
                  {st.topic_title}
                </p>
                <p className="tabular mt-0.5 text-xs text-[var(--text-muted)]">
                  {st.attempts_count} attempts · {st.correct_count} correct
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(st.attempts_count === 0 && "opacity-40")}>
                  <ProgressArc percentage={st.accuracy_pct} size={50} strokeWidth={5} />
                </div>
                <Link
                  href={`/practice/${st.topic_id}`}
                  className="pressable inline-flex min-h-[40px] items-center rounded-full bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)]"
                >
                  Practice
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
