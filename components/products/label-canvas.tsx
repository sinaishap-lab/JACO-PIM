"use client";

import { useMemo } from "react";

import { JacoMark } from "@/components/brand/jaco-logo";
import { code128 } from "@/lib/barcode";
import type { LabelConfig, LabelElement } from "@/lib/label-config";

export interface StickerData {
  sku: string;
  name: string;
  size: string;
  price: number | null;
}

export const SAMPLE_DATA: StickerData = {
  sku: "DL03001-10.15",
  name: "מוצר לדוגמה",
  size: "10.15",
  price: 59,
};

export function formatPrice(price: number | null): string {
  if (price == null) return "";
  return `₪${price.toLocaleString("he-IL")}`;
}

function Barcode({ value }: { value: string }) {
  const { rects, modules } = useMemo(() => code128(value || " "), [value]);
  return (
    <svg
      width="100%"
      height="100%"
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

/** Renders the content of one element (no positioning). */
export function ElementContent({
  el,
  data,
  fontSize,
}: {
  el: LabelElement;
  data: StickerData;
  fontSize: string;
}) {
  switch (el.key) {
    case "logo":
      return <JacoMark className="h-full w-auto" />;
    case "barcode":
      return <Barcode value={data.sku} />;
    case "name":
      return (
        <span style={{ fontSize, fontWeight: 700, lineHeight: 1.05 }}>
          {data.name}
        </span>
      );
    case "size":
      return <span style={{ fontSize }}>{data.size}</span>;
    case "sku":
      return (
        <span dir="ltr" style={{ fontSize, fontFamily: "var(--font-mono, monospace)" }}>
          {data.sku}
        </span>
      );
    case "price":
      return (
        <span style={{ fontSize, fontWeight: 800 }}>{formatPrice(data.price)}</span>
      );
    default:
      return null;
  }
}

const PT_PER_MM = 2.834646;

/**
 * Renders a label at absolute positions. When `pxPerMm` is given the canvas is
 * drawn in pixels (on-screen preview/editor); otherwise it renders in real mm
 * (for printing).
 */
export function LabelCanvas({
  config,
  data = SAMPLE_DATA,
  pxPerMm,
  className = "",
}: {
  config: LabelConfig;
  data?: StickerData;
  pxPerMm?: number;
  className?: string;
}) {
  const unit = (mm: number) => (pxPerMm ? `${mm * pxPerMm}px` : `${mm}mm`);
  const font = (pt: number) =>
    pxPerMm ? `${(pt / PT_PER_MM) * pxPerMm}px` : `${pt}pt`;

  return (
    <div
      className={`label-canvas ${className}`}
      style={{
        position: "relative",
        width: unit(config.widthMm),
        height: unit(config.heightMm),
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {config.elements
        .filter((e) => e.enabled)
        .map((e) => (
          <div
            key={e.key}
            style={{
              position: "absolute",
              left: unit(e.x),
              top: unit(e.y),
              width: unit(e.w),
              height: unit(e.h),
              display: "flex",
              alignItems: "center",
              justifyContent:
                e.align === "left"
                  ? "flex-start"
                  : e.align === "right"
                    ? "flex-end"
                    : "center",
              overflow: "hidden",
            }}
          >
            <ElementContent el={e} data={data} fontSize={font(e.fontPt)} />
          </div>
        ))}
    </div>
  );
}
