"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/**
 * Tabs — accessible, uncontrolled-by-default.
 *
 *   <Tabs defaultValue="info">
 *     <TabsList>
 *       <TabsTrigger value="info">פרטים</TabsTrigger>
 *       <TabsTrigger value="media">תמונות</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="info">…</TabsContent>
 *     <TabsContent value="media">…</TabsContent>
 *   </Tabs>
 */
type TabsCtx = { value: string; setValue: (v: string) => void; baseId: string };
const Ctx = createContext<TabsCtx | null>(null);

function useTabs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Tabs components must be used inside <Tabs>");
  return ctx;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: ReactNode;
}

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const baseId = useId();
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    if (controlled === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <Ctx.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-ink-100 p-1",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends Omit<ComponentProps<"button">, "value"> {
  value: string;
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: active, setValue, baseId } = useTabs();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      onClick={() => setValue(value)}
      className={cn(
        "focus-ring rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
        selected
          ? "bg-surface text-brand-600 shadow-sm"
          : "text-ink-500 hover:text-ink-800",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends Omit<ComponentProps<"div">, "value"> {
  value: string;
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: active, baseId } = useTabs();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={cn("mt-4", className)}
      {...props}
    />
  );
}
