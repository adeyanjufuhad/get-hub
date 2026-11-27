"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  PenTool,
  Timer,
} from "lucide-react";
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
              status: "published",
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
    return <div className="h-64 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />;
  }

  if (!course) {
    return (
      <div className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
        <h1 className="text-xl font-semibold">Course not found</h1>
        <Link href="/courses" className="mt-3 inline-block text-sm font-medium text-[var(--accent)]">
          Back to courses
        </Link>
      </div>
    );
  }

  const completedCount = topics.filter((t) => t.completed).length;
  const outline = CCMAS_OUTLINE[course.slug] ?? [];
  const banner = COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";
  const fallbackMeta = COURSE_TOPICS_FALLBACK[course.slug] ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/courses"
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All courses
      </Link>

      {/* Concentric Course Header: Outer 28px = 12 + 16 (p-4); sm: Outer 32px = 12 + 20 (p-5) */}
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner}
          alt=""
          aria-hidden="true"
          width={640}
          height={360}
          decoding="async"
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-15 sm:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)]/80 to-transparent sm:block"
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="font-mono">
              <span translate="no">{course.code}</span>
            </Badge>
            <Badge variant="neutral" className="tabular">
              {completedCount}/{topics.length} topics completed
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
            {course.description}
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {topics[0] && (
              <Link
                href={`/courses/${course.slug}/${topics[0].slug}`}
                className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#EA580C] px-5 text-sm font-medium text-white hover:bg-[#C2410C]"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Open topic 01
              </Link>
            )}
            <Link
              href={`/courses/${course.slug}/mock-exam`}
              className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[var(--ink-cta)] px-5 text-sm font-medium text-[var(--ink-cta-text)] hover:opacity-90"
            >
              <Timer className="h-4 w-4" aria-hidden="true" />
              Start timed mock exam
            </Link>
          </div>
        </div>
      </section>

      {/* 2-Column Layout: Study Topics + Course Outline */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left 8 cols: Study Topics */}
        <section className="space-y-3 lg:col-span-8">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[var(--accent)]">
                Study notes
              </p>
              <h2 className="text-lg font-semibold tracking-tight">Topics and practice drills</h2>
            </div>
            <span className="tabular font-mono text-xs text-[var(--text-muted)]">
              {topics.length} topics
            </span>
          </div>

          <div className="space-y-3.5">
            {topics.map((topic, idx) => {
              const fb = fallbackMeta.find((f) => f.slug === topic.slug);
              const prevPart =
                idx > 0 ? fallbackMeta.find((f) => f.slug === topics[idx - 1]?.slug)?.part : undefined;
              const showPartHeader = Boolean(fb?.part) && fb?.part !== prevPart;
              return (
                <div key={topic.id} className="space-y-3.5">
                  {showPartHeader && (
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {fb?.part}
                      </span>
                      <span aria-hidden="true" className="h-px flex-1 bg-[var(--border-hairline)]" />
                    </div>
                  )}
                  {/* Concentric topic card: Outer 24px = 12 + 12 (p-3); sm: Outer 28px = 12 + 16 (p-4) */}
                  <article className="relative overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--paper-bg)] p-3 pl-5 sm:rounded-[28px] sm:p-4 sm:pl-6">
                    {/* Subtle left notebook margin accent */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-2 border-r-2 border-double border-[var(--paper-margin-rule)] bg-[var(--bg-subtle)]/50"
                    />

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 items-start gap-3">
                        {topic.completed ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden="true" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--border-strong)]" aria-hidden="true" />
                        )}
                        <div className="min-w-0">
                          <span className="tabular font-mono text-xs font-medium text-[var(--accent)]">
                            Topic {String(topic.display_order).padStart(2, "0")}
                          </span>
                          <h3 className="mt-1 text-base font-semibold leading-snug text-[var(--text-primary)]">
                            {topic.title}
                          </h3>
                          {topic.ccmas_ref && (
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {topic.ccmas_ref}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex sm:shrink-0 sm:items-center">
                        <Link
                          href={`/courses/${course.slug}/${topic.slug}`}
                          className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-4 text-xs font-medium text-[var(--ink-cta-text)] hover:opacity-90"
                        >
                          <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                          Read notes
                        </Link>
                        <Link
                          href={`/practice/${topic.id}`}
                          className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                        >
                          <PenTool className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                          Practice ({topic.question_count ?? fb?.question_count ?? 16})
                          <ArrowRight className="hidden h-3.5 w-3.5 sm:inline" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right 4 cols: Course Outline */}
        <aside className="space-y-4 lg:col-span-4">
          {outline.length > 0 && (
            <section className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Course outline
              </h2>
              <ul className="mt-3 space-y-2">
                {outline.map((line, i) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 rounded-xl bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                  >
                    <span className="tabular font-mono text-xs font-medium text-[var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
