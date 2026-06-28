import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

/**
 * Sidebar — app navigation rail (RTL: sits on the right via layout).
 *
 *   <Sidebar footer={<UserCell/>}>
 *     <SidebarSection title="קטלוג">
 *       <SidebarItem icon={…} active>מוצרים</SidebarItem>
 *       <SidebarItem icon={…} badge="3">קטגוריות</SidebarItem>
 *     </SidebarSection>
 *   </Sidebar>
 */
export function Sidebar({
  children,
  footer,
  className,
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-e border-border bg-surface",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo variant="wordmark" size="sm" showTagline={false} />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">{children}</nav>
      {footer && <div className="border-t border-border p-3">{footer}</div>}
    </aside>
  );
}

export function SidebarSection({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      {title && (
        <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-ink-400">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export interface SidebarItemProps {
  icon?: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function SidebarItem({
  icon,
  active,
  badge,
  href,
  onClick,
  children,
}: SidebarItemProps) {
  const cls = cn(
    "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
    active
      ? "bg-brand-50 text-brand-700"
      : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  );
  const inner = (
    <>
      {icon && (
        <span className={cn("shrink-0", active ? "text-brand-500" : "text-ink-400")}>
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {badge != null && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold",
            active ? "bg-brand-500 text-white" : "bg-ink-200 text-ink-600",
          )}
        >
          {badge}
        </span>
      )}
    </>
  );
  return href ? (
    <a href={href} className={cls} aria-current={active ? "page" : undefined}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cn(cls, "w-full text-start")}>
      {inner}
    </button>
  );
}
