"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  COURSES,
  TEXTBOOK_DRILLS,
  TEXTBOOKS,
} from "@/lib/config";

export function PrescribedTextbooks() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleBooks =
    selectedCourse === "all"
      ? TEXTBOOKS
      : TEXTBOOKS.filter((b) => b.courseSlug === selectedCourse);

  const visibleDrills =
    selectedCourse === "all"
      ? TEXTBOOK_DRILLS
      : TEXTBOOK_DRILLS.filter((d) => d.courseSlug === selectedCourse);

  return (
    <div className="space-y-6">
      {/* Strictly Matched 3 Prescribed Textbooks (1 per GET course, zero clutter, zero SVG) */}
      <section
        id="textbooks"
        className="scroll-mt-24 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              1-to-1 Course Outline Match
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-[var(--text-primary)] text-balance">
              Your 3 Prescribed Course Textbooks
            </h2>
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)] text-pretty">
              Inspected directly against the OAU 200L CCMAS syllabus: one definitive textbook per course powering every lined note folio, diagram plate, and drill question.
            </p>
          </div>

          {/* Course filter pills */}
          <div className="-mx-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-1">
              <button
                type="button"
                onClick={() => setSelectedCourse("all")}
                className={cn(
                  "pressable min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold cursor-pointer",
                  selectedCourse === "all"
                    ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                All 3 Courses
              </button>
              {COURSES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCourse(c.slug)}
                  className={cn(
                    "pressable min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-3.5 font-mono text-xs font-semibold cursor-pointer",
                    selectedCourse === c.slug
                      ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {visibleBooks.map((book) => {
            const isOpen = expandedId === book.id;
            return (
              <article
                key={book.id}
                className="flex min-w-0 flex-col justify-between rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4"
              >
                <div>
                  <div className="flex items-start gap-3">
                    {/* Authentic raster PDF cover */}
                    <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] sm:w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverImage}
                        alt={`${book.title} cover`}
                        width={160}
                        height={214}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="accent" className="font-mono">
                          <span translate="no">{book.courseCode}</span>
                        </Badge>
                        <Badge variant="success">{book.role}</Badge>
                      </div>

                      <h3 className="mt-2 text-sm font-extrabold leading-snug text-[var(--text-primary)]">
                        {book.title}
                      </h3>
                      <p className="mt-1 text-[11px] font-medium text-[var(--text-muted)]">
                        {book.authors} · {book.edition}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {book.bestFor}
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : book.id)}
                    aria-expanded={isOpen}
                    className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent)] cursor-pointer"
                  >
                    <span>Syllabus chapters ({book.chapters.length})</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-block text-[11px] transition-transform duration-150",
                        isOpen && "rotate-180"
                      )}
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="mt-1.5 space-y-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 text-[11px] text-[var(--text-secondary)]">
                      {book.chapters.map((ch) => (
                        <li key={ch} className="leading-snug">
                          • {ch}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[var(--border-hairline)] pt-3.5 min-[340px]:grid-cols-2">
                  <Link
                    href={`/courses/${book.courseSlug}`}
                    className="pressable inline-flex min-h-[42px] items-center justify-center rounded-full bg-[var(--ink-cta)] px-3 text-xs font-semibold text-[var(--ink-cta-text)]"
                  >
                    Study Folios →
                  </Link>
                  <Link
                    href="/tests"
                    className="pressable inline-flex min-h-[42px] items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Practice Tests
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Strict Textbook Figures & Questions Showcase (Zero SVG — real cropped schematics) */}
      <section className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Direct Textbook Figures &amp; Problems
            </p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
              Exact Questions &amp; Schematics From Your Prescribed Books
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Cropped directly from Çengel, Hibbeler 14e, and James Stewart 7e with full step-by-step worked solutions.
            </p>
          </div>
          <Link
            href="/tests"
            className="mt-1 inline-flex min-h-[38px] items-center font-mono text-xs font-bold text-[var(--accent)] hover:underline sm:mt-0"
          >
            Open all 72 drills in Test Center →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDrills.map((drill) => (
            <article
              key={drill.id}
              className="hover-lift flex flex-col justify-between overflow-hidden rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4"
            >
              <div>
                {drill.figureImage && (
                  <div className="mb-3.5 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-white p-2.5">
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

                <p className="mt-2 font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                  {drill.textbookRef}
                </p>
                <h3 className="mt-1 text-sm font-extrabold leading-snug text-[var(--text-primary)]">
                  {drill.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {drill.preview}
                </p>
              </div>

              <div className="mt-4 border-t border-[var(--border-hairline)] pt-3">
                <Link
                  href={`/practice/${drill.topicId}`}
                  className="pressable inline-flex min-h-[40px] w-full items-center justify-center rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                >
                  Solve textbook problem →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
