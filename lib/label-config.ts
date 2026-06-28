/**
 * Visual layout for the product sticker. The label is a canvas of a given size
 * (mm), and each element (logo, name, size, barcode, sku, price) has an absolute
 * position + size in mm, edited via drag & drop in Settings. Stored as JSON in
 * app_settings under `label_config`. Pure (no I/O) — shared by editor + print.
 */

export type ElementKey = "logo" | "name" | "size" | "barcode" | "sku" | "price";

export const ELEMENT_KEYS: ElementKey[] = [
  "logo",
  "name",
  "size",
  "barcode",
  "sku",
  "price",
];

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  logo: "לוגו",
  name: "שם מוצר",
  size: "גודל",
  barcode: "ברקוד",
  sku: 'מק"ט',
  price: "מחיר",
};

export type Align = "right" | "center" | "left";

export interface LabelElement {
  key: ElementKey;
  enabled: boolean;
  /** Top-left position in mm. */
  x: number;
  y: number;
  /** Size in mm. */
  w: number;
  h: number;
  /** Font size (pt) for text elements; ignored for logo/barcode. */
  fontPt: number;
  align: Align;
}

export interface LabelConfig {
  widthMm: number;
  heightMm: number;
  elements: LabelElement[];
}

export const LABEL_CONFIG_KEY = "label_config";

/** A sensible default layout for a label of the given size. */
export function defaultElements(): LabelElement[] {
  return [
    { key: "logo", enabled: true, x: 2, y: 1.5, w: 16, h: 4, fontPt: 8, align: "right" },
    { key: "name", enabled: true, x: 2, y: 6.5, w: 46, h: 6, fontPt: 11, align: "center" },
    { key: "size", enabled: true, x: 2, y: 12.5, w: 46, h: 4, fontPt: 9, align: "center" },
    { key: "barcode", enabled: true, x: 6, y: 16.5, w: 38, h: 7, fontPt: 8, align: "center" },
    { key: "sku", enabled: true, x: 2, y: 23.5, w: 46, h: 3, fontPt: 7, align: "center" },
    { key: "price", enabled: true, x: 2, y: 26, w: 46, h: 4, fontPt: 13, align: "center" },
  ];
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  widthMm: 50,
  heightMm: 30,
  elements: defaultElements(),
};

function clampNum(v: unknown, min: number, max: number, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const ALIGNS: Align[] = ["right", "center", "left"];

/** Parses a stored config into a complete, sanitized LabelConfig. Accepts both
 * the new element-based format and the older {show*, fonts} format. */
export function parseLabelConfig(raw: string | null | undefined): LabelConfig {
  if (!raw) return DEFAULT_LABEL_CONFIG;
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return DEFAULT_LABEL_CONFIG;
  }

  const widthMm = clampNum(o.widthMm, 20, 210, DEFAULT_LABEL_CONFIG.widthMm);
  const heightMm = clampNum(o.heightMm, 10, 297, DEFAULT_LABEL_CONFIG.heightMm);

  // New format: explicit elements array.
  if (Array.isArray(o.elements)) {
    const byKey = new Map<ElementKey, LabelElement>();
    for (const raw of o.elements as Record<string, unknown>[]) {
      const key = raw.key as ElementKey;
      if (!ELEMENT_KEYS.includes(key)) continue;
      byKey.set(key, {
        key,
        enabled: typeof raw.enabled === "boolean" ? raw.enabled : true,
        x: clampNum(raw.x, 0, widthMm, 2),
        y: clampNum(raw.y, 0, heightMm, 2),
        w: clampNum(raw.w, 2, widthMm, 20),
        h: clampNum(raw.h, 2, heightMm, 5),
        fontPt: clampNum(raw.fontPt, 4, 48, 10),
        align: ALIGNS.includes(raw.align as Align)
          ? (raw.align as Align)
          : "center",
      });
    }
    // Fill any missing element from defaults (disabled).
    const elements = defaultElements().map(
      (d) => byKey.get(d.key) ?? { ...d, enabled: false }
    );
    return { widthMm, heightMm, elements };
  }

  // Legacy format: derive elements from show flags + fonts.
  const elements = defaultElements().map((d) => {
    const showKey = `show${d.key[0].toUpperCase()}${d.key.slice(1)}`;
    const enabled = typeof o[showKey] === "boolean" ? (o[showKey] as boolean) : true;
    let fontPt = d.fontPt;
    if (d.key === "name") fontPt = clampNum(o.nameFontPt, 4, 48, d.fontPt);
    if (d.key === "price") fontPt = clampNum(o.priceFontPt, 4, 48, d.fontPt);
    return { ...d, enabled, fontPt };
  });
  return { widthMm, heightMm, elements };
}
