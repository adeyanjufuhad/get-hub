"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface GlareHoverProps {
  children: ReactNode;
  className?: string;
}

/**
 * React Bits GlareHover — crisp diagonal specular sheen sweep gated to fine-pointer hover.
 */
export function GlareHover({ children, className }: GlareHoverProps) {
  return (
    <div className={cn("glare-hover relative overflow-hidden", className)}>
      {children}
      <span aria-hidden="true" className="glare-hover-sheen pointer-events-none absolute inset-0" />
    </div>
  );
}
