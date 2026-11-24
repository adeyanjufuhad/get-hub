"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Eye, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { api } from "@/lib/api";

export function DiagramFigure({ src, caption }: { src: string; caption?: string }) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption || "Engineering diagram"}
        loading="lazy"
        className="mx-auto w-full max-w-2xl rounded-xl bg-white"
      />
      {caption && (
        <figcaption className="mt-2.5 text-center text-xs leading-relaxed text-[var(--text-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function StepRevealExample({
  title,
  problem,
  steps,
}: {
  title: string;
  problem: string;
  steps: string[];
}) {
  const [shown, setShown] = useState(0);

  return (
    <div className="my-6 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="!mt-0 !mb-0 text-base font-bold text-[var(--text-primary)]">{title}</h3>
        <span className="tabular rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--accent)]">
          {shown} / {steps.length} steps
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-[var(--bg-canvas)] p-3.5 text-sm leading-relaxed text-[var(--text-primary)]">
        <MathText text={problem} />
      </div>

      {shown > 0 && (
        <ol className="!pl-0 !list-none mt-4 space-y-2.5">
          {steps.slice(0, shown).map((step, idx) => (
            <li
              key={idx}
              className="flex gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 p-3.5 text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-mono text-xs font-bold text-white">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <MathText text={step} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {shown < steps.length ? (
          <>
            <Button
              type="button"
              variant="ink"
              size="md"
              onClick={() => setShown((s) => Math.min(steps.length, s + 1))}
            >
              <Eye className="h-4 w-4" />
              {shown === 0 ? "Show Step 1" : `Next step (${shown + 1} of ${steps.length})`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShown(steps.length)}
            >
              Reveal all
            </Button>
          </>
        ) : (
          <Button type="button" variant="secondary" size="md" onClick={() => setShown(0)}>
            <RotateCcw className="h-4 w-4" />
            Hide steps &amp; retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function Callout({
  title,
  children,
}: {
  variant?: "warning" | "info";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning-soft)] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-[var(--warning)]">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{title}</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

export function TopicActionBar({
  topicId,
  courseSlug,
}: {
  topicId: string;
  courseSlug: string;
}) {
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !topicId) return;
    void api.markTopicViewed(topicId).catch(() => {});
    void api
      .getCourse(courseSlug)
      .then((res) => {
        const match = res.topics.find((t) => t.id === topicId);
        if (match?.completed) setCompleted(true);
      })
      .catch(() => {});
  }, [user, topicId, courseSlug]);

  async function toggleCompleted() {
    if (!user) {
      toast.info("Sign in to save your topic progress.");
      return;
    }
    setBusy(true);
    try {
      const next = !completed;
      await api.setTopicCompleted(topicId, next);
      setCompleted(next);
      toast.success(next ? "Topic marked completed!" : "Marked as in-progress");
    } catch {
      toast.error("Could not update progress.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3 rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-[var(--text-primary)]">
          Finished reading this topic?
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
          Lock it in with instant server-checked practice questions.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant={completed ? "secondary" : "subtle"}
          size="md"
          disabled={busy}
          onClick={toggleCompleted}
        >
          <CheckCircle2
            className={completed ? "h-4 w-4 text-[var(--success)]" : "h-4 w-4 text-[var(--text-muted)]"}
          />
          {completed ? "Completed" : "Mark complete"}
        </Button>

        {topicId && (
          <Link
            href={`/practice/${topicId}`}
            className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white"
          >
            Practice topic
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
