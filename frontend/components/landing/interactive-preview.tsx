"use client";

import { ArrowRight, CheckCircle2, ChevronDown, Clock, Eye, Flame, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedList, type AnimatedListEntry } from "@/components/reactbits/animated-list";
import { Stepper, type StepItem } from "@/components/reactbits/stepper";
import { Badge } from "@/components/ui/badge";
import { MathText } from "@/components/ui/math-text";
import { CCMAS_OUTLINE, COURSES } from "@/lib/config";
import { cn } from "@/lib/cn";

const DEMO_STEPS = [
  "Take moments about pin $A$ (+ anticlockwise) so $R_A$ drops out: $\\sum M_A = 0 \\implies R_B(6.0) - 120(2.0) = 0$.",
  "Solve for the roller reaction at $B$: $R_B = \\frac{240}{6.0} = 40\\,\\text{N}$.",
  "Apply vertical equilibrium $\\sum F_y = 0$: $R_A + 40 - 120 = 0 \\implies R_A = 80\\,\\text{N}$.",
];

export function HeroProductPreview() {
  const [activeTab, setActiveTab] = useState<"example" | "diagram" | "quiz">("example");
  const [revealed, setRevealed] = useState(1);

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 shadow-[0_12px_36px_rgba(20,20,19,0.06)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
          <span className="ml-1 font-mono text-xs text-[var(--text-muted)]">
            Interactive Preview · Try tapping
          </span>
        </div>

        <div className="inline-flex rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-1">
          {[
            { id: "example", label: "GET 207 Steps" },
            { id: "diagram", label: "GET 205 SVG" },
            { id: "quiz", label: "GET 209 Math" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "example" | "diagram" | "quiz")}
              className={cn(
                "pressable min-h-[34px] rounded-full px-3 text-xs font-semibold cursor-pointer",
                activeTab === tab.id
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-secondary)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "example" && (
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 md:col-span-2">
              <Badge variant="accent" className="mb-2 font-mono">
                GET 207 · Statics
              </Badge>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Simply Supported Beam AB
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                Span <span className="tabular font-semibold">6.0 m</span>, downward load{" "}
                <span className="tabular font-semibold">120 N</span> at{" "}
                <span className="tabular font-semibold">2.0 m</span> from pin A. Find reactions{" "}
                <MathText text="$R_A$ and $R_B$" />.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/diagrams/get-207/beam-fbd.svg"
                alt="Simply supported beam free body diagram"
                className="mt-3 w-full rounded-xl border border-[var(--border-hairline)] bg-white"
              />
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 md:col-span-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Step-by-step worked example
                  </span>
                  <span className="tabular font-mono text-xs text-[var(--accent)]">
                    {revealed}/{DEMO_STEPS.length} shown
                  </span>
                </div>
                <ol className="mt-3 space-y-2.5">
                  {DEMO_STEPS.slice(0, revealed).map((step, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-sm leading-relaxed text-[var(--text-secondary)]"
                    >
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-soft)] font-mono text-xs font-bold text-[var(--accent)]">
                        {idx + 1}
                      </span>
                      <MathText text={step} />
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-2">
                {revealed < DEMO_STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => Math.min(DEMO_STEPS.length, r + 1))}
                    className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--ink-cta)] px-4 text-sm font-semibold text-[var(--ink-cta-text)] cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    Reveal Step {revealed + 1}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed(1)}
                    className="pressable inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    Reset steps
                  </button>
                )}
                <span className="text-xs text-[var(--text-muted)]">Zero skipped steps</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "diagram" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Badge variant="accent" className="mb-2 font-mono">
                GET 205 · Crisp 2 KB SVG
              </Badge>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                U-Tube Manometry &amp; Hydrostatics
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                Every fluid mechanics schematic is a tiny vector SVG — razor sharp when you pinch-zoom on Android, and 40× smaller than textbook scans on mobile data.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  Clear datum Z–Z manometer pressure balances
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  Hydrostatic pressure &amp; viscosity numeric drills
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/diagrams/get-205/u-tube-manometer.svg"
                alt="U-tube manometer showing pressure balance at datum Z-Z"
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Badge variant="accent" className="mb-2 font-mono">
                GET 209 · KaTeX + Server Grading
              </Badge>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Evaluate the limit:
              </p>
              <div className="mt-2 text-base">
                <MathText text="$$\lim_{x \to 3} \frac{x^2 - 9}{x - 3}$$" />
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Answers are verified on the Go API with ±1% numeric tolerance — correct answers are never shipped to your browser before you submit.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/diagrams/get-209/removable-discontinuity.svg"
                alt="Graph of removable discontinuity at (3,6)"
                className="w-full"
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
  "get-207": "forces-moments-and-equilibrium",
  "get-209": "limits-and-continuity",
};

const SAMPLE_DIAGRAM: Record<string, string> = {
  "get-205": "/diagrams/get-205/u-tube-manometer.svg",
  "get-207": "/diagrams/get-207/couple-moment.svg",
  "get-209": "/diagrams/get-209/one-sided-limits.svg",
};

export function CourseCurriculumExplorer() {
  const [selectedSlug, setSelectedSlug] = useState(COURSES[0]?.slug ?? "get-205");
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);

  const activeCourse = COURSES.find((c) => c.slug === selectedSlug) ?? COURSES[0];
  if (!activeCourse) return null;

  const outline = CCMAS_OUTLINE[activeCourse.slug] ?? [];
  const sampleSlug = SAMPLE_TOPIC_SLUG[activeCourse.slug] ?? "";
  const sampleImg = SAMPLE_DIAGRAM[activeCourse.slug] ?? "";

  const listItems: AnimatedListEntry[] = outline.map((title, idx) => ({
    id: `${activeCourse.slug}-${idx}`,
    title,
    meta: `CCMAS Module 0${idx + 1} · ${activeCourse.code}`,
    badge: idx === 0 ? "Draft live" : "Syllabus",
  }));

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {COURSES.map((course) => {
          const active = course.slug === activeCourse.slug;
          return (
            <button
              key={course.slug}
              type="button"
              onClick={() => {
                setSelectedSlug(course.slug);
                setSelectedTopicIdx(0);
              }}
              className={cn(
                "pressable min-h-[40px] rounded-full border px-3.5 text-xs font-semibold sm:text-sm cursor-pointer",
                active
                  ? "border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
                  : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
              )}
            >
              <span className="font-mono">{course.code}</span>
              <span className="ml-1.5 hidden font-normal opacity-80 sm:inline">{course.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Sleek compact course explorer card (no hover expansion) */}
      <div className="mt-4 grid gap-4 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="font-mono">
              {activeCourse.code}
            </Badge>
            <Badge variant="neutral">{activeCourse.units} Units · NUC CCMAS 2023</Badge>
          </div>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-[var(--text-primary)]">
            {activeCourse.title}
          </h3>
          <p className="mt-1 line-clamp-2 max-w-[60ch] text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
            {activeCourse.description}
          </p>

          <p className="mt-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            CCMAS Syllabus ({outline.length} modules)
          </p>
          <AnimatedList
            items={listItems}
            selectedIndex={selectedTopicIdx}
            onSelect={(_, idx) => setSelectedTopicIdx(idx)}
            maxHeightClass="max-h-[164px]"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/courses/${activeCourse.slug}/${sampleSlug}`}
              className="pressable inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 text-xs font-semibold text-white sm:text-sm"
            >
              Read sample topic
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/signup"
              className="pressable inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 text-xs font-semibold text-[var(--text-primary)] sm:text-sm"
            >
              Practice 5 sample questions
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                Sample Vector Diagram
              </span>
              <Badge variant="draft">Draft – under review</Badge>
            </div>
            {sampleImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sampleImg}
                alt={`${activeCourse.code} sample engineering diagram`}
                className="mt-2.5 max-h-[175px] w-full rounded-xl border border-[var(--border-hairline)] bg-white object-contain"
              />
            )}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            Original diagrams &amp; explanations — zero textbook copy-paste.
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
      title: "Read plain-English notes with SVG diagrams",
      description:
        "Every topic starts with why it matters in engineering, breaks down key formulas in KaTeX, and lets you reveal worked examples one step at a time.",
      content: (
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between">
            <Badge variant="accent" className="font-mono">GET 205 · Topic 1</Badge>
            <Badge variant="draft">Draft – under review</Badge>
          </div>
          <p className="mt-2.5 text-sm font-bold text-[var(--text-primary)]">
            Fluid Properties, Hydrostatic Pressure &amp; Manometry
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/diagrams/get-205/hydrostatic-pressure-prism.svg"
            alt="Hydrostatic pressure prism on a vertical submerged wall"
            className="mt-3 w-full rounded-xl border border-[var(--border-hairline)] bg-white"
          />
        </div>
      ),
    },
    {
      id: "practice",
      label: "Practice",
      title: "Practice with instant server-side grading",
      description:
        "Solve diagram-backed MCQs and numeric engineering calculations with ±1% tolerance. Full worked solutions unlock right after you submit.",
      content: (
        <div className="space-y-2.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[var(--accent)]">NUMERIC · ±1% TOLERANCE</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--success)]">
              <ShieldCheck className="h-3.5 w-3.5" /> Server-verified
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Find gauge pressure at <MathText text="$4.0\,\text{m}$" /> depth in water (
            <MathText text="$\rho = 1000\,\text{kg/m}^3$" />):
          </p>
          <div className="flex items-center gap-2">
            <div className="tabular flex-1 rounded-xl border-2 border-[var(--success)] bg-[var(--success-soft)] px-3 py-2 font-mono text-sm font-bold text-[var(--success)]">
              39.24 kPa ✓
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            <MathText text="$P = \rho g h = 1000 \times 9.81 \times 4.0 = 39.24\,\text{kPa}$" />
          </p>
        </div>
      ),
    },
    {
      id: "mock",
      label: "Mock & streak",
      title: "Run timed mocks & eliminate weak topics",
      description:
        "Simulate test pressure with randomized questions, a mobile bottom-sheet question map, daily study streaks, and automatic weak-topic alerts under 70%.",
      content: (
        <div className="space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono text-xs font-bold text-[var(--text-primary)]">
              <Clock className="h-3.5 w-3.5 text-[var(--accent)]" /> 14:28 left
            </span>
            <span className="tabular inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
              <Flame className="h-3.5 w-3.5" /> 5-day streak
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: "GET 205 · Fluid Properties & Statics", pct: 86 },
              { label: "GET 207 · Equilibrium & Moments", pct: 60 },
              { label: "GET 209 · Limits & Continuity", pct: 92 },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-[var(--bg-canvas)] p-2.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{row.label}</span>
                  <span className="tabular font-mono">{row.pct}%</span>
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
          className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white"
        >
          Start studying free
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    />
  );
}

const FAQS = [
  {
    q: "Will this eat my mobile data or lag on an Android phone?",
    a: "No. Every diagram is a tiny vector SVG (usually 1–3 KB), equations render natively with KaTeX CSS, and there is zero 3D or autoplay video anywhere on the site. Pages stay fast even on slow 3G around campus.",
  },
  {
    q: "Which OAU departments is GET Hub built for?",
    a: "Every 200L department in the Faculty of Technology taking GET 205, GET 207, and GET 209 — Computer, Electronic & Electrical, Mechanical, Civil, Chemical, Agricultural & Environmental, Materials Science, and Food Science & Technology.",
  },
  {
    q: "Is it free right now?",
    a: "Yes! Everything in Phase 1 — topic notes, worked examples, practice questions, and timed mock exams — is completely open while we refine the content together with OAU 200L students.",
  },
  {
    q: "Why do some topics show a 'Draft – under review' badge?",
    a: "All notes, diagrams, and questions are written originally for Nigerian 200L engineering students aligned to the NUC CCMAS 2023 syllabus. Draft badges let you know a topic is still being reviewed against lecture notes.",
  },
];

export function StudentFaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--border-hairline)] rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      {FAQS.map((item, idx) => {
        const open = openIdx === idx;
        return (
          <div key={item.q} className="px-5 py-1">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : idx)}
              aria-expanded={open}
              className="flex min-h-[56px] w-full items-center justify-between gap-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] sm:text-base cursor-pointer"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200",
                  open && "rotate-180 text-[var(--accent)]"
                )}
              />
            </button>
            {open && (
              <p className="pb-4 pr-6 text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
