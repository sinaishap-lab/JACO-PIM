"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/**
 * DropdownMenu — click-triggered menu, closes on outside-click / Escape.
 * RTL-aware alignment via logical `start`/`end`.
 *
 *   <DropdownMenu trigger={<Button>פעולות</Button>}>
 *     <DropdownItem onSelect={…}>עריכה</DropdownItem>
 *     <DropdownSeparator />
 *     <DropdownItem tone="danger" onSelect={…}>מחיקה</DropdownItem>
 *   </DropdownMenu>
 */
export interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-40 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg",
            align === "end" ? "end-0" : "start-0",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  tone?: "default" | "danger";
  icon?: ReactNode;
  disabled?: boolean;
}

export function DropdownItem({
  children,
  onSelect,
  tone = "default",
  icon,
  disabled,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        tone === "danger"
          ? "text-danger hover:bg-danger-soft"
          : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
      )}
    >
      {icon && <span className="shrink-0 text-ink-400">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
      {children}
    </div>
  );
}
