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
import { Counter } from "@/components/reactbits/counter";
import { LogoLoop } from "@/components/reactbits/logo-loop";
import { Magnet } from "@/components/reactbits/magnet";
import ParticleText from "@/components/reactbits/ParticleText";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import { APP_INSTITUTION, APP_NAME } from "@/lib/config";

const OAU_DEPT_LOOP = [
  { code: "CSC", name: "Computer" },
  { code: "EEE", name: "Electrical" },
  { code: "MEE", name: "Mechanical" },
  { code: "CVE", name: "Civil" },
  { code: "CHE", name: "Chemical" },
  { code: "AGE", name: "Agric & Env" },
  { code: "MSE", name: "Materials" },
  { code: "FST", name: "Food Tech" },
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
    title: "Part 2 Handout & PQ Archive",
    body: "Download 123 OAU Second Year lecture notes, lab manuals, and past questions across 14 courses with exact MB file sizes upfront.",
    tag: "14 courses",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Floating Frosted Pill Navbar (includes Skip-to-content link) */}
      <ExpandingPillNav />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* ==================== 1. HERO (Cream Canvas + Single Grainient Effect + App-Frame) ==================== */}
        <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32">
          <HeroGrainientBackground />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-3xl text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] text-balance min-[380px]:text-[2.25rem] sm:text-5xl md:text-6xl">
              <span>Master </span>
              <span translate="no">GET 205, 207 &amp; 209</span>
              <span className="mx-auto mt-1 block h-[64px] w-full max-w-[300px] text-[var(--accent)] min-[380px]:h-[78px] min-[380px]:max-w-[380px] sm:h-[96px] sm:max-w-[460px] md:h-[112px] md:max-w-[520px]">
                <ParticleText
                  text="from the book."
                  particleSize={2}
                  density={3}
                  color="currentColor"
                  highlightColor="#ff5a36"
                  highlightMode="motion"
                  shape="circle"
                  intro="gather"
                  scatter={150}
                  gatherDuration={1400}
                  stagger={380}
                  clickBurst
                  burstStrength={1}
                  pointerRepel={40}
                  repelRadius={110}
                  idleDrift={0.65}
                  trigger="hover"
                  fontSize="clamp(1.85rem, 7.2vw, 4.1rem)"
                  fontWeight={800}
                  fontFamily="inherit"
                  glow
                />
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] text-pretty min-[380px]:text-base sm:mt-5 sm:text-lg">
              9 lined coursebook folios, 26 cropped schematics from Çengel, Hibbeler 14e &amp; Stewart 7e, and 72 server-graded exam drills built for campus mobile data.
            </p>

            {/* Two disciplined CTAs (Primary Ink + Secondary Surface) */}
            <div className="mt-7 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
              <Magnet strength={0.18} className="w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="pressable inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[var(--ink-cta)] px-6 text-sm font-semibold text-[var(--ink-cta-text)] hover:opacity-90 sm:min-h-[50px] sm:w-auto sm:px-7 sm:text-base"
                >
                  Create student account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Magnet>
              <Magnet strength={0.14} className="w-full sm:w-auto">
                <a
                  href="#courses"
                  className="pressable inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/92 px-6 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] sm:min-h-[50px] sm:w-auto sm:text-base"
                >
                  Inspect the 3 GET courses
                </a>
              </Magnet>
            </div>

            {/* Department Ticker with Pause Control */}
            <div className="mt-8 space-y-2">
              <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                8 OAU Engineering Departments · One Shared Curriculum
              </p>
              <LogoLoop items={OAU_DEPT_LOOP} />
            </div>

            {/* Live 2-Level App-Frame Workspace Preview */}
            <HeroProductPreview />
          </div>
        </section>

        {/* ==================== 2. FACT STRIP (Equal max-w-5xl edges, tabular figures) ==================== */}
        <section className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-7 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Counter
                value={9}
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]"
              />
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Lined Study Folios
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Counter
                value={72}
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]"
              />
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Server-Graded Drills
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Counter
                value={123}
                className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]"
              />
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Part 2 Library Files
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
              <Counter
                value={3}
                className="text-2xl font-extrabold tracking-tight text-[var(--accent)]"
              />
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                Matched Course Textbooks
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 3. COURSE CURRICULUM EXPLORER (Equal max-w-5xl edges) ==================== */}
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

        {/* ==================== 4. CAPABILITIES GRID (Warm Cream Surface Contrast, Flat 1px Cards) ==================== */}
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
                    className="flex flex-col justify-between rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--accent)]">
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

        {/* ==================== 5. STUDY WORKFLOW (Equal max-w-5xl 12-Col Editorial Split) ==================== */}
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

        {/* ==================== 6. FAQ (Equal max-w-5xl 12-Col Editorial Split) ==================== */}
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

        {/* ==================== 7. OBSIDIAN CALLOUT BAND (Equal max-w-5xl edges) ==================== */}
        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="rounded-[24px] bg-[#141413] px-5 py-10 text-center text-[#FAF9F5] sm:px-10 sm:py-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 font-mono text-xs font-semibold text-orange-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Open Phase 1 Access · Zero Subscription Fee
            </span>
            <h2 className="mx-auto mt-3.5 max-w-xl text-2xl font-extrabold tracking-[-0.025em] text-balance sm:text-3xl">
              Open your 200L coursebooks before the next test.
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-neutral-300 text-pretty">
              Select your OAU engineering department, read all 9 lined study folios, practice 72 textbook-verified questions, and access 123 Part 2 handouts in one place.
            </p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <Magnet strength={0.2} className="w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="pressable inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#EA580C] px-6 text-sm font-semibold text-white hover:bg-[#C2410C] sm:w-auto"
                >
                  Create student account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Magnet>
              <Link
                href="/login"
                className="pressable inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-[#FAF9F5] hover:bg-white/10 sm:w-auto"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== 8. EDITORIAL DARK CLOSING FOOTER (VoltAgent claude-DESIGN.md + tasteskill) ==================== */}
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
                    className="hover:text-[#FAF9F5]"
                  >
                    <span translate="no">GET 205</span> · Fluid Mechanics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/get-207/forces-moments-and-equilibrium"
                    className="hover:text-[#FAF9F5]"
                  >
                    <span translate="no">GET 207</span> · Applied Mechanics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/get-209/limits-and-continuity"
                    className="hover:text-[#FAF9F5]"
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
                  <Link href="/tests" className="hover:text-[#FAF9F5]">
                    Test Center
                  </Link>
                </li>
                <li>
                  <Link href="/progress" className="hover:text-[#FAF9F5]">
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
                  <Link href="/signup" className="hover:text-[#FAF9F5]">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#FAF9F5]">
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
