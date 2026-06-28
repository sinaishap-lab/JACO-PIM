import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Inline alert / callout banner. */
type Tone = "brand" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-800 border-brand-100",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-accent-800 border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
};

export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  tone?: Tone;
  title?: ReactNode;
  icon?: ReactNode;
}

export function Alert({
  tone = "info",
  title,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1">
        {title && <div className="font-bold">{title}</div>}
        {children && <div className={cn(title ? "mt-0.5 opacity-90" : undefined)}>{children}</div>}
      </div>
    </div>
  );
}
