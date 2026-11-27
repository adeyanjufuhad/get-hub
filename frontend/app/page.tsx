import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Target,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ExpandingPillNav } from "@/components/landing/expanding-pill-nav";
import { HeroGrainientBackground } from "@/components/landing/hero-grainient";
import {
  CourseCurriculumExplorer,
  HeroProductPreview,
  StudentFaqAccordion,
  StudyLoopStepper,
} from "@/components/landing/interactive-preview";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import { APP_INSTITUTION, APP_NAME } from "@/lib/config";

const OAU_DEPARTMENTS = [
  { code: "CSC", name: "Computer" },
  { code: "EEE", name: "Electrical" },
  { code: "MEE", name: "Mechanical" },
  { code: "CVE", name: "Civil" },
  { code: "CHE", name: "Chemical" },
  { code: "AGE", name: "Agric & Env" },
  { code: "MSE", name: "Materials" },
  { code: "FST", name: "Food Tech" },
] as const;

const FACT_STATS = [
  { value: "9", label: "Lined Study Folios", accent: false },
  { value: "72", label: "Server-Graded Drills", accent: false },
  { value: "26", label: "Cropped Textbook Plates", accent: false },
  { value: "3", label: "Matched Course Textbooks", accent: true },
] as const;

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Lined Coursebook Folios",
    body: "Read chapters on warm 32px ruled engineering paper with pinned CCMAS learning outcomes and step-by-step worked derivations.",
    tag: "9 folios",
  },
  {
    icon: Layers,
    title: "Prescribed Textbook Plates",
    body: "Inspect high-resolution schematics cropped directly from Çengel, Hibbeler 14e, and Stewart 7e alongside 2 KB vector free-body diagrams.",
    tag: "3 textbooks",
  },
  {
    icon: ShieldCheck,
    title: "Go Server Answer Grading",
    body: "Check KaTeX MCQs and numeric engineering calculations with ±1% tolerance. Answer keys stay on the backend until you submit.",
    tag: "72 drills",
  },
  {
    icon: Timer,
    title: "Timed CBT Mock Simulator",
    body: "Generate 5, 10, or 15-question papers with a sticky countdown clock, question flagging, mobile navigator sheet, and topic accuracy breakdown.",
    tag: "Exam prep",
  },
  {
    icon: Target,
    title: "Weak-Topic Priority Queue",
    body: "Chapters below 70% accuracy automatically surface on your dashboard so you drill weak mechanics or calculus modules before test week.",
    tag: "< 70% alert",
  },
  {
    icon: Users,
    title: "Built for Campus Mobile Data",
    body: "Vector schematics weigh 1–3 KB, cropped textbook plates use compressed WebP, and equations render with CSS KaTeX — zero heavy video streams.",
    tag: "Low data",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <ExpandingPillNav />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* ==================== 1. HERO (Calm Warm Canvas + Direct Typography + App-Frame) ==================== */}
        <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32">
          <HeroGrainientBackground />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-3xl text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] text-balance min-[380px]:text-[2.35rem] sm:text-5xl md:text-6xl">
              <span>Master </span>
              <span translate="no">GET 205, 207 &amp; 209</span>
              <span className="mt-1 block text-[var(--accent)]">from the book.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] text-pretty min-[380px]:text-base sm:mt-5 sm:text-lg">
              9 lined coursebook folios, 26 cropped schematics from Çengel, Hibbeler 14e &amp; Stewart 7e, and 72 server-graded exam drills built for campus mobile data.
            </p>

            {/* Concentric CTA Dock: Outer 18px = Inner 12px + Padding 6px (p-1.5) */}
            <div className="mx-auto mt-7 inline-flex w-full max-w-md flex-col gap-1.5 rounded-[18px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1.5 sm:mt-8 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="pressable inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)] hover:opacity-90 sm:w-auto sm:px-6 sm:text-base"
              >
                Create student account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#courses"
                className="pressable inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] sm:w-auto sm:text-base"
              >
                Inspect the 3 GET courses
              </a>
            </div>

            {/* Static Department Strip (calm, scannable, zero infinite marquee motion) */}
            <div className="mt-8 space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                8 OAU Engineering Departments · One Shared Curriculum
              </p>
              <ul className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-1.5">
                {OAU_DEPARTMENTS.map((dept) => (
                  <li
                    key={dept.code}
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <span translate="no" className="font-mono text-[11px] font-bold text-[var(--accent)]">
                      {dept.code}
                    </span>
                    <span className="text-[11px]">{dept.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live 2-Level App-Frame Workspace Preview */}
            <HeroProductPreview />
          </div>
        </section>

        {/* ==================== 2. FACT STRIP (Instant static tabular figures) ==================== */}
        <section className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-7 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {FACT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4"
              >
                <p
                  className={
                    stat.accent
                      ? "tabular text-2xl font-extrabold tracking-tight text-[var(--accent)]"
                      : "tabular text-2xl font-extrabold tracking-tight text-[var(--text-primary)]"
                  }
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== 3. COURSE CURRICULUM EXPLORER ==================== */}
        <section id="courses" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              NUC CCMAS 2023 Syllabus Alignment
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] text-balance sm:text-3xl">
              Every chapter paired with the exact textbook your lecturers set.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty sm:text-base">
              Switch between Fluid Mechanics, Applied Mechanics, and Engineering Mathematics I to inspect the syllabus modules, textbook chapters, and first study folio.
            </p>
          </div>

          <CourseCurriculumExplorer />
        </section>

        {/* ==================== 4. CAPABILITIES GRID ==================== */}
        <section
          id="features"
          className="border-y border-[var(--border-hairline)] bg-[var(--bg-subtle)]/65 px-4 py-12 sm:px-6 sm:py-16"
        >
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] text-balance sm:text-3xl">
                Built around how 200L tests are written and graded.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty sm:text-base">
                Read the derivation on lined paper, inspect the free-body or manometer diagram, check numeric answers to ±1%, and sit timed mocks before exam week.
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <article
                    key={feat.title}
                    className="flex flex-col justify-between rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[28px] sm:p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        {/* Concentric icon well: Outer 24/28px = Inner 12px + Padding 12/16px */}
                        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--accent)]">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <Badge variant="neutral" className="font-mono">
                          {feat.tag}
                        </Badge>
                      </div>
                      <h3 className="mt-4 text-base font-bold tracking-tight text-[var(--text-primary)]">
                        {feat.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
                        {feat.body}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== 5. STUDY WORKFLOW ==================== */}
        <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                15-Minute Study Loop
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] text-balance sm:text-3xl">
                Read the folio, solve the drill, time your speed.
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
                Each topic folio links straight into its chapter drill bank and course CBT simulator so you verify understanding immediately after reading.
              </p>
            </div>

            <div className="lg:col-span-8">
              <StudyLoopStepper />
            </div>
          </div>
        </section>

        {/* ==================== 6. FAQ ==================== */}
        <section id="faq" className="mx-auto max-w-5xl border-t border-[var(--border-hairline)] px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Student Questions
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] text-balance">
                Straight answers on data usage, textbooks, and courses.
              </h2>
            </div>

            <div className="lg:col-span-8">
              <StudentFaqAccordion />
            </div>
          </div>
        </section>

        {/* ==================== 7. OBSIDIAN CALLOUT BAND ==================== */}
        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="rounded-[28px] bg-[#141413] p-5 text-center text-[#FAF9F5] sm:rounded-[32px] sm:px-10 sm:py-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 font-mono text-xs font-semibold text-orange-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Open Phase 1 Access · Zero Subscription Fee
            </span>
            <h2 className="mx-auto mt-3.5 max-w-xl text-2xl font-extrabold tracking-[-0.025em] text-balance sm:text-3xl">
              Open your 200L coursebooks before the next test.
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-neutral-300 text-pretty">
              Select your OAU engineering department, read all 9 lined study folios, practice 72 textbook-verified questions, and sit timed CBT papers in one place.
            </p>
            {/* Concentric button tray: Outer 18px = Inner 12px + Padding 6px (p-1.5) */}
            <div className="mx-auto mt-6 inline-flex w-full max-w-md flex-col gap-1.5 rounded-[18px] border border-white/12 bg-white/[0.04] p-1.5 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="pressable inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#EA580C] px-6 text-sm font-semibold text-white hover:bg-[#C2410C] sm:w-auto"
              >
                Create student account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="pressable inline-flex min-h-[46px] w-full items-center justify-center rounded-[12px] border border-white/15 bg-white/5 px-6 text-sm font-semibold text-[#FAF9F5] hover:bg-white/10 sm:w-auto"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== 8. EDITORIAL DARK CLOSING FOOTER ==================== */}
      <footer className="border-t border-white/10 bg-[#141413] px-4 py-12 text-[#A3A098] sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5 text-[#FAF9F5]">
                <BrandLogo size="sm" />
                <span translate="no" className="text-base font-extrabold tracking-tight">
                  {APP_NAME}
                </span>
              </div>
              <p className="mt-2.5 max-w-xs text-xs leading-relaxed">
                {APP_INSTITUTION} — lined study folios, textbook figure drills, and timed CBT exams for Second Year engineering students.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF9F5]">
                Study Folios
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link
                    href="/courses/get-205/fluid-properties-and-hydrostatics"
                    className="transition-colors hover:text-[#FAF9F5]"
                  >
                    <span translate="no">GET 205</span> · Fluid Mechanics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/get-207/forces-moments-and-equilibrium"
                    className="transition-colors hover:text-[#FAF9F5]"
                  >
                    <span translate="no">GET 207</span> · Applied Mechanics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/get-209/limits-and-continuity"
                    className="transition-colors hover:text-[#FAF9F5]"
                  >
                    <span translate="no">GET 209</span> · Engineering Maths I
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF9F5]">
                Platform
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link href="/tests" className="transition-colors hover:text-[#FAF9F5]">
                    Test Center
                  </Link>
                </li>
                <li>
                  <Link href="/progress" className="transition-colors hover:text-[#FAF9F5]">
                    Study Progress
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF9F5]">
                Student Access
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link href="/signup" className="transition-colors hover:text-[#FAF9F5]">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-[#FAF9F5]">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} <span translate="no">{APP_NAME}</span> · Built for OAU 200L Engineering.
            </p>
            <p className="font-mono text-[11px]">
              Aligned with NUC CCMAS 2023 · Çengel · Hibbeler 14e · Stewart 7e
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
