"use client";

import { ArrowRight, BookOpen, ClipboardCheck, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  COURSE_BANNER_IMAGES,
  COURSE_TOPICS_FALLBACK,
  COURSES,
  TEXTBOOKS,
} from "@/lib/config";
import type { Course } from "@/lib/types";

export default function CoursesIndexPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listCourses()
      .then((res) => setCourses(res.courses))
      .catch(() => {
        setCourses(
          COURSES.map((c) => ({
            id: c.slug,
            code: c.code,
            slug: c.slug,
            title: c.title,
            description: c.description,
            display_order: c.order,
            is_active: true,
            total_topics: COURSE_TOPICS_FALLBACK[c.slug]?.length ?? 3,
            completed_topics: 0,
          }))
        );
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="accent" className="font-mono">
            OAU 200L First Semester · 9 Lined Study Folios
          </Badge>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            Course Notes &amp; Study Folios
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)] text-pretty">
            Every course is paired with the exact textbook matching its CCMAS syllabus, lined notebook study pages, real cropped textbook figures, and 72 step-by-step practice questions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap">
          <Link
            href="/tests"
            className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
          >
            <ClipboardCheck className="h-3.5 w-3.5 shrink-0" />
            Open Test Center
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const total = course.total_topics ?? 3;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const banner =
              COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";
            const matchedBook = TEXTBOOKS.find((b) => b.courseSlug === course.slug);
            const fallbackTopics = COURSE_TOPICS_FALLBACK[course.slug] ?? [];

            return (
              <article
                key={course.slug}
                className="hover-lift flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141413]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner}
                      alt={`${course.code} ${course.title}`}
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                    />
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span
                        translate="no"
                        className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white shadow-sm"
                      >
                        {course.code}
                      </span>
                      <span className="tabular rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-xs">
                        {done}/{total} folios · {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h2 className="text-lg font-extrabold leading-snug text-[var(--text-primary)]">
                      {course.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {course.description}
                    </p>

                    {matchedBook && (
                      <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={matchedBook.coverImage}
                          alt={matchedBook.title}
                          width={64}
                          height={88}
                          loading="lazy"
                          decoding="async"
                          className="h-11 w-8 shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                            Matched Textbook
                          </span>
                          <p className="truncate text-xs font-bold text-[var(--text-primary)]">
                            {matchedBook.title}
                          </p>
                          <p className="truncate text-[11px] text-[var(--text-muted)]">
                            {matchedBook.authors}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mini Folio Index */}
                    <ul className="mt-3.5 space-y-1.5">
                      {fallbackTopics.map((ft) => (
                        <li key={ft.id}>
                          <Link
                            href={`/courses/${course.slug}/${ft.slug}`}
                            className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors hover:bg-[var(--bg-subtle)]"
                          >
                            <span className="truncate font-medium text-[var(--text-secondary)]">
                              <span className="mr-1.5 font-mono text-[11px] font-bold text-[var(--accent)]">
                                0{ft.display_order}
                              </span>
                              {ft.title}
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 border-t border-[var(--border-hairline)] p-4 min-[340px]:grid-cols-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)]"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    Open folios
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] px-3.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <Timer className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                    Timed test
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
