"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { code128 } from "@/lib/barcode";

export interface LabelVariant {
  sku: string;
  name: string;
  /** Size (and/or color) text, empty for a product without variants. */
  size: string;
  /** Sale price (VAT-inclusive, as priced in the app). */
  price: number | null;
}

const MODULE = 1.4; // px per barcode module
const BAR_HEIGHT = 44; // px

function Barcode({ value }: { value: string }) {
  const { rects, modules } = useMemo(() => code128(value), [value]);
  return (
    <svg
      width={modules * MODULE}
      height={BAR_HEIGHT}
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

/** A single printable sticker. */
function Sticker({ v }: { v: LabelVariant }) {
  return (
    <div className="label">
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

export function LabelPrint({ variants }: { variants: LabelVariant[] }) {
  // Quantity per variant SKU, default 1.
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(variants.map((v) => [v.sku, 1]))
  );

  const setOne = (sku: string, value: number) =>
    setQty((q) => ({ ...q, [sku]: Math.max(0, value || 0) }));

  const setAll = (value: number) =>
    setQty(Object.fromEntries(variants.map((v) => [v.sku, Math.max(0, value)])));

  const total = variants.reduce((sum, v) => sum + (qty[v.sku] ?? 0), 0);

  // The flat list of stickers to print (one entry per copy).
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
              <div className="flex items-center gap-2">
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
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            סה&quot;כ מדבקות להדפסה: <strong>{total}</strong>
          </span>
          <Button
            type="button"
            onClick={() => window.print()}
            disabled={total === 0}
          >
            <Printer className="size-4" />
            הדפסת מדבקות
          </Button>
        </div>
      </Card>

      {/* Print-only sheet: hidden on screen, shown when printing. */}
      <div className="label-sheet hidden print:block">
        {toPrint.map((v, i) => (
          <Sticker key={i} v={v} />
        ))}
      </div>
    </div>
  );
}
