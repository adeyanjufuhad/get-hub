"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MagnetProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * React Bits Magnet — subtle fine-pointer magnetic attraction micro-interaction.
 * Disabled automatically on touch devices and prefers-reduced-motion.
 */
export function Magnet({ children, strength = 0.22, className }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setActive(true);
    setOffset({ x: Math.max(-10, Math.min(10, dx)), y: Math.max(-7, Math.min(7, dy)) });
  };

  const handleLeave = () => {
    setActive(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn("inline-flex", className)}
    >
      <div
        className="w-full"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: active
            ? "transform 120ms cubic-bezier(0.23, 1, 0.32, 1)"
            : "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
