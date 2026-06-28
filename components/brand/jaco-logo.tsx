import { cn } from "@/lib/utils";

/**
 * JACO PRINT logo — gradient "image-plus" mark + wordmark (JACO pink / PRINT gold).
 * Brand asset; safe to use anywhere (header, sidebar, login).
 */
export function JacoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-8 shrink-0", className)} role="img" aria-label="JACO PRINT">
      <defs>
        <linearGradient id="jaco-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-pink)" />
          <stop offset="52%" stopColor="var(--brand-orange)" />
          <stop offset="100%" stopColor="var(--brand-gold)" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#jaco-mark-grad)" />
      <g
        transform="translate(18 18) scale(2.6667)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
        <path d="M16 5h6" />
        <path d="M19 2v6" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </g>
    </svg>
  );
}

export function JacoLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <JacoMark />
      <span className="font-display text-lg font-black leading-none tracking-tight" dir="ltr">
        <span className="text-primary">JACO</span>
        <span style={{ color: "var(--brand-gold)" }}> PRINT</span>
      </span>
    </span>
  );
}
