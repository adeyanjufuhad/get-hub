"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/config";

const NAV_LINKS = [
  { href: "#courses", label: "Courses" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function ExpandingPillNav() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const handlePointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    setExpanded(true);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setExpanded(false);
    }, 180);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="safe-top pointer-events-none fixed inset-x-0 top-0 z-50 mt-3 flex flex-col items-center px-3 sm:mt-[20px] sm:px-4">
      {/* Frosted Glass Floating Pill (compact by default, expands smoothly on hover/focus on desktop) */}
      <div
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={() => {
          clearTimer();
          setExpanded(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setExpanded(false);
          }
        }}
        className={cn(
          "pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center rounded-full border px-1.5 py-1.5 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,background-color,border-color] duration-200 ease-[var(--ease-out)] sm:max-w-[calc(100vw-2rem)] sm:px-2",
          "border-black/[0.08] bg-white/70 shadow-[0_8px_28px_rgba(20,20,19,0.08),inset_0_1px_0_rgba(255,255,255,0.85)]",
          "dark:border-white/[0.12] dark:bg-[#181A1E]/72 dark:shadow-[0_10px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]"
        )}
      >
        {/* Brand (always visible inside the compact pill) */}
        <Link
          href="/"
          className="pressable flex min-h-[40px] shrink-0 items-center rounded-full px-2.5 sm:px-3"
        >
          <span
            translate="no"
            className="text-xs font-extrabold tracking-tight text-[var(--text-primary)] min-[360px]:text-sm"
          >
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Expanding Middle + Actions (reveals smoothly on hover/focus) */}
        <div
          className={cn(
            "hidden overflow-hidden transition-[grid-template-columns,opacity] duration-300 ease-[var(--ease-out)] md:grid",
            expanded ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"
          )}
        >
          <div className="flex min-w-0 items-center overflow-hidden">
            <span className="mx-1.5 h-4 w-px shrink-0 bg-[var(--border-hairline)]" aria-hidden="true" />
            <nav className="flex shrink-0 items-center gap-1 px-1" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="pressable inline-flex min-h-[38px] items-center whitespace-nowrap rounded-full px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-black/[0.05] hover:text-[var(--text-primary)] dark:hover:bg-white/[0.08]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <span className="mx-1.5 h-4 w-px shrink-0 bg-[var(--border-hairline)]" aria-hidden="true" />

            <div className="flex shrink-0 items-center gap-1.5 pl-1 pr-1">
              <div className="scale-90">
                <ThemeToggle shape="pill" />
              </div>
              <Link
                href="/login"
                className="pressable inline-flex min-h-[38px] items-center whitespace-nowrap rounded-full px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>

        {/* Always-present compact CTA inside the pill */}
        <Link
          href="/signup"
          className="pressable ml-1 inline-flex min-h-[40px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--ink-cta)] px-3 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90 sm:gap-1.5 sm:px-4"
        >
          <span>Start free</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        {/* Mobile Menu Trigger (tap to expand on touch devices) */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="pressable ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/80 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] sm:ml-1.5 md:hidden cursor-pointer"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Expanded Frosted Drawer Pill */}
      {mobileOpen && (
        <div
          className={cn(
            "pointer-events-auto mt-2.5 w-full max-w-[calc(100vw-1.5rem)] overscroll-contain rounded-[24px] border p-3 backdrop-blur-xl backdrop-saturate-150 sm:max-w-xs md:hidden",
            "border-black/[0.08] bg-white/90 shadow-[0_14px_36px_rgba(20,20,19,0.12)]",
            "dark:border-white/[0.12] dark:bg-[#181A1E]/92 dark:shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
          )}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile menu">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="pressable flex min-h-[44px] items-center rounded-xl px-3.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-2.5">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="pressable inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              Log in
            </Link>
            <ThemeToggle shape="pill" />
          </div>
        </div>
      )}
      </header>
    </>
  );
}
