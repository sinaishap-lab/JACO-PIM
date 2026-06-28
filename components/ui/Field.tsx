import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Shared field shell: label + control + hint/error. */
export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-800">
          {label}
          {required && <span className="text-brand-500"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs font-medium text-danger">{error}</span>
      ) : (
        hint && <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

const controlBase =
  "focus-ring w-full rounded-xl border bg-surface px-3.5 text-ink-900 placeholder:text-ink-400 transition-colors disabled:cursor-not-allowed disabled:bg-ink-50 disabled:opacity-60";

function stateRing(invalid?: boolean) {
  return invalid
    ? "border-danger/60 focus-visible:border-danger"
    : "border-ink-200 hover:border-ink-300 focus-visible:border-brand-400";
}

export interface InputProps extends ComponentProps<"input"> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(controlBase, "h-11", stateRing(invalid), className)}
      {...props}
    />
  );
}

export interface TextareaProps extends ComponentProps<"textarea"> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(controlBase, "min-h-24 py-2.5", stateRing(invalid), className)}
      {...props}
    />
  );
}

export interface SelectProps extends ComponentProps<"select"> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(controlBase, "h-11 appearance-none pe-9", stateRing(invalid), className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left 0.85rem center",
        backgroundSize: "1rem",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
