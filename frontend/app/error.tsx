"use client";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-canvas)] px-4 text-center text-[var(--text-primary)]">
      <div className="w-full max-w-sm rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] text-pretty">
          An unexpected error interrupted this page. Try reloading.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="pressable mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)] hover:opacity-90 cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
