import { cn } from "@/lib/cn";

/** Progress bar (0–100). Brand gradient fill. */
export interface ProgressProps {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "warning" | "danger";
  showLabel?: boolean;
}

const TONES = {
  brand: "bg-brand-gradient",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

export function Progress({
  value,
  className,
  tone = "brand",
  showLabel = false,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", TONES[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-end text-xs font-bold text-ink-600">{pct}%</span>
      )}
    </div>
  );
}
