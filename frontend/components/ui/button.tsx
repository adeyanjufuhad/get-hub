"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        ink: "bg-[var(--ink-cta)] text-[var(--ink-cta-text)] rounded-full",
        accent: "bg-[var(--accent)] text-white rounded-full",
        secondary:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] rounded-full",
        subtle:
          "bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-xl",
        ghost:
          "bg-transparent text-[var(--text-secondary)] rounded-xl",
        danger:
          "bg-[var(--danger)] text-white rounded-full",
      },
      size: {
        sm: "min-h-[40px] px-3.5 text-sm",
        md: "min-h-[44px] px-5 text-sm",
        lg: "min-h-[50px] px-6 text-base",
        icon: "h-11 w-11 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "ink",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
