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
    <div
      className={cn(
        "rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-[0_6px_22px_rgba(20,20,19,0.04)] sm:p-5",
        className
      )}
    >
      {/* Step Indicators + Animated Connector Line */}
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
                className="pressable group flex min-h-[44px] items-center gap-2.5 rounded-full pr-2 text-left cursor-pointer"
              >
                <span
                  className={cn(
                    "tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-[background-color,color,transform] duration-200 ease-[var(--ease-out)]",
                    isCompleted
                      ? "bg-[var(--accent)] text-white"
                      : isActive
                        ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)] ring-4 ring-[var(--accent-soft)]"
                        : "border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : `0${idx + 1}`}
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
                    className="h-full origin-left bg-[var(--accent)] transition-transform duration-300 ease-[var(--ease-out)]"
                    style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Step Panel */}
      <div
        key={current.id}
        role="tabpanel"
        className="mt-4 grid gap-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 sm:p-5 md:grid-cols-12"
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

      {/* Footer Navigation */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {steps.map((s, idx) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-200",
                idx === currentIndex ? "w-5 bg-[var(--accent)]" : "w-1.5 bg-[var(--border-strong)]"
              )}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))}
            className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)] cursor-pointer"
          >
            Next step
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          completeCta ?? (
            <button
              type="button"
              onClick={() => setCurrentIndex(0)}
              className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white cursor-pointer"
            >
              Replay steps
            </button>
          )
        )}
      </div>
    </div>
  );
}
