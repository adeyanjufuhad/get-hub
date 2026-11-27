"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/config";

const NAV_LINKS = [
  { href: "#courses", label: "Courses" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function ExpandingPillNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="safe-top pointer-events-none fixed inset-x-0 top-0 z-50 mt-3 flex flex-col items-center px-3 sm:mt-4 sm:px-6">
        {/* Concentric floating navbar: Outer 18px = Inner 12px + Padding 6px (p-1.5) */}
        <div
          className={cn(
            "translucent-chrome pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-2 rounded-[18px] border p-1.5 backdrop-blur-xl backdrop-saturate-150",
            "border-black/[0.08] bg-white/82 shadow-[0_8px_24px_rgba(20,20,19,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]",
            "dark:border-white/[0.12] dark:bg-[#181A1E]/82 dark:shadow-[0_10px_28px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)]"
          )}
        >
          {/* Brand */}
          <Link
            href="/"
            className="pressable flex min-h-[40px] shrink-0 items-center gap-2 rounded-[12px] pl-1 pr-2.5"
          >
            <BrandLogo size="sm" />
            <span
              translate="no"
              className="text-sm font-extrabold tracking-tight text-[var(--text-primary)]"
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation (always visible — clear wayfinding, zero layout thrash) */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] px-3 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="hidden items-center gap-1.5 md:flex">
              <ThemeToggle />
              <Link
                href="/login"
                className="pressable inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[12px] border border-transparent px-3 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                Log in
              </Link>
            </div>

            <Link
              href="/signup"
              className="pressable inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[12px] bg-[var(--ink-cta)] px-3.5 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90 sm:px-4"
            >
              <span>Start free</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] md:hidden cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Popover: Outer 24px = Inner 12px + Padding 12px (p-3) */}
        {mobileOpen && (
          <div
            className={cn(
              "popover-enter translucent-chrome pointer-events-auto mt-2 w-full max-w-5xl overscroll-contain rounded-[24px] border p-3 backdrop-blur-xl backdrop-saturate-150 md:hidden",
              "border-black/[0.08] bg-white/95 shadow-[0_14px_36px_rgba(20,20,19,0.12)]",
              "dark:border-white/[0.12] dark:bg-[#181A1E]/95 dark:shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
            )}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile menu">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="pressable flex min-h-[44px] items-center rounded-[12px] px-3.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="pressable inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                Log in
              </Link>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
