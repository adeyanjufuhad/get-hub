"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF9F5] px-4 text-center text-[#141413]">
        <div className="w-full max-w-sm rounded-[28px] border border-[#E6E2D8] bg-white p-4 sm:rounded-[32px] sm:p-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#3D3D3A]">
            An unexpected error interrupted this page. Try reloading.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-[#141413] px-5 text-sm font-semibold text-[#FAF9F5] cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
