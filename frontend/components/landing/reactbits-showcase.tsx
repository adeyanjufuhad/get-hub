"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import BounceCards from "@/components/reactbits/bounce-cards";
import StarBorder from "@/components/reactbits/star-border";
import TiltedCard from "@/components/reactbits/tilted-card";
import { COURSE_BANNER_IMAGES, COURSE_TOPICS_FALLBACK, COURSES } from "@/lib/config";

/** True once mounted and the resolved theme is dark (false during SSR to avoid mismatches). */
export function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && resolvedTheme === "dark";
}

/* -------------------------------------------------------------------------- */
/* Star-border CTA (React Bits StarBorder rendered as a Next.js Link)         */
/* -------------------------------------------------------------------------- */

interface StarCtaProps {
  href: string;
  children: ReactNode;
  /** "ink" follows the page theme (dark pill on cream, light pill on obsidian); "accent" is always tangerine. */
  tone?: "ink" | "accent";
  /** "lg" = landing pill; "md" = compact 12px-radius button for app surfaces. */
  size?: "lg" | "md";
  className?: string;
}

const STAR_SIZES = {
  lg: { radius: 999, className: "min-h-[48px] w-full px-6 text-sm font-semibold sm:min-h-[50px] sm:w-auto sm:px-7 sm:text-base" },
  md: { radius: 12, className: "min-h-[44px] px-5 py-0 text-sm font-medium" },
} as const;

export function StarCta({ href, children, tone = "ink", size = "lg", className = "" }: StarCtaProps) {
  const isDark = useIsDark();
  const accent = tone === "accent";
  // The star glides on a dark surface in "dark" mode and on a light surface in "light" mode.
  const surfaceIsDark = accent ? true : !isDark;

  return (
    <StarBorder
      as={Link}
      href={href}
      theme={surfaceIsDark ? "dark" : "light"}
      color={accent ? "#FFEDD5" : "#FB923C"}
      trailColor={accent ? "#FDBA74" : "#EA580C"}
      backgroundColor={accent ? "#EA580C" : "var(--ink-cta)"}
      textColor={accent ? "#FFFFFF" : "var(--ink-cta-text)"}
      borderColor={accent ? "rgba(255,255,255,0.22)" : surfaceIsDark ? "rgba(255,255,255,0.12)" : "rgba(20,20,19,0.14)"}
      radius={STAR_SIZES[size].radius}
      thickness={1.5}
      glow={0.7}
      sparkle
      duration={5}
      hover="lap"
      className={`pressable ${STAR_SIZES[size].className} ${className}`}
    >
      <span className="relative z-[1] inline-flex items-center gap-2">
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </StarBorder>
  );
}

/* -------------------------------------------------------------------------- */
/* Course plates (React Bits TiltedCard — tilt on hover, flip for topics)      */
/* -------------------------------------------------------------------------- */

export function CoursePlates() {
  return (
    <div className="mt-7 grid gap-5 sm:grid-cols-3">
      {COURSES.map((course) => {
        const topics = COURSE_TOPICS_FALLBACK[course.slug] ?? [];
        const banner = COURSE_BANNER_IMAGES[course.slug] ?? "/images/courses/get-205.webp";
        return (
          <TiltedCard
            key={course.slug}
            imageSrc={banner}
            altText={`${course.code} ${course.title} banner`}
            containerHeight="300px"
            containerWidth="100%"
            imageHeight="300px"
            imageWidth="100%"
            radius={24}
            rotateAmplitude={9}
            scaleOnHover={1.03}
            glare={0.35}
            shadow={0.35}
            showTooltip={false}
            gyroscope={false}
            flipOnClick
            displayOverlayContent
            overlayDepth={36}
            overlayContent={
              <div className="pointer-events-none flex h-full flex-col justify-between rounded-[24px] bg-gradient-to-t from-black/85 via-black/35 to-black/5 p-5 text-left text-white">
                <div className="flex items-center justify-between">
                  <span
                    translate="no"
                    className="rounded-full bg-[#EA580C] px-2.5 py-0.5 font-mono text-xs font-semibold"
                  >
                    {course.code}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-0.5 font-mono text-[11px] text-white/85 backdrop-blur-sm">
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Tap to flip
                  </span>
                </div>
                <div>
                  <p className="tabular font-mono text-xs text-orange-200">
                    {topics.length} topics · {course.units} units
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold leading-tight tracking-tight">
                    {course.title}
                  </h3>
                </div>
              </div>
            }
            backContent={
              <div className="flex h-full flex-col rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 text-left">
                <div className="flex items-center justify-between">
                  <span translate="no" className="font-mono text-xs font-bold text-[var(--accent)]">
                    {course.code}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">Topic outline</span>
                </div>
                <ol className="mt-2.5 min-h-0 flex-1 space-y-1 overflow-hidden">
                  {topics.slice(0, topics.length > 7 ? 6 : 7).map((t) => (
                    <li
                      key={t.id}
                      className="flex gap-2 truncate text-xs leading-relaxed text-[var(--text-secondary)]"
                    >
                      <span className="tabular font-mono text-[var(--accent)]">
                        {String(t.display_order).padStart(2, "0")}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </li>
                  ))}
                  {topics.length > 7 && (
                    <li className="font-mono text-xs text-[var(--text-muted)]">
                      +{topics.length - 6} more topics
                    </li>
                  )}
                </ol>
                <Link
                  href={`/courses/${course.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="pressable mt-3 inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[12px] bg-[var(--ink-cta)] text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
                >
                  Open {course.code} notes
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            }
          />
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Diagram fan (React Bits BounceCards with real course figures)              */
/* -------------------------------------------------------------------------- */

const DIAGRAM_FAN = [
  { src: "/images/textbook-figures/get-205/cengel-fig-2-47-manometer.webp", alt: "U-tube manometer diagram" },
  { src: "/images/textbook-figures/get-207/hibbeler-f5-3-truss.webp", alt: "Truss free-body diagram" },
  { src: "/images/textbook-figures/get-205/cengel-fig-12-12-bernoulli.webp", alt: "Bernoulli flow diagram" },
  { src: "/images/textbook-figures/get-209/stewart-fig-14-6-6-gradient-contour.webp", alt: "Gradient and contour plot" },
  { src: "/images/textbook-figures/get-207/hibbeler-f8-2-ladder.webp", alt: "Ladder friction diagram" },
];

export function DiagramFan() {
  return (
    // BounceCards lays out in fixed pixels, so scale the whole fan down on narrow screens.
    <div className="flex h-[190px] items-start justify-center min-[420px]:h-[230px] sm:h-[260px]">
      <div className="origin-top scale-[0.62] min-[420px]:scale-[0.78] sm:scale-100">
        <BounceCards
          images={DIAGRAM_FAN}
          containerWidth={520}
          containerHeight={250}
          cardSize={160}
          spread={88}
          rotation={8}
          arc={14}
          animationDelay={0.3}
          borderWidth={5}
          borderColor="#FFFDF9"
          radius={20}
          pushDistance={120}
        />
      </div>
    </div>
  );
}
