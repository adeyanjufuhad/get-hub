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
            OAU 200L First Semester · 19 study topics
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Course notes and study topics
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)] text-pretty">
            Each course includes structured study notes, clear engineering diagrams, worked examples, and graded practice questions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tests"
            className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-4 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90 sm:w-auto"
          >
            <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Open test center
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
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
            const fallbackTopics = COURSE_TOPICS_FALLBACK[course.slug] ?? [];

            return (
              /* Concentric course card: Outer 24px, footer p-3 (12px) -> buttons 12px (12+12=24) */
              <article
                key={course.slug}
                className="flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
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
                        className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-xs font-semibold text-white shadow-sm"
                      >
                        {course.code}
                      </span>
                      <span className="tabular rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-xs font-medium text-white backdrop-blur-xs">
                        {done}/{total} topics · {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h2 className="text-lg font-semibold leading-snug text-[var(--text-primary)]">
                      {course.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {course.description}
                    </p>

                    {/* Mini Topic Index */}
                    <ul className="mt-3.5 space-y-1">
                      {fallbackTopics.slice(0, 6).map((ft) => (
                        <li key={ft.id}>
                          <Link
                            href={`/courses/${course.slug}/${ft.slug}`}
                            className="pressable flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 text-xs hover:bg-[var(--bg-subtle)]"
                          >
                            <span className="truncate font-medium text-[var(--text-secondary)]">
                              <span className="tabular mr-1.5 font-mono text-xs font-medium text-[var(--accent)]">
                                {String(ft.display_order).padStart(2, "0")}
                              </span>
                              {ft.title}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                      {fallbackTopics.length > 6 && (
                        <li>
                          <Link
                            href={`/courses/${course.slug}`}
                            className="block rounded-[10px] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--bg-subtle)]"
                          >
                            +{fallbackTopics.length - 6} more topics
                          </Link>
                        </li>
                      )}
                    </ul>

                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
                    >
                      <div
                        className="h-full w-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-200 ease-[var(--ease-out)]"
                        style={{ transform: `scaleX(${pct / 100})` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Concentric card footer: p-3 (12px) + inner buttons 12px = 24px outer */}
                <div className="grid grid-cols-1 gap-2 border-t border-[var(--border-hairline)] p-3 min-[340px]:grid-cols-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
                  >
                    <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Open notes
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] border border-[var(--border-hairline)] px-3.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  >
                    <Timer className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                    Timed exam
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
