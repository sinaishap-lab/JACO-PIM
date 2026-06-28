"use client";

import { useMemo } from "react";

import { JacoLogo } from "@/components/brand/jaco-logo";
import { code128 } from "@/lib/barcode";
import type { LabelConfig } from "@/lib/label-config";

export interface StickerData {
  sku: string;
  name: string;
  size: string;
  price: number | null;
}

export function formatPrice(price: number | null): string {
  if (price == null) return "";
  return `₪${price.toLocaleString("he-IL")}`;
}

function Barcode({ value }: { value: string }) {
  const { rects, modules } = useMemo(() => code128(value || " "), [value]);
  return (
    <svg
      width={modules * 1.3}
      height={40}
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

/** One printable product sticker, laid out per the label config. */
export function LabelSticker({
  data,
  config,
}: {
  data: StickerData;
  config: LabelConfig;
}) {
  return (
    <div
      className="label"
      style={{ width: `${config.widthMm}mm`, minHeight: `${config.heightMm}mm` }}
    >
      {config.showLogo && <JacoLogo className="label-logo" />}
      {config.showName && (
        <div className="label-name" style={{ fontSize: `${config.nameFontPt}pt` }}>
          {data.name}
        </div>
      )}
      {config.showSize && data.size && <div className="label-size">{data.size}</div>}
      {config.showBarcode && <Barcode value={data.sku} />}
      {config.showSku && (
        <div className="label-sku" dir="ltr">
          {data.sku}
        </div>
      )}
      {config.showPrice && (
        <div className="label-price" style={{ fontSize: `${config.priceFontPt}pt` }}>
          {formatPrice(data.price)}
        </div>
      )}
    </div>
  );
}
