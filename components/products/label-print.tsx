"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JacoLogo, JacoMark } from "@/components/brand/jaco-logo";
import { code128 } from "@/lib/barcode";

export interface LabelVariant {
  sku: string;
  name: string;
  /** Size (and/or color) text, empty for a product without variants. */
  size: string;
  /** Sale price (VAT-inclusive, as priced in the app). */
  price: number | null;
}

export interface LabelProduct {
  name: string;
  sku: string;
  /** Primary image URL for the A5 box label, if any. */
  imageUrl: string | null;
}

function Barcode({
  value,
  module = 1.4,
  height = 44,
}: {
  value: string;
  module?: number;
  height?: number;
}) {
  const { rects, modules } = useMemo(() => code128(value), [value]);
  return (
    <svg
      width={modules * module}
      height={height}
      viewBox={`0 0 ${modules} 100`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={100} fill="#000" />
      ))}
    </svg>
  );
}

function formatPrice(price: number | null): string {
  if (price == null) return "";
  return `₪${price.toLocaleString("he-IL")}`;
}

/** A single small product sticker. */
function Sticker({ v }: { v: LabelVariant }) {
  return (
    <div className="label">
      <JacoLogo className="label-logo" />
      <div className="label-name">{v.name}</div>
      {v.size && <div className="label-size">{v.size}</div>}
      <Barcode value={v.sku} />
      <div className="label-sku" dir="ltr">
        {v.sku}
      </div>
      <div className="label-price">{formatPrice(v.price)}</div>
    </div>
  );
}

// ── Small product labels ─────────────────────────────────────────────────────

function ProductLabels({ variants }: { variants: LabelVariant[] }) {
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(variants.map((v) => [v.sku, 1]))
  );

  const setOne = (sku: string, value: number) =>
    setQty((q) => ({ ...q, [sku]: Math.max(0, value || 0) }));
  const setAll = (value: number) =>
    setQty(Object.fromEntries(variants.map((v) => [v.sku, Math.max(0, value)])));

  const total = variants.reduce((sum, v) => sum + (qty[v.sku] ?? 0), 0);
  const toPrint = variants.flatMap((v) =>
    Array.from({ length: qty[v.sku] ?? 0 }, () => v)
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">כמות לכולם:</span>
          {[0, 1, 5, 10].map((n) => (
            <Button
              key={n}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAll(n)}
            >
              {n}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {variants.map((v) => (
            <div
              key={v.sku}
              className="flex items-center gap-3 border-b pb-2 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                  {v.name}
                  {v.size ? ` · ${v.size}` : ""}
                </div>
                <div className="text-muted-foreground font-mono text-xs" dir="ltr">
                  {v.sku} · {formatPrice(v.price)}
                </div>
              </div>
              <Label htmlFor={`qty-${v.sku}`} className="sr-only">
                כמות מדבקות ל-{v.sku}
              </Label>
              <Input
                id={`qty-${v.sku}`}
                type="number"
                min={0}
                value={qty[v.sku] ?? 0}
                onChange={(e) => setOne(v.sku, parseInt(e.target.value, 10))}
                className="w-20"
                dir="ltr"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            סה&quot;כ מדבקות להדפסה: <strong>{total}</strong>
          </span>
          <Button type="button" onClick={() => window.print()} disabled={total === 0}>
            <Printer className="size-4" />
            הדפסת מדבקות
          </Button>
        </div>
      </Card>

      <div className="label-sheet print-area hidden print:block">
        {toPrint.map((v, i) => (
          <Sticker key={i} v={v} />
        ))}
      </div>
    </div>
  );
}

// ── A5 warehouse box label ───────────────────────────────────────────────────

function BoxLabel({ product }: { product: LabelProduct }) {
  const [copies, setCopies] = useState(1);
  const n = Math.max(0, copies || 0);

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-4">
        <p className="text-muted-foreground text-sm">
          מדבקת A5 לארגזים הנכנסים למחסן — שם המוצר, ברקוד פנימי ותמונה ראשית.
        </p>
        {!product.imageUrl && (
          <p className="text-sm text-amber-600">
            למוצר אין תמונה ראשית — המדבקה תודפס ללא תמונה. אפשר להוסיף תמונה
            בעריכת המוצר.
          </p>
        )}
        <div className="flex items-center gap-3">
          <Label htmlFor="box-copies">מספר עותקים</Label>
          <Input
            id="box-copies"
            type="number"
            min={0}
            value={copies}
            onChange={(e) => setCopies(parseInt(e.target.value, 10))}
            className="w-24"
            dir="ltr"
          />
          <Button type="button" onClick={() => window.print()} disabled={n === 0}>
            <Printer className="size-4" />
            הדפסת מדבקת ארגז
          </Button>
        </div>

        {/* On-screen preview of one label. */}
        <div className="bg-muted/30 flex justify-center rounded-md p-4">
          <div
            className="box-label bg-white shadow"
            style={{ width: 296, height: 420, padding: 24, gap: 16 }}
          >
            <JacoMark className="size-10" />
            <div className="box-name" style={{ fontSize: 22 }}>
              {product.name}
            </div>
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt=""
                className="box-photo"
                style={{ maxHeight: 180 }}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <Barcode value={product.sku} module={2} height={64} />
              <div className="box-sku" style={{ fontSize: 13 }} dir="ltr">
                {product.sku}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Print-only sheet. */}
      <div className="print-area hidden print:block">
        {Array.from({ length: n }, (_, i) => (
          <div className="box-label" key={i}>
            <JacoMark className="size-16" />
            <div className="box-name">{product.name}</div>
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt="" className="box-photo" />
            )}
            <div className="flex flex-col items-center gap-2">
              <Barcode value={product.sku} module={3.2} height={120} />
              <div className="box-sku" dir="ltr">
                {product.sku}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tabbed container ─────────────────────────────────────────────────────────

export function LabelPrint({
  variants,
  product,
}: {
  variants: LabelVariant[];
  product: LabelProduct;
}) {
  const [mode, setMode] = useState<"product" | "box">("product");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden">
        <Button
          type="button"
          variant={mode === "product" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("product")}
        >
          מדבקות מוצר
        </Button>
        <Button
          type="button"
          variant={mode === "box" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("box")}
        >
          מדבקת ארגז (A5)
        </Button>
      </div>

      {mode === "product" ? (
        <ProductLabels variants={variants} />
      ) : (
        <BoxLabel product={product} />
      )}
    </div>
  );
}
