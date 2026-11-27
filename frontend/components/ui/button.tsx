"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        ink: "bg-[var(--ink-cta)] text-[var(--ink-cta-text)] hover:opacity-90",
        accent: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
        secondary:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]",
        subtle:
          "bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-strong)]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
        danger:
          "bg-[var(--danger)] text-white hover:opacity-90",
      },
      size: {
        sm: "min-h-[40px] px-3.5 text-sm",
        md: "min-h-[44px] px-4 text-sm",
        lg: "min-h-[48px] px-5 text-sm sm:text-base",
        icon: "h-11 w-11 p-0",
      },
      shape: {
        rect: "rounded-[12px]",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "ink",
      size: "md",
      shape: "rect",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, shape, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, shape }), className)} {...props} />;
}
