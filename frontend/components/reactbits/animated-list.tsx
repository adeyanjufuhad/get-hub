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
  const [topFade, setTopFade] = useState(0);
  const [bottomFade, setBottomFade] = useState(1);

  const updateFades = () => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setTopFade(Math.min(1, scrollTop / 36));
    const remaining = scrollHeight - (scrollTop + clientHeight);
    setBottomFade(scrollHeight <= clientHeight + 2 ? 0 : Math.min(1, remaining / 36));
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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]",
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
          "space-y-1.5 overflow-y-auto overscroll-contain p-2 focus:outline-none",
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
                "pressable flex min-h-[46px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left cursor-pointer",
                isSelected
                  ? "border-[var(--accent)] bg-[var(--bg-surface)] shadow-xs"
                  : "border-transparent bg-transparent"
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <CheckCircle2
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
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-150",
                    isSelected ? "translate-x-0.5 text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Eased Top & Bottom Scroll Gradients (emilkowalski/skills ui-cheatsheet) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-8 transition-opacity duration-200"
        style={{
          opacity: topFade,
          background:
            "linear-gradient(to bottom, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 65%, transparent) 55%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 transition-opacity duration-200"
        style={{
          opacity: bottomFade,
          background:
            "linear-gradient(to top, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 65%, transparent) 55%, transparent 100%)",
        }}
      />
    </div>
  );
}
