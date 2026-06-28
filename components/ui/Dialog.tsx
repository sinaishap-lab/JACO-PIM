"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/**
 * Dialog / Modal — controlled. Renders in a portal, locks scroll, closes on
 * Escape and backdrop click, traps focus loosely via autoFocus.
 *
 *   const [open, setOpen] = useState(false);
 *   <Dialog open={open} onClose={() => setOpen(false)} title="מוצר חדש">…</Dialog>
 */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" } as const;

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full animate-pop-in overflow-hidden rounded-2xl bg-surface shadow-lg",
          SIZES[size],
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="flex flex-col gap-1">
              {title && (
                <h2 className="text-lg font-bold tracking-tight text-ink-900">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className="focus-ring -m-1 rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <CloseIcon />
            </button>
          </div>
        )}
        {children && <div className="p-5">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border bg-surface-muted p-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Convenience confirm dialog. */
export interface ConfirmDialogProps extends Omit<DialogProps, "footer" | "children"> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  onConfirm,
  onClose,
  destructive,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog
      {...props}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "danger" : "gradient"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
