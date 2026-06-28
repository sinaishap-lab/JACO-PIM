"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Toast notifications.
 *
 *   // wrap your app/screen once:
 *   <ToastProvider>…</ToastProvider>
 *   // then anywhere inside:
 *   const { toast } = useToast();
 *   toast({ title: "נשמר", description: "המוצר עודכן", tone: "success" });
 */
type Tone = "default" | "success" | "warning" | "danger" | "info";

interface ToastItem {
  id: number;
  title: ReactNode;
  description?: ReactNode;
  tone: Tone;
  duration: number;
}

interface ToastInput {
  title: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  duration?: number;
}

const ToastCtx = createContext<{ toast: (t: ToastInput) => void } | null>(null);

/* SSR-safe mount flag: false during SSR and the first client render (so the
   portal isn't part of hydration), true afterwards. Avoids hydration mismatch. */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const TONE_STYLES: Record<Tone, { bar: string; icon: ReactNode }> = {
  default: { bar: "bg-ink-400", icon: null },
  success: { bar: "bg-success", icon: <CheckIcon /> },
  warning: { bar: "bg-warning", icon: <BangIcon /> },
  danger: { bar: "bg-danger", icon: <BangIcon /> },
  info: { bar: "bg-info", icon: <InfoIcon /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const mounted = useMounted();

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = ++idRef.current;
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "default",
      duration: input.duration ?? 4000,
    };
    setItems((prev) => [...prev, item]);
    if (item.duration > 0) {
      window.setTimeout(() => remove(id), item.duration);
    }
  }, [remove]);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
            {items.map((t) => {
              const tone = TONE_STYLES[t.tone];
              return (
                <div
                  key={t.id}
                  role="status"
                  className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-lg"
                >
                  <span className={cn("mt-0.5 h-full w-1 shrink-0 self-stretch rounded-full", tone.bar)} />
                  {tone.icon && <span className="mt-0.5 shrink-0">{tone.icon}</span>}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-ink-900">{t.title}</div>
                    {t.description && (
                      <div className="mt-0.5 text-sm text-muted-foreground">{t.description}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    aria-label="סגירה"
                    className="focus-ring -m-1 rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastCtx.Provider>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-success" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function BangIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-warning" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 8v5M12 16h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-info" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 16v-5M12 8h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
