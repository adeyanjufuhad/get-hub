"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface BlurTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}

/**
 * React Bits BlurText — scroll-triggered word-by-word deblur + lift entrance
 * (GPU-friendly opacity/transform/blur under 8px, instant on prefers-reduced-motion).
 */
export function BlurText({ text, className, as: Tag = "h2" }: BlurTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className={cn(
            "inline-block will-change-[transform,opacity,filter]",
            idx < words.length - 1 && "mr-[0.26em]"
          )}
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(6px)",
            transform: visible ? "translate3d(0,0,0)" : "translate3d(0,8px,0)",
            transitionProperty: "opacity, transform, filter",
            transitionDuration: "380ms",
            transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            transitionDelay: `${Math.min(idx * 35, 280)}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
