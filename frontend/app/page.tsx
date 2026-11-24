import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  Layers,
  ShieldCheck,
  Target,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  CourseCurriculumExplorer,
  HeroProductPreview,
  StudentFaqAccordion,
  StudyLoopStepper,
} from "@/components/landing/interactive-preview";
import { Counter } from "@/components/reactbits/counter";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { APP_INSTITUTION, APP_NAME, APP_SEMESTER, COURSES } from "@/lib/config";

const DEPT_CHIPS = ["CSC", "EEE", "MEE", "CVE", "CHE", "AGE", "MSE", "FST"];

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Tap-to-Reveal Worked Examples",
    body: "Never stare at a giant wall of algebra again. Try each step yourself, then tap Next Step to uncover the exact reasoning.",
    tag: "Active recall",
  },
  {
    icon: Layers,
    title: "Crisp SVG Engineering Diagrams",
    body: "GET 203 orthographic projections, GET 207 free-body diagrams, and GET 209 limit graphs drawn as 2 KB SVGs that stay razor-sharp on any phone.",
    tag: "3G-friendly",
  },
  {
    icon: ShieldCheck,
    title: "Real Server-Checked Practice",
    body: "Supports text, KaTeX, image-based MCQs, and numeric answers with ±1% engineering tolerance. Answers stay on the Go API until you submit.",
    tag: "Instant feedback",
  },
  {
    icon: Timer,
    title: "Timed Mock Exams & Topic Breakdown",
    body: "Simulate 200L test pressure with randomized questions, live countdown timer, mobile question navigator sheet, and per-topic accuracy scoring.",
    tag: "Exam-ready",
  },
  {
    icon: Target,
    title: "Weak-Topic Radar & Study Streaks",
    body: "Automatically flags topics where your accuracy dips below 70% so you know what to revise first instead of guessing.",
    tag: "Smart revision",
  },
  {
    icon: Users,
    title: "Built to Grow with Your Class",
    body: "Phase 2 brings live Pomodoro Study Rooms per course and Phase 4 adds Weekly Quiz Battles & the OAU Department League.",
    tag: "Coming soon",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Sticky Minimal Light Navbar */}
      <header className="safe-top sticky top-0 z-40 border-b border-[var(--border-hairline)]/80 bg-[var(--bg-canvas)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ink-cta)] text-[var(--ink-cta-text)]">
              <Compass className="h-5 w-5" />
            </span>
            <span className="text-base font-extrabold tracking-tight">{APP_NAME}</span>
            <span className="hidden rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent)] sm:inline-block">
              OAU 200L
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--text-secondary)] md:flex">
            <a href="#courses" className="transition-colors hover:text-[var(--text-primary)]">
              Courses
            </a>
            <a href="#features" className="transition-colors hover:text-[var(--text-primary)]">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-[var(--text-primary)]">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-[var(--text-primary)]">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="pressable hidden min-h-[44px] items-center rounded-full px-4 text-sm font-semibold text-[var(--text-secondary)] sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="pressable inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--ink-cta)] px-4 text-sm font-semibold text-[var(--ink-cta-text)] sm:px-5"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION (100svh stable on mobile, light alabaster + soft warm halo) */}
        <section className="relative overflow-hidden bg-draft-grid px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-60"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 0%, rgba(234,88,12,0.12) 0%, rgba(248,248,246,0) 100%)",
            }}
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span>{APP_SEMESTER} · OAU Faculty of Technology</span>
            </div>

            <h1 className="mx-auto mt-5 max-w-3xl text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              Finally understand GET 203, 207 &amp; 209{" "}
              <span className="relative inline-block px-2 py-0.5 text-[var(--accent)]">
                {/* Playful 2D CAD drafting selection box with corner handles */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-md border-[1.5px] border-dashed border-[var(--accent)]/60 bg-[var(--accent-soft)]/55"
                />
                <span aria-hidden="true" className="absolute -left-1 -top-1 h-2 w-2 rounded-[2px] border border-[var(--accent)] bg-[var(--bg-surface)]" />
                <span aria-hidden="true" className="absolute -right-1 -top-1 h-2 w-2 rounded-[2px] border border-[var(--accent)] bg-[var(--bg-surface)]" />
                <span aria-hidden="true" className="absolute -bottom-1 -left-1 h-2 w-2 rounded-[2px] border border-[var(--accent)] bg-[var(--bg-surface)]" />
                <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2 w-2 rounded-[2px] border border-[var(--accent)] bg-[var(--bg-surface)]" />
                <span className="relative">clearly.</span>
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Friendly step-by-step explanations, crisp SVG engineering diagrams, and timed exam drills built by an OAU 200L student — light enough for slow campus data.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="pressable inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[var(--ink-cta)] px-7 text-base font-semibold text-[var(--ink-cta-text)]"
              >
                Create free student account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#courses"
                className="pressable inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 text-base font-semibold text-[var(--text-primary)]"
              >
                Explore the 3 GET courses
              </a>
            </div>

            {/* Department Social Proof Strip */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Built for every 200L department:
              </span>
              {DEPT_CHIPS.map((dept) => (
                <span
                  key={dept}
                  className="rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--text-secondary)]"
                >
                  {dept}
                </span>
              ))}
            </div>

            {/* Live Interactive 2D Preview */}
            <HeroProductPreview />
          </div>
        </section>

        {/* METRICS STRIP — powered by React Bits Counter */}
        <section className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 text-center">
              <Counter
                value={COURSES.length}
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              />
              <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Core 200L GET Courses
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 text-center">
              <Counter
                value={100}
                suffix="%"
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              />
              <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Original Step-by-Step Notes
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 text-center">
              <Counter
                value={3}
                prefix="< "
                suffix=" KB"
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              />
              <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Average SVG Diagram Size
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 text-center">
              <Counter
                value={0}
                prefix="₦"
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              />
              <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Open Access in Phase 1
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE COURSE CURRICULUM EXPLORER — powered by React Bits AnimatedList */}
        <section id="courses" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <Badge variant="accent">NUC CCMAS 2023 Aligned</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-4xl">
              One hub for the three courses that trip up 200L.
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)]">
              Every topic maps directly to its CCMAS curriculum line and learning outcomes — no hunting through scattered WhatsApp PDFs the night before a test.
            </p>
          </div>

          <CourseCurriculumExplorer />
        </section>

        {/* BENTO FEATURES GRID — powered by React Bits SpotlightCard */}
        <section
          id="features"
          className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <Badge variant="neutral">Designed for Android &amp; Slow 3G</Badge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-4xl">
                Fast, focused tools that actually help concepts click.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <SpotlightCard
                    key={feat.title}
                    spotlightColor="#EA580C"
                    intensity={0.12}
                    borderGlow={0.55}
                    className="hover-lift flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <Badge variant="neutral">{feat.tag}</Badge>
                      </div>
                      <h3 className="mt-4 text-lg font-bold tracking-tight text-[var(--text-primary)]">
                        {feat.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {feat.body}
                      </p>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — powered by React Bits Stepper */}
        <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8 max-w-2xl">
            <Badge variant="accent">Your 15-Minute Study Loop</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-4xl">
              From confused in lecture to confident in the exam hall.
            </h2>
          </div>

          <StudyLoopStepper />
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <div className="mb-6 text-center">
            <Badge variant="neutral">Questions</Badge>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Quick answers before you jump in
            </h2>
          </div>
          <StudentFaqAccordion />
        </section>

        {/* HIGH-CONTRAST DEEP INK CTA BANNER */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="rounded-[28px] bg-[#141413] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-semibold text-orange-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              No card required · Takes 30 seconds
            </span>
            <h2 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl">
              Stop cramming GET alone at 2 AM.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-neutral-300 sm:text-base">
              Pick your OAU engineering department, open your first topic, and try 15 original practice questions across GET 203, 207, and 209 today.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="pressable inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#EA580C] px-7 text-base font-semibold text-white"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="pressable inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 text-base font-semibold text-white"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* CLEAN LIGHT FOOTER */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-[var(--accent)]" />
              <span className="font-extrabold tracking-tight">{APP_NAME}</span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">{APP_INSTITUTION}</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-medium text-[var(--text-secondary)]">
            <Link href="/courses/get-203/projection-of-lines">GET 203 Sample</Link>
            <Link href="/courses/get-207/forces-moments-and-equilibrium">GET 207 Sample</Link>
            <Link href="/courses/get-209/limits-and-continuity">GET 209 Sample</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
