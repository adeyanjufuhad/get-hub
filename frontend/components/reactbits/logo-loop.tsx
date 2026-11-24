import { cn } from "@/lib/cn";

export interface LogoLoopItem {
  code: string;
  name: string;
}

export interface LogoLoopProps {
  items: readonly LogoLoopItem[];
  className?: string;
}

/**
 * React Bits LogoLoop — continuous GPU-composited marquee loop with eased fade masks and pause-on-hover.
 */
export function LogoLoop({ items, className }: LogoLoopProps) {
  const duplicated = [...items, ...items];

  return (
    <div
      className={cn(
        "rb-logo-loop group relative mx-auto w-full max-w-3xl overflow-hidden py-1",
        className
      )}
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div className="rb-logo-loop-track flex w-max items-center gap-2.5">
        {duplicated.map((item, idx) => (
          <span
            key={`${item.code}-${idx}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/90 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] backdrop-blur-xs"
          >
            <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
              {item.code}
            </span>
            <span className="text-[11px]">{item.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
