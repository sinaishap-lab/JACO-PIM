import { cn } from "@/lib/cn";

/**
 * JACO PRINT logo — recreated from the brand badge on jacoprint.com.
 * A rounded white tile holding a gradient "image" glyph above the wordmark
 * and the LOCAL · FAST · SIMPLE tagline.
 *
 *   <Logo />                      full badge
 *   <Logo variant="wordmark" />   text only (for headers / inline use)
 *   <Logo variant="mark" />       gradient glyph tile only (favicon-ish)
 */
type LogoVariant = "badge" | "wordmark" | "mark";

const SIZES = {
  sm: { tile: "size-9", glyph: "size-4", brand: "text-sm", print: "text-[0.6rem]", tag: "hidden" },
  md: { tile: "size-12", glyph: "size-6", brand: "text-lg", print: "text-xs", tag: "text-[0.55rem]" },
  lg: { tile: "size-16", glyph: "size-8", brand: "text-2xl", print: "text-sm", tag: "text-[0.65rem]" },
} as const;

function GlyphTile({ size }: { size: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "bg-brand-gradient grid place-items-center rounded-2xl text-white shadow-brand",
        s.tile,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className={s.glyph}>
        <rect x="3" y="4" width="14" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="7.5" cy="8" r="1.4" fill="currentColor" />
        <path d="M4 13l3.2-3 2.6 2.2L13 9l3.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 6.5v5M20.5 9h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Wordmark({ size }: { size: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className="flex flex-col items-center leading-none" dir="ltr">
      <span className={cn("font-display font-black tracking-tight text-ink-950", s.brand)}>JACO</span>
      <span className={cn("text-brand-gradient font-display font-black tracking-tight", s.print)}>
        PRINT
      </span>
    </span>
  );
}

export interface LogoProps {
  variant?: LogoVariant;
  size?: keyof typeof SIZES;
  className?: string;
  showTagline?: boolean;
}

export function Logo({
  variant = "badge",
  size = "md",
  className,
  showTagline = true,
}: LogoProps) {
  const s = SIZES[size];

  if (variant === "mark") {
    return <GlyphTile size={size} />;
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)} dir="ltr">
        <Wordmark size={size} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex flex-col items-center gap-1.5 rounded-2xl bg-surface px-4 py-3 shadow-sm ring-1 ring-border",
        className,
      )}
    >
      <GlyphTile size={size} />
      <Wordmark size={size} />
      {showTagline && s.tag !== "hidden" && (
        <span className={cn("font-medium tracking-[0.25em] text-ink-400", s.tag)} dir="ltr">
          LOCAL · FAST · SIMPLE
        </span>
      )}
    </span>
  );
}
