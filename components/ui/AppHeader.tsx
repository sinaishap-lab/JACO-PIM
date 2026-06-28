import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * AppHeader — sticky top bar for the app shell: page title / search / actions.
 */
export function AppHeader({
  title,
  search,
  actions,
  className,
}: {
  title?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-6 backdrop-blur",
        className,
      )}
    >
      {title && (
        <h1 className="text-lg font-bold tracking-tight text-ink-900">{title}</h1>
      )}
      {search && <div className="ms-auto w-full max-w-xs">{search}</div>}
      {actions && <div className={cn("flex items-center gap-2", !search && "ms-auto")}>{actions}</div>}
    </header>
  );
}

/** Icon button — square, for header/toolbar actions. */
export function IconButton({
  children,
  label,
  className,
  ...props
}: {
  children: ReactNode;
  label: string;
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "focus-ring relative grid size-10 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
