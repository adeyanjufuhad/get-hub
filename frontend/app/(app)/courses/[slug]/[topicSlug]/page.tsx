import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  Callout,
  DiagramFigure,
  ExerciseSet,
  RuleBox,
  StepRevealExample,
  TopicActionBar,
} from "@/components/mdx/topic-components";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { TEXTBOOKS } from "@/lib/config";
import {
  getCourseManifest,
  getTopicDocument,
  headingId,
  listAllTopicParams,
  listTopicHeadings,
} from "@/lib/content";

function headingText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(headingText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as React.ReactElement<{ className?: string; children?: React.ReactNode }>).props;
    if (props.className?.includes("katex")) return "";
    return headingText(props.children);
  }
  return "";
}

function H2({ children }: { children?: React.ReactNode }) {
  return <h2 id={headingId(headingText(children))}>{children}</h2>;
}

function H3({ children }: { children?: React.ReactNode }) {
  return <h3 id={headingId(headingText(children))}>{children}</h3>;
}

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

  const matchedBook = TEXTBOOKS.find((b) => b.courseSlug === slug);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(5, Math.round(wordCount / 145));
  const folioNumber = String(frontmatter.order).padStart(2, "0");
  const headings = listTopicHeadings(content);
  const totalFolios = String(Math.max(1, topicList.length)).padStart(2, "0");

  return (
    <article className="mx-auto max-w-4xl">
      {/* Top Breadcrumb + Chapter Tab Switcher (Book-style physical folio tabs) */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/courses/${slug}`}
          className="-ml-1 inline-flex min-h-[40px] min-w-0 items-center gap-1.5 px-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            <span translate="no">{frontmatter.courseCode}</span> · {manifest?.title ?? "Course"}
          </span>
        </Link>

        {/* Concentric quick-action tray: Outer 16px = Inner 12px + Padding 4px (p-1) */}
        <div className="grid grid-cols-2 gap-1 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1 sm:inline-flex sm:items-center">
          <Link
            href={`/practice/${frontmatter.topicId}`}
            className="pressable inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[12px] px-3.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
            Topic Drill
          </Link>
          <Link
            href={`/courses/${slug}/mock-exam`}
            className="pressable inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
          >
            Timed Test
          </Link>
        </div>
      </div>

      {/* Chapter Index Tabs along top edge of the notebook */}
      {topicList.length > 1 && (
        <nav
          aria-label="Course study folios"
          className="mt-3 -mx-4 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:pb-1 [&::-webkit-scrollbar]:hidden"
        >
          <div className="inline-flex min-w-full gap-1.5 sm:min-w-0">
            {topicList.map((t, i) => {
              const isCurrent = t.slug === topicSlug;
              return (
                <Link
                  key={t.slug}
                  href={`/courses/${slug}/${t.slug}`}
                  className={cn(
                    "pressable inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold sm:min-h-[40px] sm:rounded-b-none sm:rounded-t-2xl sm:border-b-0 sm:px-3.5",
                    isCurrent
                      ? "border-[var(--border-strong)] bg-[var(--paper-bg)] text-[var(--text-primary)] shadow-xs"
                      : "border-transparent bg-[var(--bg-subtle)]/75 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold",
                      isCurrent ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-[155px] truncate sm:max-w-[185px]">{t.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ==================== PHYSICAL LINED BOOK / NOTEBOOK SHEET ==================== */}
      <div className="notebook-sheet overflow-hidden rounded-[20px] sm:rounded-[24px] sm:rounded-tl-none">
        {/* Unlined Top Folio Header Band (mirrors real engineering notebook header + stamp box) */}
        <header className="border-b-2 border-[var(--border-hairline)] bg-[var(--paper-bg)] px-4 pb-5 pt-4 sm:px-10 sm:pb-6 sm:pt-7">
          <div className="flex flex-col justify-between gap-2.5 border-b border-dashed border-[var(--border-hairline)] pb-3.5 sm:flex-row sm:items-center sm:gap-3 sm:pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="font-mono">
                {frontmatter.courseCode} · FOLIO {folioNumber}/{totalFolios}
              </Badge>
              <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                OAU 200L CCMAS · ~{readMins} min study
              </span>
            </div>

            {/* Classic Notebook Top-Right Source Stamp Box */}
            <div className="inline-flex max-w-full items-center gap-2 self-start rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)]/70 px-3 py-1.5 sm:self-auto">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
              <span className="min-w-0 break-words font-mono text-[11px] font-semibold text-[var(--text-primary)]">
                {frontmatter.textbookRef ?? matchedBook?.title ?? "Prescribed Textbook"}
              </span>
            </div>
          </div>

          <h1 className="mt-3.5 text-xl font-extrabold leading-snug tracking-[-0.025em] text-[var(--text-primary)] text-balance sm:mt-4 sm:text-[30px] sm:leading-[1.2]">
            {frontmatter.title}
          </h1>

          {frontmatter.ccmasRef && (
            <p className="mt-1.5 font-mono text-xs text-[var(--text-muted)]">
              Syllabus scope: {frontmatter.ccmasRef}
            </p>
          )}

          {/* Learning Outcomes Pinned Summary Card */}
          {frontmatter.outcomes.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/80 p-4">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                What you must be able to solve after this folio
              </p>
              <ul className="mt-2.5 grid gap-2 sm:grid-cols-1">
                {frontmatter.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Ruled Paper Body with Binder Holes + Double Tangerine Margin Rule */}
        <div className="notebook-ruled-surface relative flex">
          {/* Left Binder Gutter (Desktop/Tablet) */}
          <div
            aria-hidden="true"
            className="hidden w-12 shrink-0 flex-col items-center justify-around border-r border-transparent py-12 sm:flex"
          >
            {[1, 2, 3, 4, 5, 6].map((hole) => (
              <span
                key={hole}
                className="h-3.5 w-3.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-canvas)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]"
              />
            ))}
          </div>

          {/* Main Ruled Reading Column to the right of the vertical margin rule */}
          <div className="notebook-margin-line min-w-0 flex-1 px-4 py-5 sm:px-9 sm:py-9">
            {headings.filter((h) => h.level === 3).length >= 4 && (
              <details className="mb-6 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/80 p-3.5 sm:p-4">
                <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  In this folio · {headings.filter((h) => h.level === 3).length} sections
                </summary>
                <ol className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 2 ? "sm:col-span-2 mt-1.5 font-bold" : "pl-2"}>
                      <a
                        href={`#${h.id}`}
                        className="inline-flex min-h-[28px] items-center text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            <div className="prose-study notebook-prose">
              <MDXRemote
                source={content}
                components={{
                  DiagramFigure,
                  StepRevealExample,
                  Callout,
                  RuleBox,
                  ExerciseSet,
                  h2: H2,
                  h3: H3,
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
          </div>
        </div>

        {/* Bottom Book Folio Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-hairline)] bg-[var(--paper-bg)] px-4 py-3 font-mono text-[10px] text-[var(--text-muted)] sm:px-10 sm:text-[11px]">
          <span>
            {frontmatter.courseCode} · Study Folio {folioNumber} of {totalFolios}
          </span>
          <span>
            {matchedBook ? `${matchedBook.authors.split("&")[0]?.trim()} — ${matchedBook.edition}` : "OAU Faculty of Technology"}
          </span>
        </footer>
      </div>

      {/* Mark complete + Practice CTA */}
      <TopicActionBar topicId={frontmatter.topicId} courseSlug={slug} />

      {/* Previous / Next Folio Turners */}
      {(prevTopic || nextTopic) && (
        <nav
          aria-label="Topic pagination"
          className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {prevTopic ? (
            <Link
              href={`/courses/${slug}/${prevTopic.slug}`}
              className="pressable hover-lift flex min-h-[60px] flex-col justify-center rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Previous folio
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
              className="pressable hover-lift flex min-h-[60px] flex-col justify-center rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 sm:items-end sm:text-right"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)]">
                Turn to next folio <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
