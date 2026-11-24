"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, PenTool, Timer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { CCMAS_OUTLINE, COURSES } from "@/lib/config";
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

  return (
    <div className="space-y-6">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All courses
      </Link>

      {/* Course Header */}
      <section className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="font-mono">
            {course.code}
          </Badge>
          <Badge variant="neutral" className="tabular">
            {completedCount}/{topics.length} topics completed
          </Badge>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{course.title}</h1>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--text-secondary)]">
          {course.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href={`/courses/${course.slug}/mock-exam`}
            className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)]"
          >
            <Timer className="h-4 w-4" />
            Start timed mock exam
          </Link>
        </div>
      </section>

      {/* Topics List */}
      <section>
        <h2 className="mb-3 text-lg font-extrabold tracking-tight">Study Topics</h2>
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="hover-lift flex flex-col justify-between gap-4 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5">
                {topic.completed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--border-strong)]" />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                      Topic {topic.display_order}
                    </span>
                    {topic.status === "draft" && (
                      <Badge variant="draft">Draft – under review</Badge>
                    )}
                    {topic.is_free && <Badge variant="success">Free</Badge>}
                  </div>
                  <h3 className="mt-1 text-base font-bold text-[var(--text-primary)]">
                    {topic.title}
                  </h3>
                  {topic.ccmas_ref && (
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                      CCMAS: {topic.ccmas_ref}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                <Link
                  href={`/courses/${course.slug}/${topic.slug}`}
                  className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read notes
                </Link>
                <Link
                  href={`/practice/${topic.id}`}
                  className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 text-xs font-semibold text-[var(--text-primary)]"
                >
                  <PenTool className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Practice ({topic.question_count ?? 5})
                  <ArrowRight className="h-3.5 w-3.5" />
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
            {outline.map((line) => (
              <li
                key={line}
                className="rounded-xl bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-secondary)]"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
