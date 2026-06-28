import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Checkbox + Radio — styled native inputs (work in any form, no client JS). */

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  label?: ReactNode;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="grid size-5 place-items-center rounded-md border-2 border-ink-300 bg-surface text-surface transition-colors peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </span>
      {label && <span className="text-sm font-medium text-ink-800">{label}</span>}
    </label>
  );
}

export interface RadioProps extends Omit<ComponentProps<"input">, "type"> {
  label?: ReactNode;
}

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <span className="relative inline-flex">
        <input type="radio" className="peer sr-only" {...props} />
        <span className="grid size-5 place-items-center rounded-full border-2 border-ink-300 bg-surface transition-colors after:size-2.5 after:scale-0 after:rounded-full after:bg-brand-500 after:transition-transform after:content-[''] peer-checked:border-brand-500 peer-checked:after:scale-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
      </span>
      {label && <span className="text-sm font-medium text-ink-800">{label}</span>}
    </label>
  );
}
