"use client";

import {
  BarChart3,
  BookOpen,
  Home,
  Library,
  LogOut,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { BrandLogo } from "@/components/ui/brand-logo";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/config";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  matchPrefix?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home, matchPrefix: "/dashboard" },
  { href: "/courses", label: "Courses", icon: BookOpen, matchPrefix: "/courses" },
  { href: "/library", label: "Library", icon: Library, matchPrefix: "/library" },
  { href: "/progress", label: "Progress", icon: BarChart3, matchPrefix: "/progress" },
  { href: "/admin", label: "Admin", icon: Shield, matchPrefix: "/admin", adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => clearCloseTimer, []);

  const handleSidebarPointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    clearCloseTimer();
    setSidebarExpanded(true);
  };

  const handleSidebarPointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setSidebarExpanded(false);
    }, 140);
  };

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    toast.success("Signed out");
    router.push("/login");
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
    : "GH";

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Desktop slim left icon rail (md+, expands smoothly on hover/focus) */}
      <aside
        onPointerEnter={handleSidebarPointerEnter}
        onPointerLeave={handleSidebarPointerLeave}
        onFocus={() => {
          clearCloseTimer();
          setSidebarExpanded(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setSidebarExpanded(false);
          }
        }}
        data-expanded={sidebarExpanded ? "true" : "false"}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col justify-between overflow-hidden border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-5 transition-[width,box-shadow] duration-[240ms] ease-[var(--ease-out)] md:flex",
          sidebarExpanded
            ? "w-[228px] shadow-[12px_0_32px_rgba(20,20,19,0.08)] dark:shadow-[12px_0_36px_rgba(0,0,0,0.42)]"
            : "w-[76px]"
        )}
      >
        <div className="flex w-full flex-col gap-6">
          <Link
            href="/dashboard"
            aria-label={APP_NAME}
            className="pressable flex w-full items-center overflow-hidden rounded-2xl"
          >
            <BrandLogo size="lg" />
            <div
              className={cn(
                "ml-3 flex min-w-0 flex-col transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
                sidebarExpanded
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-1 opacity-0"
              )}
            >
              <span className="truncate text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
                {APP_NAME}
              </span>
              <span className="truncate font-mono text-[10px] font-medium text-[var(--text-muted)]">
                OAU 200L
              </span>
            </div>
          </Link>

          <nav className="flex w-full flex-col gap-2" aria-label="Main navigation">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.matchPrefix && pathname.startsWith(item.matchPrefix));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={sidebarExpanded ? undefined : item.label}
                  className={cn(
                    "pressable flex h-11 w-full items-center overflow-hidden rounded-2xl",
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap pr-3.5 text-sm font-semibold transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
                      sidebarExpanded
                        ? "translate-x-0 opacity-100"
                        : "pointer-events-none -translate-x-1 opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex w-full flex-col gap-3">
          <ThemeToggle variant="rail" expanded={sidebarExpanded} />
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              title={sidebarExpanded ? undefined : "Sign out"}
              aria-label="Sign out"
              className="pressable flex h-11 w-full items-center overflow-hidden rounded-full border border-[var(--border-hairline)] text-[var(--text-muted)] hover:border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] cursor-pointer"
            >
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center">
                <LogOut className="h-4 w-4" />
              </span>
              <span
                className={cn(
                  "whitespace-nowrap pr-3.5 text-sm font-semibold transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
                  sidebarExpanded
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none -translate-x-1 opacity-0"
                )}
              >
                Sign out
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-[76px]">
        {/* Mobile & Tablet Top Bar */}
        <header className="safe-top sticky top-0 z-20 border-b border-[var(--border-hairline)]/80 bg-[var(--bg-canvas)]/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href={user ? "/dashboard" : "/"} className="flex min-h-[44px] items-center gap-2 md:hidden">
              <BrandLogo size="sm" />
              <span className="text-sm font-extrabold tracking-tight">{APP_NAME}</span>
            </Link>

            <div className="hidden text-xs font-medium text-[var(--text-muted)] md:block">
              {user ? `${user.department} · ${user.level}` : `${APP_NAME} · OAU 200L Engineering`}
            </div>

            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <ThemeToggle />
              </div>
              {user ? (
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: user.avatar_color || "#EA580C" }}
                    title={user.full_name}
                  >
                    {initials}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] md:hidden cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="pressable inline-flex min-h-[40px] items-center rounded-full bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)]"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 md:pb-12 md:pt-7">
          {children}
        </main>
      </div>

      {/* Floating Ink-Black Mobile Bottom Pill Dock (Pinterest Studia/Nixtio + safe-area) */}
      <nav
        aria-label="Mobile navigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-3 pt-1 md:hidden pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-[#141413] p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.22)] dark:border dark:border-white/15">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.matchPrefix && pathname.startsWith(item.matchPrefix));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "pressable flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-[background-color,padding] duration-200",
                  active ? "bg-[#EA580C] px-4 text-white" : "px-3 text-neutral-300 hover:text-white"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {/* Only the active tab shows its label, so 5–6 tabs still fit a 320px phone */}
                <span className={cn(!active && "sr-only")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
