"use client";

import {
  BarChart3,
  BookOpen,
  Compass,
  Home,
  LogOut,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { ThemeToggle } from "@/components/shell/theme-toggle";
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
  { href: "/progress", label: "Progress", icon: BarChart3, matchPrefix: "/progress" },
  { href: "/admin", label: "Admin", icon: Shield, matchPrefix: "/admin", adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();

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
      {/* Desktop slim left icon rail (md+) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center justify-between border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] py-5 md:flex">
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/dashboard"
            aria-label={APP_NAME}
            className="pressable flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
          >
            <Compass className="h-5 w-5" />
          </Link>

          <nav className="flex flex-col items-center gap-2" aria-label="Main navigation">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.matchPrefix && pathname.startsWith(item.matchPrefix));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "pressable flex h-11 w-11 items-center justify-center rounded-2xl",
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3">
          <ThemeToggle />
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-hairline)] text-[var(--text-muted)] cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-[76px]">
        {/* Mobile & Tablet Top Bar */}
        <header className="safe-top sticky top-0 z-20 border-b border-[var(--border-hairline)]/80 bg-[var(--bg-canvas)]/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--ink-cta)] text-[var(--ink-cta-text)]">
                <Compass className="h-4 w-4" />
              </span>
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
                className={cn(
                  "pressable flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-xs font-semibold",
                  active ? "bg-[#EA580C] text-white" : "text-neutral-300"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
