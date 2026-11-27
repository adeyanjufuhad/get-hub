"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StepItem {
  id: string;
  label: string;
  title: string;
  description: string;
  content: ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  completeCta?: ReactNode;
  className?: string;
}

/**
 * React Bits Stepper (adapted for GET Hub Warm Alabaster light surfaces,
 * mobile-first 44px tap targets, GPU-only transitions, and lucide-react icons).
 */
export function Stepper({ steps, completeCta, className }: StepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = steps[currentIndex];
  if (!current) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    /* Concentric stepper card: Outer 28px = Inner 12px + Padding 16px (p-4) */
    <div
      className={cn(
        "rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4",
        className
      )}
    >
      {/* Step Indicators + GPU-composited scaleX Connector Line */}
      <div className="flex items-center justify-between gap-2" role="tablist" aria-label="Study workflow steps">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCurrentIndex(idx)}
                className="pressable group flex min-h-[44px] items-center gap-2.5 rounded-[12px] pr-2 text-left cursor-pointer"
              >
                <span
                  className={cn(
                    "tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] font-mono text-xs font-bold transition-[background-color,color] duration-150 ease-[var(--ease-out)]",
                    isCompleted
                      ? "bg-[var(--accent)] text-white"
                      : isActive
                        ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)] ring-4 ring-[var(--accent-soft)]"
                        : "border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" aria-hidden="true" /> : `0${idx + 1}`}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-semibold sm:inline-block",
                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className="mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  <div
                    className="h-full origin-left bg-[var(--accent)] transition-transform duration-200 ease-[var(--ease-out)]"
                    style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Step Panel: rounded-[12px] matches Outer 28px - Padding 16px */}
      <div
        key={current.id}
        role="tabpanel"
        className="mt-4 grid gap-4 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 sm:p-4 md:grid-cols-12"
      >
        <div className="flex flex-col justify-center md:col-span-5">
          <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
            STEP 0{currentIndex + 1} OF 0{steps.length}
          </span>
          <h3 className="mt-1.5 text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            {current.title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
            {current.description}
          </p>
        </div>

        <div className="md:col-span-7">{current.content}</div>
      </div>

      {/* Footer Navigation: rounded-[12px] buttons match Outer 28px - Padding 16px */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="pressable inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 sm:px-4 sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        {/* Fixed-width step indicators — no width layout animation */}
        <div className="hidden items-center gap-1.5 min-[390px]:flex" aria-hidden="true">
          {steps.map((s, idx) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 w-4 rounded-full transition-colors duration-150",
                idx === currentIndex ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]/60"
              )}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))}
            className="pressable inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90 sm:px-5 sm:text-sm cursor-pointer"
          >
            Next step
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          completeCta ?? (
            <button
              type="button"
              onClick={() => setCurrentIndex(0)}
              className="pressable inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-[12px] bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] sm:px-5 sm:text-sm cursor-pointer"
            >
              Replay steps
            </button>
          )
        )}
      </div>
    </div>
  );
}
