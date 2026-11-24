import { ArrowLeft, ArrowRight, CheckCircle2, FileWarning } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  Callout,
  DiagramFigure,
  StepRevealExample,
  TopicActionBar,
} from "@/components/mdx/topic-components";
import { Badge } from "@/components/ui/badge";
import { getCourseManifest, getTopicDocument, listAllTopicParams } from "@/lib/content";

export function generateStaticParams() {
  return listAllTopicParams();
}

export default async function TopicReaderPage({
  params,
}: {
  params: Promise<{ slug: string; topicSlug: string }>;
}) {
  const { slug, topicSlug } = await params;
  const doc = getTopicDocument(slug, topicSlug);

  if (!doc) {
    notFound();
  }

  const { frontmatter, content } = doc;
  const manifest = getCourseManifest(slug);
  const topicList = manifest?.topics ?? [];
  const currentIdx = topicList.findIndex((t) => t.slug === topicSlug);
  const prevTopic = currentIdx > 0 ? topicList[currentIdx - 1] : null;
  const nextTopic =
    currentIdx >= 0 && currentIdx + 1 < topicList.length ? topicList[currentIdx + 1] : null;

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={`/courses/${slug}`}
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {frontmatter.courseCode}
      </Link>

      {/* Draft Banner when frontmatter.status === "draft" */}
      {frontmatter.status === "draft" && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning-soft)] px-4 py-3 text-xs font-medium text-[var(--warning)]">
          <FileWarning className="h-4 w-4 shrink-0" />
          <span>
            <strong>Draft – under review:</strong> Original GET Hub study notes awaiting final curriculum verification.
          </span>
        </div>
      )}

      {/* Topic Header */}
      <header className="mt-5 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="font-mono">
            {frontmatter.courseCode}
          </Badge>
          {frontmatter.status === "draft" && <Badge variant="draft">Draft – under review</Badge>}
          {frontmatter.ccmasRef && (
            <Badge variant="neutral" className="font-mono">
              CCMAS: {frontmatter.ccmasRef}
            </Badge>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-3xl">
          {frontmatter.title}
        </h1>

        {frontmatter.outcomes.length > 0 && (
          <div className="mt-5 rounded-2xl bg-[var(--bg-canvas)] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Learning outcomes
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {frontmatter.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* MDX Body with KaTeX + SVG Diagrams + Interactive Step-Reveal Worked Examples */}
      <div className="prose-study mt-7 rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-8">
        <MDXRemote
          source={content}
          components={{
            DiagramFigure,
            StepRevealExample,
            Callout,
          }}
          options={{
            blockJS: false,
            blockDangerousJS: true,
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            },
          }}
        />
      </div>

      {/* Mark complete + Practice CTA */}
      <TopicActionBar topicId={frontmatter.topicId} courseSlug={slug} />

      {/* Previous / Next Topic Navigation */}
      {(prevTopic || nextTopic) && (
        <nav
          aria-label="Topic pagination"
          className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {prevTopic ? (
            <Link
              href={`/courses/${slug}/${prevTopic.slug}`}
              className="hover-lift flex min-h-[56px] flex-col justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                <ArrowLeft className="h-3 w-3" /> Previous topic
              </span>
              <span className="mt-0.5 truncate text-sm font-bold text-[var(--text-primary)]">
                {prevTopic.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextTopic && (
            <Link
              href={`/courses/${slug}/${nextTopic.slug}`}
              className="hover-lift flex min-h-[56px] flex-col justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 sm:items-end sm:text-right"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)]">
                Next topic <ArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-0.5 truncate text-sm font-bold text-[var(--text-primary)]">
                {nextTopic.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
