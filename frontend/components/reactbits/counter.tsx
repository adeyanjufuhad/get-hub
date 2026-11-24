"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * React Bits-inspired rolling Counter with tabular-nums, IntersectionObserver trigger,
 * eased cubic-out ramp, and instant prefers-reduced-motion fallback.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  durationMs = 750,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number>(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return undefined;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce || value === 0) {
      setDisplay(value);
      hasAnimated.current = true;
      return undefined;
    }

    let raf = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || hasAnimated.current) return;
        hasAnimated.current = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          // Strong ease-out matching emilkowalski/skills curve
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            setDisplay(value);
          }
        };
        setDisplay(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={cn("tabular inline-flex items-baseline", className)}>
      {prefix && <span>{prefix}</span>}
      <span>{display.toLocaleString("en-NG")}</span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
