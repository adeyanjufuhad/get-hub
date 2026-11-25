"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Grainient from "@/components/reactbits/Grainient";

const LIGHT_COLORS = ["#FAF9F5", "#FFF7ED", "#FFEDD5", "#FDBA74", "#F97316"];
const DARK_COLORS = ["#0F1012", "#26120B", "#7C2D12", "#C2410C", "#FB923C"];

export function HeroGrainientBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: isDark
          ? "radial-gradient(65% 80% at 50% 0%, rgba(234,88,12,0.22) 0%, #0F1012 100%)"
          : "radial-gradient(65% 80% at 50% 0%, rgba(249,115,22,0.14) 0%, #FAF9F5 100%)",
      }}
    >
      <Grainient
        colors={isDark ? DARK_COLORS : LIGHT_COLORS}
        type="linear"
        angle={55}
        flow={0.8}
        silk={0.35}
        speed={reducedMotion ? 0 : 0.75}
        grainAmount={isDark ? 0.08 : 0.05}
        grainSize={1.2}
        contrast={isDark ? 1 : 0.96}
        saturation={isDark ? 1 : 0.85}
        interactive={!reducedMotion}
        stir={0.85}
        clickSwirl={!reducedMotion}
        intro={!reducedMotion}
        dpr={1.5}
        className="opacity-65 dark:opacity-55"
      />

      {/* Soft eased wash + bottom blend into warm cream canvas so hero typography stays razor-sharp */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, rgba(15,16,18,0.18) 0%, rgba(15,16,18,0.45) 65%, #0F1012 100%)"
            : "linear-gradient(to bottom, rgba(250,249,245,0.34) 0%, rgba(250,249,245,0.62) 65%, #FAF9F5 100%)",
        }}
      />
    </div>
  );
}
