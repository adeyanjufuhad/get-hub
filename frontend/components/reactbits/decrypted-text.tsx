"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const ENGINEERING_CHARS = "∑∫∂ΔθπΩλ±∞0123456789ABCDEF";

export interface DecryptedTextProps {
  text: string;
  speed?: number;
  characters?: string;
  animateOnMount?: boolean;
  className?: string;
  encryptedClassName?: string;
}

/**
 * React Bits DecryptedText — technical glyph-scramble decode micro-interaction.
 * Reveals character-by-character on mount and replays cleanly on hover/tap.
 */
export function DecryptedText({
  text,
  speed = 38,
  characters = ENGINEERING_CHARS,
  animateOnMount = true,
  className,
  encryptedClassName,
}: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);
  const [revealedCount, setRevealedCount] = useState(text.length);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDecode = useCallback(() => {
    const reduce =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    if (reduce) {
      setDisplay(text);
      setRevealedCount(text.length);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    let step = 0;
    const totalSteps = text.length * 2;

    timerRef.current = setInterval(() => {
      step += 1;
      const locked = Math.floor(step / 2);
      setRevealedCount(locked);

      const next = text
        .split("")
        .map((char, idx) => {
          if (char === " ") return " ";
          if (idx < locked) return char;
          const randIdx = Math.floor(Math.random() * characters.length);
          return characters[randIdx] ?? char;
        })
        .join("");

      setDisplay(next);

      if (step >= totalSteps) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setDisplay(text);
        setRevealedCount(text.length);
      }
    }, speed);
  }, [text, speed, characters]);

  useEffect(() => {
    if (animateOnMount) {
      const kickoff = setTimeout(runDecode, 160);
      return () => {
        clearTimeout(kickoff);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [animateOnMount, runDecode]);

  return (
    <span
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") runDecode();
      }}
      onClick={runDecode}
      className={cn("inline-flex cursor-pointer select-none", className)}
      aria-label={text}
    >
      {display.split("").map((char, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          className={cn(
            idx >= revealedCount && "font-mono opacity-80",
            idx >= revealedCount && encryptedClassName
          )}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
