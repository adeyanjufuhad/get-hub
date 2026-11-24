"use client";

import { ArrowRight, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProgressArc } from "@/components/ui/progress-arc";
import { api } from "@/lib/api";
import { COURSES } from "@/lib/config";
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
            total_topics: 1,
            completed_topics: 0,
          }))
        );
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="accent">200L First Semester</Badge>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          GET Engineering Courses
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Pick a course to read step-by-step topic guides, practice questions, or launch a timed mock exam.
        </p>
      </div>

      {!loaded ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const total = course.total_topics ?? 0;
            const done = course.completed_topics ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <article
                key={course.slug}
                className="hover-lift flex flex-col justify-between rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="accent" className="font-mono">
                        {course.code}
                      </Badge>
                      <h2 className="mt-2.5 text-lg font-bold leading-snug text-[var(--text-primary)]">
                        {course.title}
                      </h2>
                    </div>
                    <ProgressArc percentage={pct} size={52} strokeWidth={5} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {course.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-4">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-sm font-semibold text-[var(--ink-cta-text)]"
                  >
                    View topics
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/courses/${course.slug}/mock-exam`}
                    className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--border-hairline)] px-3.5 text-xs font-semibold text-[var(--text-secondary)]"
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
