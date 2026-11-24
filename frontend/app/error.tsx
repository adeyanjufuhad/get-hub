"use client";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-canvas)] px-4 text-center text-[var(--text-primary)]">
      <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
        An unexpected error interrupted this page. Try reloading.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="pressable mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[var(--ink-cta)] px-5 text-sm font-semibold text-[var(--ink-cta-text)] cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
