import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-canvas)] px-4 text-center">
      {/* Concentric card: Outer 28px = Inner 12px + Padding 16px (p-4) */}
      <div className="w-full max-w-sm rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5">
        <p className="font-mono text-xs font-bold text-[var(--accent)]">404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] text-pretty">
          That topic or route doesn&apos;t exist yet. Head back to the courses list or dashboard.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-4 text-sm font-semibold text-[var(--ink-cta-text)] hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/courses"
            className="pressable inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
