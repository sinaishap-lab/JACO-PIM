/**
 * Pure SKU-building helpers (no I/O) so both server and client code can use
 * them. The format is:
 *   [supplier code][department code][sub-department code][number][size][color]
 * concatenated with no separators. Each part is optional.
 */

export function padNumber(n: number): string {
  return String(n).padStart(3, "0");
}

export function generateBaseSku(parts: {
  supplierCode?: string | null;
  departmentCode?: string | null;
  subDepartmentCode?: string | null;
  productNumber?: number | null;
}): string {
  const segments = [
    parts.supplierCode,
    parts.departmentCode,
    parts.subDepartmentCode,
    parts.productNumber != null ? padNumber(parts.productNumber) : null,
  ].filter((s): s is string => Boolean(s && String(s).trim()));
  return segments.join("");
}

/** Variant SKU = base + size value + color letter. */
export function generateVariantSku(
  base: string,
  sizeValue?: string | null,
  colorLetter?: string | null
): string {
  return `${base}${sizeValue ?? ""}${colorLetter ?? ""}`;
}
