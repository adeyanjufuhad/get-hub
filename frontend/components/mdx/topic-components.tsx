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

  useEffect(() => {
    if (!zoomed) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomed]);

  return (
    <>
      {/* Concentric figure plate: Outer 20px (12+8) / sm: 24px (12+12) */}
      <figure className="my-6 overflow-hidden rounded-[20px] border border-[var(--border-strong)] bg-[var(--paper-plate-bg)] p-2 sm:my-7 sm:rounded-[24px] sm:p-3">
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] px-1 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            ▸ Textbook Figure Plate
          </span>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="pressable inline-flex min-h-[34px] items-center gap-1 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-1 font-mono text-[10px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            Enlarge
          </button>
        </div>

        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={caption ? `Enlarge figure: ${caption}` : "Enlarge textbook figure"}
          className="block w-full rounded-[12px] bg-white p-2 cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption || "Engineering textbook figure"}
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            className="mx-auto max-h-[260px] w-auto max-w-full object-contain sm:max-h-[340px]"
          />
        </button>

        {caption && (
          <figcaption className="mt-2.5 border-t border-dashed border-[var(--border-hairline)] px-1 pt-2 text-center font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
            {caption}
          </figcaption>
        )}
      </figure>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={caption || "Enlarged textbook figure"}
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-4"
        >
          {/* Centered modal entrance (scale 0.96 -> 1) + Concentric radius: Outer 24px (12+12) / sm: 28px (12+16) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-enter max-h-[90dvh] w-full max-w-3xl overflow-auto overscroll-contain rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 shadow-2xl sm:rounded-[28px] sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Textbook Figure Inspection
              </span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                aria-label="Close enlarged figure"
                className="pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="rounded-[12px] bg-white p-2 sm:p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={caption || "Engineering textbook figure"}
                width={960}
                height={600}
                decoding="async"
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
  source,
  figure,
  answer,
}: {
  title: string;
  problem: string;
  steps: string[];
  source?: string;
  figure?: string;
  answer?: string;
}) {
  const [shown, setShown] = useState(0);
  const done = shown >= steps.length;

  return (
    /* Concentric worked-example card: Outer 24px (12+12) / sm: 28px (12+16) -> inner blocks & buttons 12px */
    <div className="my-7 overflow-hidden rounded-[24px] border border-[var(--border-strong)] bg-[var(--paper-plate-bg)] sm:rounded-[28px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/75 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Worked Textbook Example
          </span>
          <p className="!mt-0.5 !mb-0 text-sm font-extrabold leading-snug text-[var(--text-primary)] sm:text-base">
            {title}
          </p>
          {source && (
            <p className="!mb-0 !mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">{source}</p>
          )}
        </div>
        <span className="tabular shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--accent)]">
          {shown} / {steps.length} steps
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="math-scroll-x rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-sm leading-relaxed text-[var(--text-primary)] sm:p-3.5">
          <MathText text={problem} />
        </div>

        {figure && <InlineFigure src={figure} alt={`Figure for ${title}`} />}

        {shown > 0 && (
          <ol className="!pl-0 !list-none !mb-0 mt-3.5 space-y-2.5">
            {steps.slice(0, shown).map((step, idx) => (
              <li
                key={idx}
                className="flex gap-2.5 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 p-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:gap-3 sm:p-3.5"
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

        {done && answer && (
          <div className="math-scroll-x mt-3 flex items-start gap-2 rounded-[12px] border border-[var(--success)]/30 bg-[var(--success)]/10 px-3 py-2.5 text-sm text-[var(--text-primary)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
            <span className="min-w-0">
              <span className="mr-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--success)]">
                Answer
              </span>
              <MathText text={answer} />
            </span>
          </div>
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
                <Eye className="h-4 w-4" aria-hidden="true" />
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
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Fold steps &amp; retry yourself
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mt-3 rounded-xl border border-[var(--border-hairline)] bg-white p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="mx-auto max-h-[300px] w-auto max-w-full object-contain" />
    </div>
  );
}

const RULE_LABELS = {
  definition: "Definition",
  theorem: "Theorem",
  "working-rule": "Working Rule",
  formula: "Formula Sheet",
  note: "Note",
} as const;

export function RuleBox({
  kind = "definition",
  title,
  children,
}: {
  kind?: keyof typeof RULE_LABELS;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-canvas)]/85 p-4 sm:p-5">
      <p className="!mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
        {RULE_LABELS[kind] ?? "Note"}
        {title ? ` · ${title}` : ""}
      </p>
      <div className="math-scroll-x text-sm leading-relaxed text-[var(--text-primary)] [&_p]:!mb-2 [&_ul]:!mb-0">
        {children}
      </div>
    </div>
  );
}

export function ExerciseSet({
  title,
  source,
  items,
}: {
  title: string;
  source?: string;
  items: Array<{ q: string; a: string; figure?: string }>;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const allOpen = open.size === items.length;
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    /* Concentric exercise container: Outer 24px = Inner 12px + Header Padding 12px (p-3) */
    <section className="my-8 overflow-hidden rounded-[24px] border border-[var(--border-strong)] bg-[var(--paper-plate-bg)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/75 p-3">
        <div className="min-w-0 px-1">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Textbook Exercise · {items.length} questions
          </span>
          <p className="!mb-0 !mt-0.5 text-sm font-extrabold text-[var(--text-primary)] sm:text-base">{title}</p>
          {source && <p className="!mb-0 !mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">{source}</p>}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setOpen(allOpen ? new Set() : new Set(items.map((_, i) => i)))}
        >
          {allOpen ? "Hide all answers" : "Show all answers"}
        </Button>
      </div>
      <ol className="!list-none !pl-0 !mb-0 divide-y divide-[var(--border-hairline)]">
        {items.map((item, i) => (
          <li key={i} className="px-4 py-3.5 sm:px-5">
            <div className="flex gap-3">
              <span className="tabular mt-0.5 w-6 shrink-0 font-mono text-xs font-bold text-[var(--text-muted)]">{i + 1}.</span>
              <div className="min-w-0 flex-1">
                <div className="math-scroll-x text-sm leading-relaxed text-[var(--text-primary)]">
                  <MathText text={item.q} />
                </div>
                {item.figure && <InlineFigure src={item.figure} alt={`Figure for exercise ${i + 1}`} />}
                {open.has(i) ? (
                  <div className="math-scroll-x mt-2 rounded-lg bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--text-primary)]">
                    <span className="mr-1.5 font-mono text-[10px] font-bold uppercase text-[var(--success)]">Ans.</span>
                    <MathText text={item.a} />
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="mt-1.5 inline-flex min-h-[32px] items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)] cursor-pointer"
                >
                  <Eye className="h-3 w-3" aria-hidden="true" />
                  {open.has(i) ? "Hide answer" : "Check answer"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
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
    /* Concentric action bar: Outer 24px (12+12) mobile / 28px (12+16) sm -> inner buttons 12px */
    <div className="mt-8 flex flex-col gap-4 rounded-[24px] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-[28px] sm:p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--accent-soft)] text-[var(--accent)]">
          <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
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
            aria-hidden="true"
            className={completed ? "h-4 w-4 text-[var(--success)]" : "h-4 w-4 text-[var(--text-muted)]"}
          />
          {completed ? "Folio completed" : "Mark folio read"}
        </Button>

        {topicId && (
          <Link
            href={`/practice/${topicId}`}
            className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] min-[420px]:w-auto"
          >
            Solve textbook drills
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
