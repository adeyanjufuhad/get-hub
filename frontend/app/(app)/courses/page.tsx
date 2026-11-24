"use client";

import { ArrowRight, Timer } from "lucide-react";
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
        // Fallback to static config if API is offline so catalogue stays browsable
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
          <Badge variant="accent">200L First Semester · 9 Study Guides</Badge>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            GET Engineering Courses
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">
            Pick a course to read step-by-step topic guides, solve 54 original practice drills, or launch a timed mock exam.
          </p>
        </div>
        <Link
          href="/library"
          className="pressable inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 text-xs font-semibold text-[var(--text-primary)] sm:w-auto"
        >
          Browse Notes Library
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!loaded ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const total = course.total_topics ?? 0;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const banner =
              COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";

            return (
              <article
                key={course.slug}
                className="hover-lift flex flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141413]">
                    <img
                      src={banner}
                      alt={`${course.code} ${course.title}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                    />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white shadow-sm">
                        {course.code}
                      </span>
                      <span className="tabular rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-xs">
                        {done}/{total} topics · {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h2 className="text-lg font-bold leading-snug text-[var(--text-primary)]">
                      {course.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {course.description}
                    </p>

                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-canvas)]"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-hairline)] p-4 sm:flex sm:items-center sm:justify-between">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)] sm:text-sm"
                  >
                    Open topics
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] px-3.5 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    <Timer className="h-4 w-4" />
                    Mock exam
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
