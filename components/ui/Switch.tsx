import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Switch — CSS-only toggle built on a real checkbox (no client JS needed).
 * Works controlled or uncontrolled like any <input type="checkbox">.
 */
export interface SwitchProps extends Omit<ComponentProps<"input">, "type"> {
  label?: ReactNode;
}

export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="h-6 w-11 rounded-full bg-ink-200 transition-colors peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
        <span className="absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all start-0.5 peer-checked:start-[1.375rem]" />
      </span>
      {label && <span className="text-sm font-medium text-ink-800">{label}</span>}
    </label>
  );
}
