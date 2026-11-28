"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    const fallback = (): Course[] =>
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
      }));
    api
      .listCourses()
      // Guard against a malformed response as well as a failed request.
      .then((res) => setCourses(res?.courses?.length ? res.courses : fallback()))
      .catch(() => setCourses(fallback()))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Courses
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)] text-pretty">
            Study notes, diagrams and worked examples for each first-semester GET course.
          </p>
        </div>
        <Link
          href="/tests"
          className="text-sm font-medium text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
        >
          Go to the test center →
        </Link>
      </header>

      {!loaded ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const topics = COURSE_TOPICS_FALLBACK[course.slug] ?? [];
            // The API's total_topics can lag behind the authored topic list; count what we show.
            const total = Math.max(topics.length, course.total_topics ?? 0);
            const done = Math.min(course.completed_topics ?? 0, total);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const banner =
              COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";

            return (
              <article
                key={course.slug}
                className="group/course flex flex-col overflow-hidden rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              >
                <Link href={`/courses/${course.slug}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner}
                    alt=""
                    width={640}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/7.5] w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover/course:scale-[1.03] motion-reduce:transition-none"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <p translate="no" className="text-xs font-medium text-[var(--accent)]">
                    {course.code}
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold leading-snug text-[var(--text-primary)]">
                    <Link href={`/courses/${course.slug}`} className="hover:underline underline-offset-4">
                      {course.title}
                    </Link>
                  </h2>

                  <div className="mt-3 flex items-center gap-3">
                    <div
                      role="progressbar"
                      aria-label={`${course.code} topics read`}
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]"
                    >
                      <div
                        className="h-full w-full origin-left rounded-full bg-[var(--accent)]"
                        style={{ transform: `scaleX(${pct / 100})` }}
                      />
                    </div>
                    <span className="tabular shrink-0 text-xs text-[var(--text-muted)]">
                      {done} of {total} read
                    </span>
                  </div>

                  <ol className="mt-4 flex-1 space-y-0.5">
                    {topics.slice(0, 5).map((t) => (
                      <li key={t.id}>
                        <Link
                          href={`/courses/${course.slug}/${t.slug}`}
                          className="-mx-2 flex gap-2.5 rounded-[8px] px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        >
                          <span className="tabular w-4 shrink-0 text-right text-[var(--text-muted)]">
                            {t.display_order}
                          </span>
                          <span className="truncate">{t.title}</span>
                        </Link>
                      </li>
                    ))}
                    {topics.length > 5 && (
                      <li className="px-0 pt-1 text-xs text-[var(--text-muted)]">
                        and {topics.length - 5} more
                      </li>
                    )}
                  </ol>

                  <div className="mt-4 flex items-center gap-4 border-t border-[var(--border-hairline)] pt-4">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="pressable inline-flex min-h-[40px] flex-1 items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-4 text-sm font-medium text-[var(--ink-cta-text)] hover:opacity-90"
                    >
                      Open notes
                    </Link>
                    <Link
                      href={`/courses/${course.slug}/mock-exam`}
                      className="text-sm text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
                    >
                      Timed exam
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
