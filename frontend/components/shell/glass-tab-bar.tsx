"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import GlassSurface from "@/components/reactbits/glass-surface";
import { cn } from "@/lib/cn";

export interface GlassTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Pixels the finger must travel before a press turns into a drag. */
const DRAG_THRESHOLD = 6;

/**
 * iOS-style "liquid glass" tab bar: a floating glass pill (React Bits GlassSurface)
 * with a glass selection lens. Tap a tab, or press anywhere on the bar and slide the
 * lens across the tabs; it lifts while held and snaps to the nearest tab on release.
 */
export function GlassTabBar({ tabs, activeIndex }: { tabs: GlassTab[]; activeIndex: number }) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Lens geometry, relative to the track.
  const [rects, setRects] = useState<{ left: number; width: number }[]>([]);
  const [dragX, setDragX] = useState<number | null>(null); // lens centre while dragging
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null); // optimistic index until the route changes
  const drag = useRef<{ id: number; startX: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const base = track.getBoundingClientRect().left;
    setRects(
      tabRefs.current.map((el) => {
        const r = el?.getBoundingClientRect();
        return r ? { left: r.left - base, width: r.width } : { left: 0, width: 0 };
      })
    );
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, tabs.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  // Once navigation lands, the real active index takes over again.
  useEffect(() => setPending(null), [activeIndex]);

  const shownIndex = pending ?? activeIndex;

  const nearestIndex = (x: number) => {
    let best = 0;
    let bestDist = Infinity;
    rects.forEach((r, i) => {
      const d = Math.abs(r.left + r.width / 2 - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const localX = (clientX: number) => clientX - (trackRef.current?.getBoundingClientRect().left ?? 0);

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    suppressClick.current = false;
    drag.current = { id: e.pointerId, startX: e.clientX, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.startX) < DRAG_THRESHOLD) return;
      d.moved = true;
      trackRef.current?.setPointerCapture(e.pointerId);
    }
    const first = rects[0];
    const last = rects[rects.length - 1];
    if (!first || !last) return;
    const x = Math.min(last.left + last.width / 2, Math.max(first.left + first.width / 2, localX(e.clientX)));
    setDragX(x);
    setHoverIndex(nearestIndex(x));
  }

  function endDrag(e: React.PointerEvent, cancelled = false) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.moved) return;
    // A completed drag's pointerup would otherwise click the tab under the finger.
    // A cancelled one produces no click, so don't arm the guard (it would eat the next tap).
    suppressClick.current = !cancelled;
    const target = nearestIndex(dragX ?? localX(e.clientX));
    setDragX(null);
    setHoverIndex(null);
    if (!cancelled && target !== activeIndex && tabs[target]) {
      setPending(target);
      router.push(tabs[target].href);
    }
  }

  function onClickCapture(e: React.MouseEvent) {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // Arrow keys move focus between tabs, like a native tab bar.
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const current = tabRefs.current.findIndex((el) => el === document.activeElement);
    if (current < 0) return;
    e.preventDefault();
    const next = (current + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabRefs.current[next]?.focus();
  }

  const dragging = dragX !== null;
  const rect = rects[shownIndex];
  const lensWidth = rect?.width ?? 0;
  const lensLeft = dragging ? dragX - lensWidth / 2 : (rect?.left ?? 0);
  const litIndex = dragging ? hoverIndex : shownIndex;

  return (
    <GlassSurface
      width="100%"
      height={64}
      borderRadius={32}
      // Refraction stays strongest at the rim (borderWidth); displace frosts the
      // middle and backgroundOpacity tints it so labels stay legible over any content.
      borderWidth={0.09}
      brightness={55}
      opacity={0.9}
      blur={8}
      displace={4}
      backgroundOpacity={0.42}
      saturation={1.7}
      distortionScale={-80}
      className="shadow-[0_12px_36px_-10px_rgba(20,20,19,0.35)] dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.7)]"
    >
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e)}
        onPointerCancel={(e) => endDrag(e, true)}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        className="relative flex h-full w-full touch-none select-none items-stretch [-webkit-tap-highlight-color:transparent]"
      >
        {/* Selection lens */}
        {rect && rect.width > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 rounded-full",
              "bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.05),0_4px_14px_-4px_rgba(0,0,0,0.25)]",
              "dark:bg-white/[0.14] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_14px_-4px_rgba(0,0,0,0.5)]",
              "backdrop-blur-[2px] backdrop-saturate-150",
              dragging
                ? "transition-[width,scale] duration-150 ease-out"
                : "transition-[translate,width,scale] duration-500 ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-none"
            )}
            style={{
              width: lensWidth,
              translate: `${lensLeft}px 0`,
              scale: dragging ? "1.12 1.08" : "1",
            }}
          />
        )}

        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const lit = litIndex === i;
          return (
            <Link
              key={tab.href}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={tab.href}
              draggable={false}
              aria-current={i === activeIndex ? "page" : undefined}
              onClick={() => i !== activeIndex && setPending(i)}
              className={cn(
                "relative z-[1] flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold tracking-tight outline-none transition-[color,scale] duration-200",
                "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset",
                lit ? "text-[var(--accent)]" : "text-[var(--text-primary)]/75",
                lit && dragging && "scale-110"
              )}
            >
              <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={lit ? 2.4 : 2} aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </GlassSurface>
  );
}
