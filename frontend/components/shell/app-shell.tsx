"use client";

import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Home,
  LogOut,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { GlassTabBar } from "@/components/shell/glass-tab-bar";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { BrandLogo } from "@/components/ui/brand-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { APP_NAME, normalizeDepartment } from "@/lib/config";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/courses", label: "Notes", icon: BookOpen },
  { href: "/tests", label: "Tests", icon: ClipboardCheck },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

function isNavItemActive(href: string, pathname: string): boolean {
  const isAssessmentRoute =
    pathname === "/tests" ||
    pathname.startsWith("/tests/") ||
    pathname.startsWith("/practice/") ||
    pathname.startsWith("/mock-exams/") ||
    pathname.endsWith("/mock-exam");

  if (href === "/tests") {
    return isAssessmentRoute;
  }
  if (href === "/courses") {
    return !isAssessmentRoute && (pathname === "/courses" || pathname.startsWith("/courses/"));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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


  return (
    <div className="min-h-dvh overflow-x-clip bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop slim left icon rail (md+, expands on hover/focus) */}
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
          "fixed inset-y-0 left-0 z-40 hidden flex-col justify-between overflow-hidden border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-4 md:flex",
          sidebarExpanded
            ? "w-[220px] shadow-[12px_0_32px_rgba(20,20,19,0.08)] dark:shadow-[12px_0_36px_rgba(0,0,0,0.42)]"
            : "w-[70px]"
        )}
      >
        <div className="flex w-full flex-col gap-6">
          <Link
            href="/dashboard"
            aria-label={APP_NAME}
            className="pressable flex w-full items-center overflow-hidden rounded-[12px]"
          >
            <BrandLogo size="lg" className="rounded-[12px]" />
            <div
              className={cn(
                "ml-3 flex min-w-0 flex-col transition-[opacity,transform] duration-150 ease-[var(--ease-out)]",
                sidebarExpanded
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-1 opacity-0"
              )}
            >
              <span
                translate="no"
                className="truncate text-sm font-extrabold tracking-tight text-[var(--text-primary)]"
              >
                {APP_NAME}
              </span>
              <span
                translate="no"
                className="truncate font-mono text-[10px] font-medium text-[var(--text-muted)]"
              >
                OAU 200L
              </span>
            </div>
          </Link>

          <nav className="flex w-full flex-col gap-1.5" aria-label="Main navigation">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={sidebarExpanded ? undefined : item.label}
                  className={cn(
                    "pressable flex h-11 w-full items-center overflow-hidden rounded-[12px]",
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap pr-3 text-sm font-semibold transition-[opacity,transform] duration-150 ease-[var(--ease-out)]",
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

        <div className="flex w-full flex-col gap-2">
          <ThemeToggle variant="rail" expanded={sidebarExpanded} />
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              title={sidebarExpanded ? undefined : "Sign out"}
              aria-label="Sign out"
              className="pressable flex h-11 w-full items-center overflow-hidden rounded-[12px] border border-[var(--border-hairline)] text-[var(--text-muted)] hover:border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] cursor-pointer"
            >
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "whitespace-nowrap pr-3 text-sm font-semibold transition-[opacity,transform] duration-150 ease-[var(--ease-out)]",
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
      <div className="min-w-0 md:pl-[70px]">
        {/* Mobile & Tablet Top Bar */}
        <header className="translucent-chrome safe-top sticky top-0 z-20 border-b border-[var(--border-hairline)]/80 bg-[var(--bg-canvas)]/92 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3.5 sm:px-6">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex min-h-[44px] min-w-0 items-center gap-2 md:hidden"
            >
              <BrandLogo size="sm" />
              <span translate="no" className="truncate text-sm font-extrabold tracking-tight">
                {APP_NAME}
              </span>
            </Link>

            <div className="hidden text-xs font-medium text-[var(--text-muted)] md:block">
              {user ? (
                `${normalizeDepartment(user.department)} · ${user.level}`
              ) : (
                <>
                  <span translate="no">{APP_NAME}</span> · OAU 200L Engineering
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="md:hidden">
                <ThemeToggle />
              </div>
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/profile"
                    translate="no"
                    aria-label={`Your profile (${user.full_name})`}
                    title="Your profile"
                    className="pressable shrink-0 rounded-[12px] hover:opacity-90"
                  >
                    <UserAvatar user={user} className="h-9 w-9 rounded-[12px] text-xs" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] md:hidden cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="pressable inline-flex min-h-[40px] items-center rounded-[12px] bg-[var(--ink-cta)] px-4 text-xs font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto min-w-0 max-w-5xl px-3.5 pb-28 pt-4 outline-none sm:px-6 md:pb-12 md:pt-7"
        >
          {children}
        </main>
      </div>

      {/* Floating liquid-glass tab bar (phones and small tablets) */}
      <nav
        aria-label="Mobile navigation"
        className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-3 md:hidden"
      >
        <div className="pointer-events-auto w-full max-w-[420px]">
          <GlassTabBar
            tabs={visibleItems}
            activeIndex={visibleItems.findIndex((item) => isNavItemActive(item.href, pathname))}
          />
        </div>
      </nav>
    </div>
  );
}
