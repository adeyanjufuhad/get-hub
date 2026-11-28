"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type SpotlightShape = "circle" | "beam";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  intensity?: number;
  spotlightSize?: number;
  softness?: number;
  shape?: SpotlightShape;
  borderGlow?: number;
  proximity?: number;
  smoothing?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const falloff = (color: string, softness: number) => {
  const soft = clamp(softness, 0, 1);
  const core = (1 - soft) ** 1.5 * 0.85;
  const stop = (alpha: number, at: number) =>
    `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(2)}%, transparent) ${(at * 100).toFixed(2)}%`;
  const list = [stop(1, 0)];
  for (let i = 0; i <= 10; i++) {
    const t = core + ((1 - core) * i) / 10;
    const g = (t - core) / (1 - core);
    const smooth = 1 - g * g * (3 - 2 * g);
    const glow = Math.exp(-4.6 * g * g) * (1 - g ** 6);
    list.push(stop(smooth + (glow - smooth) * soft, t));
  }
  return list.join(", ");
};

/**
 * React Bits SpotlightCard (adapted for GET Hub light/dark CSS tokens + touch-safe fine pointers).
 */
export function SpotlightCard({
  children,
  className,
  style,
  spotlightColor = "#EA580C",
  intensity = 0.14,
  spotlightSize = 240,
  softness = 0.72,
  shape = "circle",
  borderGlow = 0.55,
  proximity = 72,
  smoothing = 0.25,
  ...rest
}: SpotlightCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);

  const settingsRef = useRef({
    shape,
    fill: falloff(spotlightColor, softness),
    edge: falloff(spotlightColor, 1),
    size: Math.max(20, spotlightSize),
    intensity: clamp(intensity, 0, 1),
    borderGlow: clamp(borderGlow, 0, 1),
    proximity: Math.max(0, proximity),
    smoothing: clamp(smoothing, 0, 1),
  });

  settingsRef.current = {
    shape,
    fill: falloff(spotlightColor, softness),
    edge: falloff(spotlightColor, 1),
    size: Math.max(20, spotlightSize),
    intensity: clamp(intensity, 0, 1),
    borderGlow: clamp(borderGlow, 0, 1),
    proximity: Math.max(0, proximity),
    smoothing: clamp(smoothing, 0, 1),
  };

  useEffect(() => {
    const root = rootRef.current;
    const light = lightRef.current;
    const edge = edgeRef.current;
    if (!root || !light || !edge) return undefined;

    // Respect emilkowalski/skills mobile-native: only run pointer spotlight on fine-pointer hover devices
    const canHover = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!canHover) return undefined;

    const state = { x: 0, y: 0, presence: 0, visible: true };
    const pointer = { x: 0, y: 0, active: false };
    const drawn = { light: "", edge: "" };
    let raf = 0;
    let last = 0;
    let alive = true;

    const gradient = (size: number, x: number, y: number, stops: string, form: SpotlightShape) => {
      if (form === "beam") {
        const reach = Math.max(size * 0.6, y + size * 0.55);
        return `radial-gradient(${(size * 0.55).toFixed(1)}px ${reach.toFixed(1)}px at ${x.toFixed(1)}px 0px, ${stops})`;
      }
      return `radial-gradient(circle ${size.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive || !state.visible) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const rect = root.getBoundingClientRect();
      let tx = state.x;
      let ty = state.y;
      let target = 0;

      if (pointer.active) {
        tx = pointer.x - rect.left;
        ty = pointer.y - rect.top;
        const gap = Math.hypot(
          Math.max(0, -tx, tx - rect.width),
          Math.max(0, -ty, ty - rect.height)
        );
        if (gap === 0) target = 1;
        else if (s.proximity > 0) target = Math.max(0, 1 - gap / s.proximity) ** 2;
      }

      if (state.presence < 0.02 && target > 0) {
        state.x = tx;
        state.y = ty;
      }

      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.015 + s.smoothing * 0.2));
      state.x += (tx - state.x) * follow;
      state.y += (ty - state.y) * follow;

      const fade = reduce ? 1 : 1 - Math.exp(-dt / (target > state.presence ? 0.1 : 0.28));
      state.presence += (target - state.presence) * fade;
      if (Math.abs(target - state.presence) < 0.002) state.presence = target;

      const fill = gradient(s.size, state.x, state.y, s.fill, s.shape);
      const rim = gradient(s.size * 0.65, state.x, s.shape === "beam" ? 0 : state.y, s.edge, s.shape);

      if (fill !== drawn.light) {
        drawn.light = fill;
        light.style.background = fill;
      }
      if (rim !== drawn.edge) {
        drawn.edge = rim;
        edge.style.background = rim;
      }
      light.style.opacity = String(Math.min(1, state.presence * s.intensity));
      edge.style.opacity = String(Math.min(1, state.presence * s.borderGlow));

      const moving = Math.abs(tx - state.x) > 0.15 || Math.abs(ty - state.y) > 0.15;
      if (moving || state.presence !== target) {
        raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (raf || !alive || !state.visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (state.presence > 0 || settingsRef.current.proximity > 0 || root.contains(event.target as Node | null)) {
        wake();
      }
    };

    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer.active = false;
      wake();
    };

    const observer = new IntersectionObserver((entries) => {
      state.visible = entries.some((entry) => entry.isIntersecting);
      if (state.visible && pointer.active) wake();
    });

    observer.observe(root);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        // Radius, surface and padding come from the caller (no tailwind-merge here, so defaults would clash).
        "relative isolate overflow-hidden border border-[var(--border-hairline)] transition-[transform,border-color] duration-200 ease-[var(--ease-out)]",
        className
      )}
      style={style}
      {...rest}
    >
      <span
        ref={lightRef}
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0"
        aria-hidden="true"
      />
      {children}
      <span
        ref={edgeRef}
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] p-[1.5px] opacity-0 [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [-webkit-mask-composite:xor] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
        aria-hidden="true"
      />
    </div>
  );
}
