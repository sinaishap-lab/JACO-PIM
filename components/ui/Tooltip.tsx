import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Tooltip — CSS-only (hover/focus), no client JS. Wraps a single trigger.
 *
 *   <Tooltip label="ערוך מוצר"><Button>…</Button></Tooltip>
 */
export interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute start-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 rtl:translate-x-1/2 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {label}
      </span>
    </span>
  );
}
