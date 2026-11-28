import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

// The mark is about 2:1 (viewBox 845.3 × 418.7), so width follows height.
const SIZE_MAP = {
  sm: "h-[15px] w-[30px]",
  md: "h-4 w-[33px]",
  lg: "h-5 w-[41px]",
};

const MASK = 'url("/logo-get.svg") center / contain no-repeat';

/**
 * The GET wordmark, traced from the original logo artwork without its tile
 * background or the smeared ghost above the letters. It's drawn with a CSS mask
 * over `currentColor`, so it takes the surrounding text colour in light and dark
 * mode and on dark bands. Decorative: every usage has the app name beside it or
 * on its link.
 */
export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", SIZE_MAP[size], className)}
      style={{ WebkitMask: MASK, mask: MASK } as CSSProperties}
    />
  );
}
