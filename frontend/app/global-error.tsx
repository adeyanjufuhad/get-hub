"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-[#F8F8F6] px-4 text-center text-[#141413]">
        <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-sm text-[#4B5563]">
          An unexpected error interrupted this page. Try reloading.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#141413] px-5 text-sm font-semibold text-white cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
