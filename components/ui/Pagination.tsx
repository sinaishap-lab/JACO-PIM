"use client";

import { cn } from "@/lib/cn";

/** Pagination — controlled. RTL-aware arrows. */
export interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function range(page: number, count: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const push = (n: number | "…") => out.push(n);
  const window = 1;
  for (let i = 1; i <= count; i++) {
    if (i === 1 || i === count || (i >= page - window && i <= page + window)) {
      push(i);
    } else if (out[out.length - 1] !== "…") {
      push("…");
    }
  }
  return out;
}

function Arrow({ dir }: { dir: "prev" | "next" }) {
  // In RTL, "prev" (earlier pages) sits to the right → chevron points right.
  const d = dir === "prev" ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6";
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const go = (p: number) => onPageChange(Math.max(1, Math.min(pageCount, p)));
  const cellBase =
    "focus-ring grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40";
  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="pagination">
      <button type="button" className={cn(cellBase, "text-ink-600 hover:bg-ink-100")} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="הקודם">
        <Arrow dir="prev" />
      </button>
      {range(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="grid h-9 min-w-9 place-items-center text-ink-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              cellBase,
              p === page ? "bg-brand-500 text-white shadow-sm" : "text-ink-700 hover:bg-ink-100",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={cn(cellBase, "text-ink-600 hover:bg-ink-100")} onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="הבא">
        <Arrow dir="next" />
      </button>
    </nav>
  );
}
