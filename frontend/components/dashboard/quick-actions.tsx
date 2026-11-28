"use client";

import { ArrowUpRight, BarChart3, ClipboardCheck, FolderOpen, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useIsDark } from "@/components/landing/reactbits-showcase";
import PixelCard from "@/components/reactbits/pixel-card";

interface QuickAction {
  href: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

const LIGHT_PIXELS = ["#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C"];
const DARK_PIXELS = ["#431407", "#7C2D12", "#C2410C", "#FB923C"];

/**
 * Dashboard shortcuts built on React Bits PixelCard: an orange pixel field
 * reveals from the pointer on hover, over the app's own surface tokens.
 */
export function QuickActions({ weakCount }: { weakCount: number }) {
  const isDark = useIsDark();

  const actions: QuickAction[] = [
    {
      href: "/tests",
      title: "Test center",
      body: "Timed 5, 10 or 15-question CBT papers.",
      icon: ClipboardCheck,
    },
    {
      href: "/progress",
      title: "Progress analytics",
      body:
        weakCount > 0
          ? `${weakCount} ${weakCount === 1 ? "topic needs" : "topics need"} review.`
          : "Accuracy by topic and course.",
      icon: BarChart3,
    },
    {
      href: "/library",
      title: "Part 2 library",
      body: "Handouts, lab manuals and past questions.",
      icon: FolderOpen,
    },
  ];

  return (
    <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <PixelCard
            key={action.href}
            theme={isDark ? "dark" : "light"}
            colors={isDark ? DARK_PIXELS : LIGHT_PIXELS}
            gap={7}
            speed={35}
            origin="pointer"
            radius={20}
            intro={false}
            noFocus
            className="!place-items-stretch border border-[var(--border-hairline)]"
            style={{ width: "100%", height: "auto", background: "var(--bg-surface)", boxShadow: "none" }}
          >
            <Link
              href={action.href}
              className="group/qa flex min-h-[104px] flex-col justify-between rounded-[20px] p-4 outline-offset-[-2px]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ease-[var(--ease-out)] group-hover/qa:-translate-y-0.5 group-hover/qa:translate-x-0.5 group-hover/qa:text-[var(--accent)]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{action.title}</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{action.body}</p>
              </div>
            </Link>
          </PixelCard>
        );
      })}
    </section>
  );
}
