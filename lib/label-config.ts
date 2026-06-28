/**
 * Configuration for the small product sticker — size and which fields appear.
 * Stored as JSON in app_settings under `label_config`. Shared by the settings
 * form and the label-printing page (pure, no I/O).
 */

export interface LabelConfig {
  widthMm: number;
  heightMm: number;
  showLogo: boolean;
  showName: boolean;
  showSize: boolean;
  showBarcode: boolean;
  showSku: boolean;
  showPrice: boolean;
  nameFontPt: number;
  priceFontPt: number;
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  widthMm: 50,
  heightMm: 30,
  showLogo: true,
  showName: true,
  showSize: true,
  showBarcode: true,
  showSku: true,
  showPrice: true,
  nameFontPt: 10,
  priceFontPt: 13,
};

export const LABEL_CONFIG_KEY = "label_config";

function clampNum(v: unknown, min: number, max: number, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Parses a stored config string into a complete, sanitized LabelConfig. */
export function parseLabelConfig(raw: string | null | undefined): LabelConfig {
  if (!raw) return DEFAULT_LABEL_CONFIG;
  let o: Partial<LabelConfig>;
  try {
    o = JSON.parse(raw) as Partial<LabelConfig>;
  } catch {
    return DEFAULT_LABEL_CONFIG;
  }
  const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
  return {
    widthMm: clampNum(o.widthMm, 20, 210, DEFAULT_LABEL_CONFIG.widthMm),
    heightMm: clampNum(o.heightMm, 10, 297, DEFAULT_LABEL_CONFIG.heightMm),
    showLogo: bool(o.showLogo, true),
    showName: bool(o.showName, true),
    showSize: bool(o.showSize, true),
    showBarcode: bool(o.showBarcode, true),
    showSku: bool(o.showSku, true),
    showPrice: bool(o.showPrice, true),
    nameFontPt: clampNum(o.nameFontPt, 6, 24, DEFAULT_LABEL_CONFIG.nameFontPt),
    priceFontPt: clampNum(o.priceFontPt, 6, 36, DEFAULT_LABEL_CONFIG.priceFontPt),
  };
}
