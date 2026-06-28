import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Button — pill-shaped by default, matching the brand's rounded CTAs.
 *
 * variants:
 *   primary   solid pink (main CTA)
 *   gradient  signature orange→pink gradient
 *   accent    solid orange
 *   outline   bordered, transparent fill
 *   ghost     no border, subtle hover
 *   subtle    tinted brand fill
 *   danger    destructive actions
 */
type Variant =
  | "primary"
  | "gradient"
  | "accent"
  | "outline"
  | "ghost"
  | "subtle"
  | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700",
  gradient:
    "bg-brand-gradient text-white shadow-brand hover:brightness-105 active:brightness-95",
  accent:
    "bg-accent-500 text-white shadow-sm hover:bg-accent-600 active:bg-accent-700",
  outline:
    "border border-ink-200 bg-surface text-ink-800 hover:border-ink-300 hover:bg-ink-50 active:bg-ink-100",
  ghost:
    "text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  subtle:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200",
  danger:
    "bg-danger text-white shadow-sm hover:brightness-95 active:brightness-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-11 gap-2 px-6 text-[0.95rem]",
  lg: "h-13 gap-2.5 px-8 text-base",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  leftIcon,
  rightIcon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex select-none items-center justify-center rounded-full font-display font-semibold whitespace-nowrap transition-[background,box-shadow,filter,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
