"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Grainient from "@/components/reactbits/Grainient";

const LIGHT_COLORS = ["#F8F8F6", "#FFF7ED", "#FFEDD5", "#FDBA74", "#F97316"];
const DARK_COLORS = ["#0F1012", "#26120B", "#7C2D12", "#C2410C", "#FB923C"];

export function HeroGrainientBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: isDark
          ? "radial-gradient(65% 80% at 50% 0%, rgba(234,88,12,0.22) 0%, #0F1012 100%)"
          : "radial-gradient(65% 80% at 50% 0%, rgba(249,115,22,0.16) 0%, #F8F8F6 100%)",
      }}
    >
      <Grainient
        colors={isDark ? DARK_COLORS : LIGHT_COLORS}
        type="linear"
        angle={55}
        flow={0.8}
        silk={0.35}
        speed={0.75}
        grainAmount={isDark ? 0.08 : 0.055}
        grainSize={1.2}
        contrast={isDark ? 1 : 0.96}
        saturation={isDark ? 1 : 0.85}
        interactive={true}
        stir={0.85}
        clickSwirl={true}
        intro={true}
        dpr={1.5}
        className="opacity-70 dark:opacity-55"
      />

      {/* Soft eased wash + bottom blend into page canvas so hero typography stays razor-sharp */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, rgba(15,16,18,0.18) 0%, rgba(15,16,18,0.45) 65%, #0F1012 100%)"
            : "linear-gradient(to bottom, rgba(248,248,246,0.32) 0%, rgba(248,248,246,0.58) 65%, #F8F8F6 100%)",
        }}
      />
    </div>
  );
}
