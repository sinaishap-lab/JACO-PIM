import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Avatar — image or initials fallback on a brand-tinted circle. */
const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-grid place-items-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700 ring-2 ring-surface",
        SIZES[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials(name).toUpperCase()}</span>
      )}
    </span>
  );
}

/** Overlapping avatar stack. */
export function AvatarGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-row-reverse items-center -space-x-2 space-x-reverse">{children}</div>;
}
