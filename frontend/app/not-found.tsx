import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-canvas)] px-4 text-center">
      <p className="font-mono text-xs font-bold text-[var(--accent)]">404</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
        That topic or route doesn&apos;t exist yet. Head back to the courses list or dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="pressable inline-flex min-h-[44px] items-center rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)]"
        >
          Go home
        </Link>
        <Link
          href="/courses"
          className="pressable inline-flex min-h-[44px] items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-5 text-sm font-semibold text-[var(--text-primary)]"
        >
          Browse courses
        </Link>
      </div>
    </div>
  );
}
