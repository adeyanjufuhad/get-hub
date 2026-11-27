"use client";

import { ArrowRight, CheckCircle2, ChevronDown, Clock, Eye, Flame, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedList, type AnimatedListEntry } from "@/components/reactbits/animated-list";
import { Stepper, type StepItem } from "@/components/reactbits/stepper";
import { Badge } from "@/components/ui/badge";
import { MathText } from "@/components/ui/math-text";
import { cn } from "@/lib/cn";
import { CCMAS_OUTLINE, COURSES } from "@/lib/config";

const DEMO_STEPS = [
  "Take moments about pin $A$ (+ anticlockwise) so $R_A$ drops out: $\\sum M_A = 0 \\implies R_B(6.0) - 120(2.0) = 0$.",
  "Solve for the roller reaction at $B$: $R_B = \\frac{240}{6.0} = 40\\,\\text{N}$.",
  "Apply vertical equilibrium $\\sum F_y = 0$: $R_A + 40 - 120 = 0 \\implies R_A = 80\\,\\text{N}$.",
];

/**
 * Clean 2-level app-frame showcase (tasteskill cards.md: "Two levels, never three",
 * zero blurred shadow at rest, live product UI + authentic textbook schematics).
 */
export function HeroProductPreview() {
  const [activeTab, setActiveTab] = useState<"example" | "diagram" | "quiz">("example");
  const [revealed, setRevealed] = useState(1);

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] sm:mt-10 sm:rounded-[24px]">
      {/* App-Frame Window Chrome */}
      <div className="flex flex-col gap-2.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/65 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
          <span className="ml-1 font-mono text-xs font-medium text-[var(--text-muted)]">
            Live study workspace · Tap a course tab
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Course workspace preview"
          className="grid w-full grid-cols-3 gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-1 sm:inline-flex sm:w-auto"
        >
          {[
            { id: "example", shortLabel: "GET 207", label: "GET 207 · Folio" },
            { id: "diagram", shortLabel: "GET 205", label: "GET 205 · Plate" },
            { id: "quiz", shortLabel: "GET 209", label: "GET 209 · CBT" },
          ].map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id as "example" | "diagram" | "quiz")}
                className={cn(
                  "pressable min-h-[38px] rounded-full px-2.5 text-xs font-semibold transition-colors cursor-pointer sm:px-3.5",
                  selected
                    ? "bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <span translate="no" className="sm:hidden">
                  {tab.shortLabel}
                </span>
                <span translate="no" className="hidden sm:inline">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* App-Frame Body (Maximum 2 levels of nesting: frame > direct panel) */}
      <div className="p-3.5 text-left sm:p-5">
        {activeTab === "example" && (
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--paper-bg)] p-4 md:col-span-2">
              <Badge variant="accent" className="mb-2 font-mono">
                <span translate="no">GET 207</span> · Applied Mechanics
              </Badge>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Simply Supported Beam Equilibrium
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                Span <span className="tabular font-semibold">6.0&nbsp;m</span>, downward load{" "}
                <span className="tabular font-semibold">120&nbsp;N</span> at{" "}
                <span className="tabular font-semibold">2.0&nbsp;m</span> from pin A. Find{" "}
                <MathText text="$R_A$ and $R_B$" />.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/diagrams/get-207/beam-fbd.svg"
                alt="Free-body diagram of simply supported beam AB with 120 N load"
                width={420}
                height={220}
                decoding="async"
                className="mt-3 h-auto w-full rounded-xl border border-[var(--border-hairline)] bg-white"
              />
            </div>

            <div className="notebook-ruled-surface flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] p-4 md:col-span-3">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Study Note · Worked Steps
                  </span>
                  <span className="tabular font-mono text-xs font-bold text-[var(--accent)]">
                    {revealed}/{DEMO_STEPS.length} shown
                  </span>
                </div>
                <ol className="mt-3 divide-y divide-[var(--border-hairline)]">
                  {DEMO_STEPS.slice(0, revealed).map((step, idx) => (
                    <li
                      key={idx}
                      className="math-scroll-x py-2.5 text-sm leading-relaxed text-[var(--text-secondary)] first:pt-0"
                    >
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-soft)] font-mono text-xs font-bold text-[var(--accent)]">
                        {idx + 1}
                      </span>
                      <MathText text={step} />
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 flex flex-col items-stretch justify-between gap-2 border-t border-[var(--border-hairline)] pt-3 sm:flex-row sm:items-center">
                {revealed < DEMO_STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => Math.min(DEMO_STEPS.length, r + 1))}
                    className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--ink-cta)] px-4 text-sm font-semibold text-[var(--ink-cta-text)] hover:opacity-90 sm:w-auto cursor-pointer"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Reveal Step {revealed + 1}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed(1)}
                    className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] sm:w-auto cursor-pointer"
                  >
                    Fold steps
                  </button>
                )}
                <span className="text-center font-mono text-xs text-[var(--text-muted)] sm:text-right">
                  Every algebraic step written out
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "diagram" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Badge variant="accent" className="mb-2 font-mono">
                <span translate="no">GET 205</span> · Fluid Mechanics
              </Badge>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Differential U-Tube Manometry
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
                Study notes pair clear engineering diagrams with step-by-step pressure balance derivations so you can follow every problem easily.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                  Equal-pressure datum Z–Z balance derivations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                  Submerged plane gate &amp; buoyancy center drills
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/textbook-figures/get-205/cengel-fig-2-49-diff-manometer.webp"
                alt="Differential manometer schematic showing fluid column heights"
                width={520}
                height={320}
                loading="lazy"
                decoding="async"
                className="max-h-[210px] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Badge variant="accent" className="mb-2 font-mono">
                <span translate="no">GET 209</span> · Engineering Maths I
              </Badge>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Evaluate the limit:
              </p>
              <div className="math-scroll-x mt-2 text-base">
                <MathText text="$$\lim_{x \to 3} \frac{x^2 - 9}{x - 3}$$" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)] text-pretty">
                Objective multiple-choice answers (A–D) are graded instantly, and full worked solutions unlock right after you submit.
              </p>
            </div>
            <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/diagrams/get-209/removable-discontinuity.svg"
                alt="Graph of removable discontinuity at point (3, 6)"
                width={440}
                height={250}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SAMPLE_TOPIC_SLUG: Record<string, string> = {
  "get-205": "fluid-properties-and-hydrostatics",
  "get-207": "force-vectors",
  "get-209": "limits-and-continuity",
};

const COURSE_PLATE: Record<string, string> = {
  "get-205": "/images/textbook-figures/get-205/cengel-fig-2-47-manometer.webp",
  "get-207": "/images/textbook-figures/get-207/hibbeler-f5-2-beam.webp",
  "get-209": "/images/textbook-figures/get-209/stewart-fig-2-3-2-removable-hole.webp",
};

export function CourseCurriculumExplorer() {
  const [selectedSlug, setSelectedSlug] = useState(COURSES[0]?.slug ?? "get-205");
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);

  const activeCourse = COURSES.find((c) => c.slug === selectedSlug) ?? COURSES[0];
  if (!activeCourse) return null;

  const outline = CCMAS_OUTLINE[activeCourse.slug] ?? [];
  const firstFolioSlug = SAMPLE_TOPIC_SLUG[activeCourse.slug] ?? "";
  const plateImg = COURSE_PLATE[activeCourse.slug] ?? "";

  const listItems: AnimatedListEntry[] = outline.map((title, idx) => ({
    id: `${activeCourse.slug}-${idx}`,
    title,
    meta: `Module 0${idx + 1} · ${activeCourse.code}`,
    badge: `Topic 0${idx + 1}`,
  }));

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select GET course">
        {COURSES.map((course) => {
          const active = course.slug === activeCourse.slug;
          return (
            <button
              key={course.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSelectedSlug(course.slug);
                setSelectedTopicIdx(0);
              }}
              className={cn(
                "pressable min-h-[44px] rounded-full border px-4 text-xs font-semibold transition-colors sm:text-sm cursor-pointer",
                active
                  ? "border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                  : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              )}
            >
              <span translate="no" className="font-mono">
                {course.code}
              </span>
              <span className="ml-1.5 hidden font-normal opacity-80 sm:inline">
                {course.shortTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2-level course explorer card */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="font-mono">
              <span translate="no">{activeCourse.code}</span>
            </Badge>
            <Badge variant="neutral">{activeCourse.units}&nbsp;Units · OAU 200L</Badge>
          </div>
          <h3 className="mt-2.5 text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
            {activeCourse.title}
          </h3>
          <p className="mt-1 max-w-[60ch] text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm text-pretty">
            {activeCourse.description}
          </p>

          <p className="mt-4 mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Course Outline ({outline.length} modules)
          </p>
          <AnimatedList
            items={listItems}
            selectedIndex={selectedTopicIdx}
            onSelect={(_, idx) => setSelectedTopicIdx(idx)}
            maxHeightClass="max-h-[164px]"
          />

          <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Link
              href={`/courses/${activeCourse.slug}/${firstFolioSlug}`}
              className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-5 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90 min-[420px]:w-auto sm:text-sm"
            >
              Read Topic 01
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/signup"
              className="pressable inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] min-[420px]:w-auto sm:text-sm"
            >
              Start practicing
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 lg:col-span-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Sample Course Diagram
              </span>
              <span className="truncate font-mono text-[11px] font-medium text-[var(--text-muted)]">
                {activeCourse.code}
              </span>
            </div>
            {plateImg && (
              <div className="mt-3 flex h-[180px] items-center justify-center overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-white p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plateImg}
                  alt={`${activeCourse.code} engineering diagram`}
                  width={460}
                  height={260}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </div>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">{activeCourse.title}</strong> — structured notes, worked diagrams, and graded practice mapped to your OAU 200L course outline.
          </p>
        </div>
      </div>
    </div>
  );
}

export function StudyLoopStepper() {
  const steps: StepItem[] = [
    {
      id: "read",
      label: "Read notes",
      title: "Study on lined notebook pages with clear diagrams",
      description:
        "Each topic opens on ruled ivory paper with learning goals, clear equations, labeled engineering diagrams, and tap-to-reveal worked examples.",
      content: (
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--paper-bg)] p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="accent" className="font-mono">
              <span translate="no">GET 205</span> · Topic 01/03
            </Badge>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">Fluid Mechanics</span>
          </div>
          <p className="mt-2.5 text-sm font-bold text-[var(--text-primary)]">
            Fluid Properties, Hydrostatic Pressure &amp; Manometry
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/diagrams/get-205/hydrostatic-pressure-prism.svg"
            alt="Hydrostatic pressure prism acting on a submerged vertical wall"
            width={480}
            height={220}
            loading="lazy"
            decoding="async"
            className="mt-3 h-auto w-full rounded-xl border border-[var(--border-hairline)] bg-white"
          />
        </div>
      ),
    },
    {
      id: "practice",
      label: "Drill topic",
      title: "Check your answers with instant grading",
      description:
        "Practice diagram-backed objective multiple-choice questions (A–D). Full worked solutions unlock right after you check your answer.",
      content: (
        <div className="space-y-2.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[var(--accent)]">Objective · Options A–D</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--success)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Auto-graded
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Find gauge pressure at <MathText text="$4.0\,\text{m}$" /> depth in water (
            <MathText text="$\rho = 1000\,\text{kg/m}^3$" />):
          </p>
          <div className="tabular rounded-xl border-2 border-[var(--success)] bg-[var(--success-soft)] px-3 py-2 font-mono text-sm font-bold text-[var(--success)]">
            B. 39.24 kPa ✓
          </div>
          <p className="math-scroll-x text-xs text-[var(--text-secondary)]">
            <MathText text="$P = \rho g h = 1000 \times 9.81 \times 4.0 = 39.24\,\text{kPa}$" />
          </p>
        </div>
      ),
    },
    {
      id: "mock",
      label: "Timed CBT",
      title: "Simulate exam pressure & clear weak topics",
      description:
        "Run 5, 10, or 15-question timed CBT papers with question flagging, per-topic accuracy breakdowns, and automatic revision alerts under 70%.",
      content: (
        <div className="space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono text-xs font-bold text-[var(--text-primary)]">
              <Clock className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" /> 14:28 left
            </span>
            <span className="tabular inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> 5-day streak
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: "GET 205 · Fluid Properties & Statics", pct: 86 },
              { label: "GET 207 · Equilibrium & Moments", pct: 60 },
              { label: "GET 209 · Limits & Continuity", pct: 92 },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-[var(--bg-canvas)] p-2.5">
                <div className="flex justify-between gap-2 text-xs font-semibold">
                  <span className="truncate">{row.label}</span>
                  <span className="tabular shrink-0 font-mono">{row.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      row.pct < 70 ? "bg-[var(--danger)]" : "bg-[var(--accent)]"
                    )}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Stepper
      steps={steps}
      completeCta={
        <Link
          href="/signup"
          className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          Create free account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    />
  );
}

const FAQS = [
  {
    q: "Will GET Hub drain campus mobile data or lag on mid-range Android phones?",
    a: "No. Every diagram is lightweight, math equations render quickly right in the page, and there are no heavy videos eating your data.",
  },
  {
    q: "How are the notes and practice questions organized?",
    a: "Every topic follows the OAU 200L Faculty of Technology course outline for GET 205, GET 207, and GET 209, pairing concise derivations and diagrams with worked examples and graded practice questions.",
  },
  {
    q: "Which OAU departments use this platform?",
    a: "All eight 200L departments in the Faculty of Technology taking GET 205, GET 207, and GET 209: Computer, Electrical & Electronic, Mechanical, Civil, Chemical, Agricultural & Environmental, Materials Science, and Food Science & Technology.",
  },
  {
    q: "What is inside the Part 2 PDF Library?",
    a: "123 student-shared lecture notes, tutorial sheets, lab manuals, and past question papers across 14 Second Year courses (including MEE 203/205/206, MTH 201/202, CHE 201, CSC 201, and EEE 251–282) with file sizes listed before you download.",
  },
];

export function StudentFaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--border-hairline)] rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      {FAQS.map((item, idx) => {
        const open = openIdx === idx;
        return (
          <div key={item.q} className="px-4 py-1 sm:px-5">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : idx)}
              aria-expanded={open}
              className="flex min-h-[54px] w-full items-center justify-between gap-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] sm:text-base cursor-pointer"
            >
              <span>{item.q}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200",
                  open && "rotate-180 text-[var(--accent)]"
                )}
              />
            </button>
            {open && (
              <p className="pb-4 pr-4 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
