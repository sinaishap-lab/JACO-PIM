import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Table primitives tuned for PIM product grids: rounded container, sticky-ready
 * header, zebra hover. Compose with the brand Badge for status columns.
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
      <table className={cn("w-full border-collapse text-start text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-surface-muted", className)} {...props} />;
}

export function TBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr className={cn("transition-colors hover:bg-brand-50/50", className)} {...props} />
  );
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-ink-500",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("px-4 py-3 text-ink-800 align-middle", className)} {...props} />
  );
}
