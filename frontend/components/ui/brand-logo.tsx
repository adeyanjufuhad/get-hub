import { cn } from "@/lib/cn";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-11 w-11 rounded-2xl",
};

/**
 * Renders the custom GET Hub logo mark cleanly in both light and dark modes.
 */
export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-black/[0.08] bg-[#F8F8F6] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/15 dark:bg-white",
        SIZE_MAP[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-get.jpg"
        alt="GET Hub logo"
        className="h-full w-full object-contain mix-blend-multiply"
      />
    </span>
  );
}
