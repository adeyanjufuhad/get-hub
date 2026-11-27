"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface AnimatedListEntry {
  id: string;
  title: string;
  meta?: string;
  badge?: string;
}

export interface AnimatedListProps {
  items: AnimatedListEntry[];
  selectedIndex?: number;
  onSelect?: (item: AnimatedListEntry, index: number) => void;
  maxHeightClass?: string;
  className?: string;
}

/**
 * React Bits AnimatedList (adapted for GET Hub light UI: eased scroll edge gradients,
 * keyboard arrow navigation, touch-safe selection, zero heavy runtime).
 */
export function AnimatedList({
  items,
  selectedIndex: controlledIndex,
  onSelect,
  maxHeightClass = "max-h-[268px]",
  className,
}: AnimatedListProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const selected = controlledIndex ?? internalIndex;
  const listRef = useRef<HTMLDivElement>(null);
  const topFadeRef = useRef<HTMLDivElement>(null);
  const bottomFadeRef = useRef<HTMLDivElement>(null);

  // Direct DOM opacity update — zero React re-renders per scroll frame (animation-performance)
  const updateFades = () => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const topOpacity = Math.min(1, scrollTop / 36);
    const remaining = scrollHeight - (scrollTop + clientHeight);
    const bottomOpacity = scrollHeight <= clientHeight + 2 ? 0 : Math.min(1, remaining / 36);
    if (topFadeRef.current) topFadeRef.current.style.opacity = String(topOpacity);
    if (bottomFadeRef.current) bottomFadeRef.current.style.opacity = String(bottomOpacity);
  };

  useEffect(() => {
    updateFades();
  }, [items]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (selected + 1) % items.length;
      setInternalIndex(next);
      const item = items[next];
      if (item) onSelect?.(item, next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (selected - 1 + items.length) % items.length;
      setInternalIndex(prev);
      const item = items[prev];
      if (item) onSelect?.(item, prev);
    }
  };

  return (
    /* Concentric list box: Outer 20px = Inner 12px + Padding 8px (p-2) */
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)]",
        className
      )}
    >
      <div
        ref={listRef}
        tabIndex={0}
        onScroll={updateFades}
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-label="Curriculum topics"
        className={cn(
          "space-y-1.5 overflow-y-auto overscroll-contain p-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]",
          maxHeightClass
        )}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selected;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                setInternalIndex(idx);
                onSelect?.(item, idx);
              }}
              className={cn(
                "pressable flex min-h-[46px] w-full items-center justify-between gap-3 rounded-[12px] border px-3 py-2 text-left cursor-pointer",
                isSelected
                  ? "border-[var(--accent)] bg-[var(--bg-surface)]"
                  : "border-transparent bg-transparent hover:bg-[var(--bg-surface)]/60"
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <CheckCircle2
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[var(--text-primary)] sm:text-sm">
                    {item.title}
                  </p>
                  {item.meta && (
                    <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">
                      {item.meta}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
                      isSelected
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    "h-3.5 w-3.5",
                    isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Eased Top & Bottom Scroll Gradients (updated via ref, zero re-render) */}
      <div
        ref={topFadeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-8 transition-opacity duration-150"
        style={{
          opacity: 0,
          background:
            "linear-gradient(to bottom, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 65%, transparent) 55%, transparent 100%)",
        }}
      />
      <div
        ref={bottomFadeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 transition-opacity duration-150"
        style={{
          opacity: 1,
          background:
            "linear-gradient(to top, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 65%, transparent) 55%, transparent 100%)",
        }}
      />
    </div>
  );
}
