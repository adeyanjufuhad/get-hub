"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children: ReactNode;
}

/**
 * React Bits ClickSpark — featherweight 2D canvas micro-interaction radiating crisp radial ticks on tap/click.
 */
export function ClickSpark({
  sparkColor = "#EA580C",
  sparkSize = 10,
  sparkRadius = 20,
  sparkCount = 8,
  duration = 380,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      rafRef.current = 0;
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const now = performance.now();

    sparksRef.current = sparksRef.current.filter((spark) => {
      const elapsed = now - spark.startTime;
      if (elapsed >= duration) return false;
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3);
      const dist = eased * sparkRadius;
      const lineLen = sparkSize * (1 - eased);

      const x1 = spark.x + dist * Math.cos(spark.angle);
      const y1 = spark.y + dist * Math.sin(spark.angle);
      const x2 = spark.x + (dist + lineLen) * Math.cos(spark.angle);
      const y2 = spark.y + (dist + lineLen) * Math.sin(spark.angle);

      ctx.strokeStyle = sparkColor;
      ctx.globalAlpha = 1 - progress;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      return true;
    });

    ctx.globalAlpha = 1;
    if (sparksRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      rafRef.current = 0;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const reduce =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    if (reduce) return;

    const now = performance.now();
    for (let i = 0; i < sparkCount; i++) {
      sparksRef.current.push({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      });
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(draw);
    }
  };

  return (
    <div onPointerDown={handlePointerDown} className="relative">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60]"
      />
      {children}
    </div>
  );
}
