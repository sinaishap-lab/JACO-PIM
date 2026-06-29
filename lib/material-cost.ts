/**
 * Material area-cost calculator (pure, no I/O). Derives the cost of a finished
 * size cut from a sheet/roll raw material.
 *
 * Sizes are written width.height in centimetres, e.g. "10.15" = 10×15 cm, or
 * "10x15". Sheet/roll dimensions are also in cm.
 */

export type MaterialForm = "simple" | "sheet" | "roll";

export interface MaterialPricing {
  materialForm: MaterialForm;
  /** For 'sheet': total sheet price. For 'roll': price per running metre. */
  costPrice: number | null;
  /** Sheet width (cm) for 'sheet'; roll width (cm) for 'roll'. */
  sheetWidthCm: number | null;
  /** Sheet height (cm) for 'sheet' (unused for 'roll'). */
  sheetHeightCm: number | null;
  /** Extra waste added to the area cost, in percent. */
  wastePercent: number | null;
}

/** Parses a size string into width/height in cm, or null if not a W×H size. */
export function parseSizeCm(value: string): { w: number; h: number } | null {
  const v = value.trim();
  // Explicit separators first: 10x15, 10×15, 10*15.
  let m = v.match(/^(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)$/i);
  // Dotted integer form: 10.15 -> 10 × 15.
  if (!m) m = v.match(/^(\d+)\.(\d+)$/);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { w, h };
}

/** Price per cm² implied by the material's pricing, or null if not area-based. */
export function pricePerCm2(m: MaterialPricing): number | null {
  if (m.costPrice == null || m.costPrice < 0) return null;
  if (m.materialForm === "sheet") {
    const w = m.sheetWidthCm ?? 0;
    const h = m.sheetHeightCm ?? 0;
    if (w > 0 && h > 0) return m.costPrice / (w * h);
    return null;
  }
  if (m.materialForm === "roll") {
    const w = m.sheetWidthCm ?? 0;
    // cost_price is per running metre; 1 m across width w(cm) = w × 100 cm².
    if (w > 0) return m.costPrice / (w * 100);
    return null;
  }
  return null; // 'simple' is not area-based
}

/** Cost of cutting `sizeValue` from the material, or null if not computable. */
export function sizeCost(m: MaterialPricing, sizeValue: string): number | null {
  const dims = parseSizeCm(sizeValue);
  const ppc = pricePerCm2(m);
  if (!dims || ppc == null) return null;
  const area = dims.w * dims.h; // cm²
  const waste = 1 + (m.wastePercent ?? 0) / 100;
  return area * ppc * waste;
}
