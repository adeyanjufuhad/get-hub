import { cn } from "@/lib/cn";

export interface ShinyTextProps {
  text: string;
  className?: string;
}

/**
 * React Bits ShinyText — subtle linear metallic specular sweep for badges and callouts.
 */
export function ShinyText({ text, className }: ShinyTextProps) {
  return <span className={cn("rb-shiny-text inline-block", className)}>{text}</span>;
}
