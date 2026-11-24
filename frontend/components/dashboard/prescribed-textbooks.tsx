"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  COURSES,
  TEXTBOOK_DRILLS,
  TEXTBOOKS,
  type TextbookConfig,
} from "@/lib/config";

function buildLibraryLookupUrl(book: TextbookConfig): string {
  if (book.readUrl.trim()) return book.readUrl.trim();
  const q = encodeURIComponent(`${book.title} ${book.authors}`);
  return `https://openlibrary.org/search?q=${q}`;
}

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
      {/* Prescribed Textbooks with real book covers */}
      <section
        id="textbooks"
        className="scroll-mt-20 rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
              Raw Reference Library
            </p>
            <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Prescribed OAU 200L Textbooks
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Curated from OAU Part 2 engineering texts for full derivations, tables, and extra exercises.
            </p>
          </div>

          {/* Course filter pills (horizontally scrollable on narrow phones) */}
          <div className="-mx-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCourse("all")}
                className={cn(
                  "pressable min-h-[44px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold cursor-pointer",
                  selectedCourse === "all"
                    ? "border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                    : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                )}
              >
                All ({TEXTBOOKS.length})
              </button>
              {COURSES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCourse(c.slug)}
                  className={cn(
                    "pressable min-h-[44px] shrink-0 whitespace-nowrap rounded-full border px-3.5 font-mono text-xs font-semibold cursor-pointer",
                    selectedCourse === c.slug
                      ? "border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]"
                  )}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBooks.map((book) => {
            const isOpen = expandedId === book.id;
            const hasDirectPdf = Boolean(book.readUrl.trim());
            return (
              <article
                key={book.id}
                className="flex min-w-0 flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 sm:p-4"
              >
                <div>
                  <div className="flex items-start gap-3">
                    {/* Real raster book cover */}
                    <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] shadow-sm sm:w-20">
                      <img
                        src={book.coverImage}
                        alt={`${book.title} textbook cover`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="accent" className="font-mono">
                          {book.courseCode}
                        </Badge>
                        <Badge variant={book.role === "Primary Pick" ? "success" : "neutral"}>
                          {book.role}
                        </Badge>
                      </div>

                      <h3 className="mt-2 text-sm font-bold leading-snug text-[var(--text-primary)]">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                        {book.authors} · {book.edition}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {book.bestFor}
                  </p>

                  {/* Collapsible Chapter Guide */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : book.id)}
                    aria-expanded={isOpen}
                    className="mt-1.5 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--accent)] cursor-pointer"
                  >
                    <span>Key chapters ({book.chapters.length})</span>
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
                    <ul className="mt-1.5 space-y-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-2.5 text-[11px] text-[var(--text-secondary)]">
                      {book.chapters.map((ch) => (
                        <li key={ch} className="leading-snug">
                          • {ch}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-3.5 border-t border-[var(--border-hairline)] pt-3">
                  <a
                    href={buildLibraryLookupUrl(book)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "pressable inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-semibold",
                      hasDirectPdf
                        ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                        : "border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    )}
                  >
                    {hasDirectPdf ? "Open textbook PDF ↗" : "Find edition / Open Library ↗"}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Textbook-Inspired Practice Drills */}
      <section className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
              Textbook-Style Drills
            </p>
            <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Practice Questions Modeled on Your Textbooks
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Original exam-style problems written from Beer &amp; Johnston, Hibbeler, James Stewart, Schaum&apos;s, and Çengel chapters — fresh numbers with step-by-step worked solutions.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-[var(--text-muted)] tabular">
            {visibleDrills.length} drills ready
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visibleDrills.map((drill) => (
            <div
              key={drill.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="accent" className="font-mono">
                      {drill.courseCode}
                    </Badge>
                    <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                      {drill.textbookRef}
                    </span>
                  </div>
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

                <h3 className="mt-2 text-sm font-bold leading-snug text-[var(--text-primary)]">
                  {drill.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {drill.preview}
                </p>
              </div>

              <div className="mt-3.5 border-t border-[var(--border-hairline)] pt-3">
                <Link
                  href={`/practice/${drill.topicId}`}
                  className="pressable inline-flex min-h-[40px] items-center justify-center rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                >
                  Solve in practice runner →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
