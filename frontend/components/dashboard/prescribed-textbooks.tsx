"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { COURSES, PRACTICE_HIGHLIGHTS } from "@/lib/config";

export function DiagramPracticeShowcase() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const visibleDrills =
    selectedCourse === "all"
      ? PRACTICE_HIGHLIGHTS
      : PRACTICE_HIGHLIGHTS.filter((d) => d.courseSlug === selectedCourse);

  return (
    <section
      id="practice-diagrams"
      className="scroll-mt-24 rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--accent)]">
            Diagram practice
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Practice problems with engineering diagrams
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Solve calculation and conceptual questions paired with clear schematics and full step-by-step solutions.
          </p>
        </div>

        {/* Concentric course filter tray: Outer 16px = Inner 12px + Padding 4px (p-1) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="-mx-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-1 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-1">
              <button
                type="button"
                onClick={() => setSelectedCourse("all")}
                className={cn(
                  "pressable min-h-[38px] shrink-0 whitespace-nowrap rounded-[12px] px-3.5 text-xs font-medium cursor-pointer",
                  selectedCourse === "all"
                    ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                )}
              >
                All courses
              </button>
              {COURSES.filter((c) => PRACTICE_HIGHLIGHTS.some((d) => d.courseSlug === c.slug)).map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCourse(c.slug)}
                  className={cn(
                    "pressable min-h-[38px] shrink-0 whitespace-nowrap rounded-[12px] px-3.5 font-mono text-xs font-medium cursor-pointer",
                    selectedCourse === c.slug
                      ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/tests"
            className="inline-flex min-h-[38px] items-center text-xs font-medium text-[var(--accent)] hover:underline"
          >
            All practice tests →
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleDrills.map((drill) => (
          /* Concentric drill card: Outer 24px = Inner 12px + Padding 12px (p-3) */
          <article
            key={drill.id}
            className="flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
          >
            <div>
              {drill.figureImage && (
                <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-hairline)] bg-white p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={drill.figureImage}
                    alt={drill.title}
                    width={420}
                    height={260}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <Badge variant="accent" className="font-mono">
                  <span translate="no">{drill.courseCode}</span>
                </Badge>
                <Badge
                  variant={
                    drill.difficulty === "Easy"
                      ? "success"
                      : drill.difficulty === "Hard"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {drill.difficulty}
                </Badge>
              </div>

              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {drill.topicLabel}
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-snug text-[var(--text-primary)]">
                {drill.title}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                {drill.preview}
              </p>
            </div>

            <div className="mt-4 border-t border-[var(--border-hairline)] pt-3">
              <Link
                href={`/practice/${drill.topicId}`}
                className="pressable inline-flex min-h-[42px] w-full items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-4 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
              >
                Solve problem →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
