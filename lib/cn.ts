/**
 * Tiny class-name combiner (no external deps).
 * Filters out falsy values and joins with spaces.
 *
 *   cn("px-4", isActive && "bg-brand-500", undefined) // "px-4 bg-brand-500"
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
