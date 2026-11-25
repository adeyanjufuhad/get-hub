"use client";

import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  Lightbulb,
  Maximize2,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

export function DiagramFigure({ src, caption }: { src: string; caption?: string }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <figure className="my-6 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--paper-plate-bg)] p-3 shadow-[0_6px_20px_rgba(20,20,19,0.06)] sm:my-7 sm:p-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            ▸ Textbook Figure Plate
          </span>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="pressable inline-flex min-h-[34px] items-center gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-1 font-mono text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Maximize2 className="h-3 w-3" />
            Enlarge
          </button>
        </div>

        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={caption ? `Enlarge figure: ${caption}` : "Enlarge textbook figure"}
          className="block w-full rounded-xl bg-white p-2 cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption || "Engineering textbook figure"}
            loading="lazy"
            decoding="async"
            className="mx-auto max-h-[260px] w-auto max-w-full object-contain sm:max-h-[340px]"
          />
        </button>

        {caption && (
          <figcaption className="mt-2.5 border-t border-dashed border-[var(--border-hairline)] pt-2 text-center text-xs leading-relaxed text-[var(--text-secondary)]">
            {caption}
          </figcaption>
        )}
      </figure>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2.5 backdrop-blur-xs sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-3xl overflow-auto rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 shadow-2xl sm:rounded-[24px] sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Textbook Figure Inspection
              </span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                aria-label="Close enlarged figure"
                className="pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-2xl bg-white p-2 sm:p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={caption || "Engineering textbook figure"}
                className="mx-auto max-h-[68dvh] w-auto max-w-full object-contain"
              />
            </div>
            {caption && (
              <p className="mt-3 text-center text-xs leading-relaxed text-[var(--text-secondary)]">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
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
    <div className="my-7 overflow-hidden rounded-[20px] border border-[var(--border-strong)] bg-[var(--paper-plate-bg)] shadow-[0_6px_20px_rgba(20,20,19,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/75 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Worked Textbook Example
          </span>
          <h3 className="!mt-0.5 !mb-0 text-sm font-extrabold leading-snug text-[var(--text-primary)] sm:text-base">
            {title}
          </h3>
        </div>
        <span className="tabular shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--accent)]">
          {shown} / {steps.length} steps
        </span>
      </div>

      <div className="p-3.5 sm:p-5">
        <div className="math-scroll-x rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-sm leading-relaxed text-[var(--text-primary)] sm:p-3.5">
          <MathText text={problem} />
        </div>

        {shown > 0 && (
          <ol className="!pl-0 !list-none !mb-0 mt-4 space-y-2.5">
            {steps.slice(0, shown).map((step, idx) => (
              <li
                key={idx}
                className="flex gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 p-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:gap-3 sm:p-3.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-mono text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <div className="math-scroll-x min-w-0 flex-1">
                  <MathText text={step} />
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {shown < steps.length ? (
            <>
              <Button
                type="button"
                variant="ink"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setShown((s) => Math.min(steps.length, s + 1))}
              >
                <Eye className="h-4 w-4" />
                {shown === 0 ? "Solve Step 1" : `Next step (${shown + 1} of ${steps.length})`}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setShown(steps.length)}
              >
                Reveal full solution
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => setShown(0)}
            >
              <RotateCcw className="h-4 w-4" />
              Fold steps &amp; retry yourself
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Callout({
  variant = "warning",
  title,
  children,
}: {
  variant?: "warning" | "info" | "tip";
  title: string;
  children: React.ReactNode;
}) {
  const isTip = variant === "tip" || variant === "info";

  return (
    <div
      className={cn(
        "my-7 rounded-2xl border border-l-4 p-4 leading-relaxed shadow-xs sm:p-5",
        isTip
          ? "border-[var(--accent-border)] border-l-[var(--accent)] bg-[var(--accent-soft)]/80"
          : "border-[var(--warning)]/30 border-l-[var(--warning)] bg-[var(--warning-soft)]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider",
          isTip ? "text-[var(--accent)]" : "text-[var(--warning)]"
        )}
      >
        {isTip ? (
          <Lightbulb className="h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}
        <span>{title}</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-[var(--text-primary)] [&_li]:!leading-relaxed [&_li]:!mb-1.5 [&_p]:!leading-relaxed [&_p]:!mb-2 [&_ul]:!mb-0">
        {children}
      </div>
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
      toast.info("Sign in to save your folio progress.");
      return;
    }
    setBusy(true);
    try {
      const next = !completed;
      await api.setTopicCompleted(topicId, next);
      setCompleted(next);
      toast.success(next ? "Study folio marked completed!" : "Marked as in-progress");
    } catch {
      toast.error("Could not update progress.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-[22px] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <BookOpenCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[var(--text-primary)]">
            Finished studying this notebook folio?
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Test yourself immediately on the textbook figure &amp; calculation drills for this chapter.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center sm:shrink-0">
        <Button
          type="button"
          variant={completed ? "secondary" : "subtle"}
          size="md"
          disabled={busy}
          onClick={toggleCompleted}
          className="w-full min-[420px]:w-auto"
        >
          <CheckCircle2
            className={completed ? "h-4 w-4 text-[var(--success)]" : "h-4 w-4 text-[var(--text-muted)]"}
          />
          {completed ? "Folio completed" : "Mark folio read"}
        </Button>

        {topicId && (
          <Link
            href={`/practice/${topicId}`}
            className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white min-[420px]:w-auto"
          >
            Solve textbook drills
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
