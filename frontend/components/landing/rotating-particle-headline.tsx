"use client";

import { useEffect, useState } from "react";
import ParticleText from "@/components/reactbits/ParticleText";

// Same rhythm and similar length so the line never jumps in width.
const PHRASES = ["step by step.", "topic by topic.", "drill by drill.", "test by test."];

/** How long each phrase stays up, including its ~1.8s gather-in. */
const HOLD_MS = 5000;

/**
 * The hero's particle line, cycling through phrases. ParticleText re-samples and
 * replays its gather intro whenever `text` changes, so each phrase re-forms from
 * scattered particles. Pauses while the tab is hidden; stays on the first phrase
 * for people who prefer reduced motion.
 */
export function RotatingParticleHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % PHRASES.length);
      }
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ParticleText
      text={PHRASES[index] ?? PHRASES[0]}
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
  );
}
