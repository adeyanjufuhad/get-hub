"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, PenTool, Timer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  CCMAS_OUTLINE,
  COURSE_BANNER_IMAGES,
  COURSE_TOPICS_FALLBACK,
  COURSES,
} from "@/lib/config";
import type { Course, Topic } from "@/lib/types";

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api
      .getCourse(slug)
      .then((res) => {
        setCourse(res.course);
        setTopics(res.topics);
      })
      .catch(() => {
        const fallback = COURSES.find((c) => c.slug === slug);
        if (fallback) {
          setCourse({
            id: fallback.slug,
            code: fallback.code,
            slug: fallback.slug,
            title: fallback.title,
            description: fallback.description,
            display_order: fallback.order,
            is_active: true,
          });
          const fallbackTopics = COURSE_TOPICS_FALLBACK[slug] ?? [];
          setTopics(
            fallbackTopics.map((t) => ({
              id: t.id,
              course_id: fallback.slug,
              slug: t.slug,
              title: t.title,
              display_order: t.display_order,
              ccmas_ref: t.ccmas_ref,
              outcomes: [],
              status: "draft",
              is_free: true,
              completed: false,
              question_count: t.question_count,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-[22px] bg-[var(--bg-surface)]" />;
  }

  if (!course) {
    return (
      <div className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
        <h1 className="text-xl font-bold">Course not found</h1>
        <Link href="/courses" className="mt-3 inline-block text-sm font-semibold text-[var(--accent)]">
          Back to courses
        </Link>
      </div>
    );
  }

  const completedCount = topics.filter((t) => t.completed).length;
  const outline = CCMAS_OUTLINE[course.slug] ?? [];
  const banner = COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";

  return (
    <div className="space-y-6">
      <Link
        href="/courses"
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All courses
      </Link>

      {/* Course Header with subtle engineering photo backdrop */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-7">
        <img
          src={banner}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-15 sm:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)]/80 to-transparent sm:block"
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="font-mono">
              {course.code}
            </Badge>
            <Badge variant="neutral" className="tabular">
              {completedCount}/{topics.length} topics completed
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{course.title}</h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--text-secondary)]">
            {course.description}
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Link
              href={`/courses/${course.slug}/mock-exam`}
              className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)]"
            >
              <Timer className="h-4 w-4" />
              Start timed mock exam
            </Link>
            <Link
              href="/library"
              className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-5 text-sm font-semibold text-[var(--text-primary)]"
            >
              Open Part 2 notes library
            </Link>
          </div>
        </div>
      </section>

      {/* Topics List */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold tracking-tight">Study Topics</h2>
          <span className="font-mono text-xs text-[var(--text-muted)] tabular">
            {topics.length} guides available
          </span>
        </div>
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="hover-lift flex flex-col justify-between gap-4 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                {topic.completed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--border-strong)]" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                      Topic {topic.display_order}
                    </span>
                    {topic.status === "draft" && (
                      <Badge variant="draft">Draft – under review</Badge>
                    )}
                    {topic.is_free && <Badge variant="success">Free</Badge>}
                  </div>
                  <h3 className="mt-1 text-base font-bold leading-snug text-[var(--text-primary)]">
                    {topic.title}
                  </h3>
                  {topic.ccmas_ref && (
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                      CCMAS: {topic.ccmas_ref}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
                <Link
                  href={`/courses/${course.slug}/${topic.slug}`}
                  className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read notes
                </Link>
                <Link
                  href={`/practice/${topic.id}`}
                  className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-xs font-semibold text-[var(--text-primary)]"
                >
                  <PenTool className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Practice ({topic.question_count ?? 5})
                  <ArrowRight className="hidden h-3.5 w-3.5 sm:inline" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full CCMAS Syllabus Map */}
      {outline.length > 0 && (
        <section className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Full NUC CCMAS 2023 Roadmap for {course.code}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {outline.map((line, i) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-xl bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-secondary)]"
              >
                <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                  0{i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
