"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
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
 * Continuous GPU-composited marquee loop with accessible pause/resume control
 * (Vercel Web Interface Guidelines >5s autoplay rule + tasteskill [loop-pause]).
 */
export function LogoLoop({ items, className }: LogoLoopProps) {
  const [paused, setPaused] = useState(false);
  const duplicated = [...items, ...items];

  return (
    <div className={cn("mx-auto flex w-full max-w-3xl items-center gap-2", className)}>
      <div
        className="rb-logo-loop group relative min-w-0 flex-1 overflow-hidden py-1"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div
          className="rb-logo-loop-track flex w-max items-center gap-2.5"
          style={paused ? { animationPlayState: "paused" } : undefined}
        >
          {duplicated.map((item, idx) => (
            <span
              key={`${item.code}-${idx}`}
              aria-hidden={idx >= items.length ? "true" : undefined}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
            >
              <span translate="no" className="font-mono text-[11px] font-bold text-[var(--accent)]">
                {item.code}
              </span>
              <span className="text-[11px]">{item.name}</span>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Resume department ticker" : "Pause department ticker"}
        title={paused ? "Resume ticker" : "Pause ticker"}
        className="pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)]/90 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        {paused ? (
          <Play className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Pause className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
