import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Breadcrumb trail. RTL-aware separator (chevron points to inline-start). */
export interface Crumb {
  label: ReactNode;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {item.href && !last ? (
                  <a
                    href={item.href}
                    className="font-medium text-ink-500 transition-colors hover:text-brand-600"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className={cn("font-medium", last ? "text-ink-900" : "text-ink-500")}>
                    {item.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden className="text-ink-300">
                  <svg viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
