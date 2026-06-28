import { cn } from "@/lib/cn";

/**
 * JACO PRINT logo — faithful vector recreation of the brand artwork.
 * Gradient tile (pink → orange → gold) holding a white "image-plus" glyph,
 * "JACO" in pink + "PRINT" in gold, with the LOCAL · FAST · SIMPLE tagline.
 *
 *   <Logo />                      full stacked badge
 *   <Logo layout="horizontal" />  mark beside wordmark (for headers)
 *   <Logo variant="wordmark" />   text only
 *   <Logo variant="mark" />       gradient glyph tile only (favicon-ish)
 */
type LogoVariant = "full" | "wordmark" | "mark";
type LogoLayout = "stacked" | "horizontal";

const SIZES = {
  sm: { tile: 36, brand: "text-base", print: "text-base", tag: "text-[0.5rem]" },
  md: { tile: 52, brand: "text-2xl", print: "text-2xl", tag: "text-[0.6rem]" },
  lg: { tile: 76, brand: "text-4xl", print: "text-4xl", tag: "text-xs" },
} as const;

/** The gradient glyph tile (white image-plus icon on brand gradient). */
function Mark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="JACO PRINT"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="jaco-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-brand-500)" />
          <stop offset="52%" stopColor="var(--color-accent-500)" />
          <stop offset="100%" stopColor="var(--color-gold-500)" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#jaco-mark-grad)" />
      {/* image-plus icon, centered with padding */}
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

function Wordmark({ size }: { size: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className="font-display font-black leading-none tracking-tight" dir="ltr">
      <span className={cn("text-brand-500", s.brand)}>JACO</span>
      <span className={cn("text-gold-500", s.print)}> PRINT</span>
    </span>
  );
}

export interface LogoProps {
  variant?: LogoVariant;
  layout?: LogoLayout;
  size?: keyof typeof SIZES;
  className?: string;
  showTagline?: boolean;
}

export function Logo({
  variant = "full",
  layout = "stacked",
  size = "md",
  className,
  showTagline = true,
}: LogoProps) {
  const s = SIZES[size];

  if (variant === "mark") {
    return <Mark size={s.tile} />;
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex flex-col items-start", className)}>
        <Wordmark size={size} />
        {showTagline && (
          <span
            className={cn("mt-1 font-semibold tracking-[0.2em] text-ink-700", s.tag)}
            dir="ltr"
          >
            LOCAL · FAST · SIMPLE
          </span>
        )}
      </span>
    );
  }

  if (layout === "horizontal") {
    return (
      <span className={cn("inline-flex items-center gap-3", className)}>
        <Mark size={s.tile} />
        <span className="inline-flex flex-col items-start">
          <Wordmark size={size} />
          {showTagline && (
            <span
              className={cn("mt-0.5 font-semibold tracking-[0.2em] text-ink-700", s.tag)}
              dir="ltr"
            >
              LOCAL · FAST · SIMPLE
            </span>
          )}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center gap-2.5", className)}>
      <Mark size={s.tile} />
      <Wordmark size={size} />
      {showTagline && (
        <span
          className={cn("font-semibold tracking-[0.2em] text-ink-700", s.tag)}
          dir="ltr"
        >
          LOCAL · FAST · SIMPLE
        </span>
      )}
    </span>
  );
}
