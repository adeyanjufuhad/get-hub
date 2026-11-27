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
  TEXTBOOKS,
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
  const matchedBook = TEXTBOOKS.find((b) => b.courseSlug === course.slug);
  const fallbackMeta = COURSE_TOPICS_FALLBACK[course.slug] ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/courses"
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All coursebooks
      </Link>

      {/* Course Header */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-7">
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
              {completedCount}/{topics.length} study folios completed
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
            {course.description}
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            {topics[0] && (
              <Link
                href={`/courses/${course.slug}/${topics[0].slug}`}
                className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#EA580C] px-5 text-sm font-semibold text-white hover:bg-[#C2410C]"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Open Folio 01
              </Link>
            )}
            <Link
              href={`/courses/${course.slug}/mock-exam`}
              className="pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
            >
              <Timer className="h-4 w-4" aria-hidden="true" />
              Start timed mock exam
            </Link>
          </div>
        </div>
      </section>

      {/* Organized 2-Column Layout: Lined Study Folios + Matched Course Textbook */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left 8 cols: Study Folios */}
        <section className="space-y-3 lg:col-span-8">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Coursebook Notes
              </p>
              <h2 className="text-lg font-extrabold tracking-tight">Lined Study Folios &amp; Topic Drills</h2>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)] tabular">
              {topics.length} folios
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
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Part · {fb?.part}
                    </span>
                    <span aria-hidden="true" className="h-px flex-1 bg-[var(--border-hairline)]" />
                  </div>
                )}
                <article
                  className="hover-lift relative overflow-hidden rounded-[22px] border border-[var(--border-hairline)] bg-[var(--paper-bg)] p-4 pl-6 shadow-xs sm:p-5 sm:pl-7"
                >
                  {/* Subtle left notebook margin accent */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-2 border-r-2 border-double border-[var(--paper-margin-rule)] bg-[var(--bg-subtle)]/50"
                  />

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                      {topic.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--border-strong)]" />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[var(--accent)]">
                            Folio {String(topic.display_order).padStart(2, "0")}
                          </span>
                          {fb?.textbook_ref && (
                            <span className="rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)]">
                              {fb.textbook_ref}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1.5 text-base font-extrabold leading-snug text-[var(--text-primary)]">
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
                        className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        Read folio
                      </Link>
                      <Link
                        href={`/practice/${topic.id}`}
                        className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold text-[var(--text-primary)]"
                      >
                        <PenTool className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                        Drill ({topic.question_count ?? fb?.question_count ?? 7})
                        <ArrowRight className="hidden h-3.5 w-3.5 sm:inline" />
                      </Link>
                    </div>
                  </div>
                </article>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right 4 cols: Strictly Matched Prescribed Textbook + CCMAS Syllabus */}
        <aside className="space-y-4 lg:col-span-4">
          {matchedBook && (
            <section className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Outline-Matched Textbook
              </p>
              <div className="mt-3 flex items-start gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={matchedBook.coverImage}
                  alt={matchedBook.title}
                  width={128}
                  height={170}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-16 shrink-0 rounded-lg border border-[var(--border-hairline)] object-cover"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold leading-snug text-[var(--text-primary)]">
                    {matchedBook.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                    {matchedBook.authors} · {matchedBook.edition}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                {matchedBook.bestFor}
              </p>
              <ul className="mt-3 space-y-1.5 rounded-xl bg-[var(--bg-canvas)] p-3 text-[11px] text-[var(--text-secondary)]">
                {matchedBook.chapters.map((ch) => (
                  <li key={ch} className="leading-snug">
                    • {ch}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {outline.length > 0 && (
            <section className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                NUC CCMAS Syllabus Checklist
              </h2>
              <ul className="mt-3 space-y-2">
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
        </aside>
      </div>
    </div>
  );
}
