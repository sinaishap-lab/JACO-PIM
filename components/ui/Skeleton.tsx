import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Loading placeholder. Use width/height via className. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-ink-100", className)}
      {...props}
    />
  );
}
