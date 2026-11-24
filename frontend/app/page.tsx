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
import { BlurText } from "@/components/reactbits/blur-text";
import { ClickSpark } from "@/components/reactbits/click-spark";
import { Counter } from "@/components/reactbits/counter";
import { GlareHover } from "@/components/reactbits/glare-hover";
import { LogoLoop } from "@/components/reactbits/logo-loop";
import { Magnet } from "@/components/reactbits/magnet";
import ParticleText from "@/components/reactbits/ParticleText";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import { APP_INSTITUTION, APP_NAME } from "@/lib/config";

const OAU_DEPT_LOOP = [
  { code: "CSC", name: "Computer" },
  { code: "EEE", name: "Electrical" },
  { code: "MEE", name: "Mechanical" },
  { code: "CVE", name: "Civil" },
  { code: "CHE", name: "Chemical" },
  { code: "AGE", name: "Agric" },
  { code: "MSE", name: "Materials" },
  { code: "FST", name: "Food Science" },
] as const;

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
    body: "GET 205 fluid mechanics diagrams, GET 207 free-body diagrams, and GET 209 limit graphs drawn as 2 KB SVGs that stay razor-sharp on any phone.",
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
    title: "Part 2 Notes & Past Questions Library",
    body: "Download curated OAU Second Year lecture notes, tutorials, lab manuals, and past questions across 14 courses — with file sizes shown upfront for campus data.",
    tag: "14 courses",
  },
];

export default function LandingPage() {
  return (
    <ClickSpark sparkColor="#EA580C" sparkSize={9} sparkRadius={18} sparkCount={8} duration={360}>
      <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)]">
        {/* Floating Frosted Pill Navbar (mt-20px, expands on hover / mobile tap) */}
        <ExpandingPillNav />

        <main>
          {/* HERO SECTION (100svh stable on mobile, React Bits Grainient hero background) */}
          <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
            <HeroGrainientBackground />

            <div className="relative z-10 mx-auto max-w-5xl text-center">
              <h1 className="mx-auto max-w-3xl text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] sm:text-5xl md:text-6xl">
                <span>Finally understand GET 205, 207 &amp; 209</span>
                {/* React Bits ParticleText for "clearly." */}
                <span className="mx-auto mt-1 block h-[78px] w-full max-w-[380px] text-[var(--accent)] sm:h-[96px] sm:max-w-[460px] md:h-[112px] md:max-w-[520px]">
                  <ParticleText
                    text="clearly."
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
                    fontSize="clamp(2.65rem, 9vw, 4.75rem)"
                    fontWeight={800}
                    fontFamily="inherit"
                    glow
                  />
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Friendly step-by-step explanations, crisp SVG engineering diagrams, and timed exam drills built by an OAU 200L student — light enough for slow campus data.
              </p>

              {/* Primary & Secondary CTAs with React Bits Magnet micro-interaction */}
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Magnet strength={0.2}>
                  <Link
                    href="/signup"
                    className="pressable inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[var(--ink-cta)] px-7 text-base font-semibold text-[var(--ink-cta-text)] sm:w-auto"
                  >
                    Create free student account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Magnet>
                <Magnet strength={0.16}>
                  <a
                    href="#courses"
                    className="pressable inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/90 px-6 text-base font-semibold text-[var(--text-primary)] backdrop-blur-xs sm:w-auto"
                  >
                    Explore the 3 GET courses
                  </a>
                </Magnet>
              </div>

              {/* Department Social Proof Strip — React Bits LogoLoop */}
              <div className="mt-8 space-y-2">
                <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Built for every OAU 200L Engineering Department
                </p>
                <LogoLoop items={OAU_DEPT_LOOP} />
              </div>

              {/* Live Interactive 2D Preview */}
              <HeroProductPreview />
            </div>
          </section>

          {/* METRICS STRIP — React Bits Counter + GlareHover */}
          <section className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-6 sm:px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
              <GlareHover className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 text-center">
                <Counter
                  value={9}
                  className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl"
                />
                <div className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Step-by-Step Study Guides
                </div>
              </GlareHover>

              <GlareHover className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 text-center">
                <Counter
                  value={54}
                  suffix="+"
                  className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl"
                />
                <div className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Original Exam Practice Drills
                </div>
              </GlareHover>

              <GlareHover className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 text-center">
                <Counter
                  value={14}
                  className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl"
                />
                <div className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Part 2 Library Courses
                </div>
              </GlareHover>

              <GlareHover className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 text-center">
                <Counter
                  value={0}
                  prefix="₦"
                  className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl"
                />
                <div className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Open Access in Phase 1
                </div>
              </GlareHover>
            </div>
          </section>

          {/* INTERACTIVE COURSE CURRICULUM EXPLORER — React Bits AnimatedList + BlurText */}
          <section id="courses" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="max-w-xl">
              <Badge variant="accent">
                <ShinyText text="NUC CCMAS 2023 Aligned" />
              </Badge>
              <BlurText
                text="One hub for the three courses that trip up 200L."
                className="mt-2.5 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-3xl"
              />
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Every topic maps directly to its CCMAS curriculum line and learning outcomes — no hunting through scattered WhatsApp PDFs the night before a test.
              </p>
            </div>

            <CourseCurriculumExplorer />
          </section>

          {/* BENTO FEATURES GRID — React Bits SpotlightCard + BlurText */}
          <section
            id="features"
            className="border-y border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-10 sm:px-6 sm:py-12"
          >
            <div className="mx-auto max-w-5xl">
              <div className="max-w-xl">
                <Badge variant="neutral">Designed for Android &amp; Slow 3G</Badge>
                <BlurText
                  text="Fast, focused tools that actually help concepts click."
                  className="mt-2.5 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-3xl"
                />
              </div>

              <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <SpotlightCard
                      key={feat.title}
                      spotlightColor="#EA580C"
                      intensity={0.12}
                      borderGlow={0.55}
                      className="hover-lift flex flex-col justify-between !p-4 sm:!p-5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent)]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <Badge variant="neutral">{feat.tag}</Badge>
                        </div>
                        <h3 className="mt-3 text-base font-bold tracking-tight text-[var(--text-primary)]">
                          {feat.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                          {feat.body}
                        </p>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS — React Bits Stepper + BlurText */}
          <section id="how-it-works" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="mb-5 max-w-xl">
              <Badge variant="accent">
                <ShinyText text="Your 15-Minute Study Loop" />
              </Badge>
              <BlurText
                text="From confused in lecture to confident in the exam hall."
                className="mt-2.5 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-3xl"
              />
            </div>

            <StudyLoopStepper />
          </section>

          {/* FAQ SECTION */}
          <section id="faq" className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 sm:pb-12">
            <div className="mb-4 text-center">
              <Badge variant="neutral">Questions</Badge>
              <BlurText
                text="Quick answers before you jump in"
                className="mt-2 text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl"
              />
            </div>
            <StudentFaqAccordion />
          </section>

          {/* HIGH-CONTRAST DEEP INK CTA BANNER */}
          <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 sm:pb-12">
            <div className="rounded-[24px] bg-[#141413] px-5 py-9 text-center text-white sm:px-10 sm:py-11">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-semibold text-orange-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <ShinyText text="No card required · Takes 30 seconds" />
              </span>
              <h2 className="mx-auto mt-3 max-w-xl text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">
                Stop cramming GET alone at 2 AM.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-300 sm:text-sm">
                Pick your OAU engineering department, open any of 9 step-by-step study guides, practice 54 original exam drills, and download Part 2 notes from the Library.
              </p>
              <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
                <Magnet strength={0.22}>
                  <Link
                    href="/signup"
                    className="pressable inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#EA580C] px-6 text-sm font-semibold text-white sm:w-auto"
                  >
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Magnet>
                <Link
                  href="/login"
                  className="pressable inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* CLEAN LIGHT FOOTER */}
        <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-7 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <BrandLogo size="sm" />
                <span className="font-extrabold tracking-tight">{APP_NAME}</span>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{APP_INSTITUTION}</p>
            </div>
            <div className="flex flex-wrap gap-5 text-xs font-medium text-[var(--text-secondary)]">
              <Link href="/courses/get-205/fluid-properties-and-hydrostatics">GET 205 Sample</Link>
              <Link href="/courses/get-207/forces-moments-and-equilibrium">GET 207 Sample</Link>
              <Link href="/courses/get-209/limits-and-continuity">GET 209 Sample</Link>
              <Link href="/login">Sign in</Link>
            </div>
          </div>
        </footer>
      </div>
    </ClickSpark>
  );
}
