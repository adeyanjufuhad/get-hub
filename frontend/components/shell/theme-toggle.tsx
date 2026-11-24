"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface ThemeToggleProps {
  variant?: "icon" | "rail";
  expanded?: boolean;
}

export function ThemeToggle({ variant = "icon", expanded = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Light mode" : "Dark mode";
  const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "rail") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={expanded ? undefined : ariaLabel}
        aria-label={ariaLabel}
        className="pressable flex h-11 w-full items-center overflow-hidden rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center text-[var(--text-primary)]">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </span>
        <span
          className={cn(
            "whitespace-nowrap pr-3.5 text-sm font-semibold transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
            expanded
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-1 opacity-0"
          )}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={ariaLabel}
      className="pressable inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
