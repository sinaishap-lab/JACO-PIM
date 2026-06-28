"use client";

import { useActionState, useRef, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveLabelSettingsAction,
  type SettingsState,
} from "@/app/(dashboard)/settings/actions";
import {
  ElementContent,
  SAMPLE_DATA,
} from "@/components/products/label-canvas";
import {
  ELEMENT_LABELS,
  type Align,
  type ElementKey,
  type LabelConfig,
  type LabelElement,
} from "@/lib/label-config";

const PX_PER_MM = 5; // on-screen editing scale
const PT_PER_MM = 2.834646;
const ALIGNS: { value: Align; label: string }[] = [
  { value: "right", label: "ימין" },
  { value: "center", label: "מרכז" },
  { value: "left", label: "שמאל" },
];

type DragState = {
  key: ElementKey;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
};

export function LabelDesigner({ config }: { config: LabelConfig }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveLabelSettingsAction,
    {}
  );
  const [cfg, setCfg] = useState<LabelConfig>(config);
  const [selected, setSelected] = useState<ElementKey | null>(null);
  const drag = useRef<DragState | null>(null);

  const px = (mm: number) => mm * PX_PER_MM;
  const font = (pt: number) => `${(pt / PT_PER_MM) * PX_PER_MM}px`;

  const updateEl = (key: ElementKey, patch: Partial<LabelElement>) =>
    setCfg((c) => ({
      ...c,
      elements: c.elements.map((e) => (e.key === key ? { ...e, ...patch } : e)),
    }));

  const onPointerDown = (
    e: React.PointerEvent,
    el: LabelElement,
    mode: "move" | "resize"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(el.key);
    drag.current = {
      key: el.key,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.w,
      origH: el.h,
    };

    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dxMm = (ev.clientX - d.startX) / PX_PER_MM;
      const dyMm = (ev.clientY - d.startY) / PX_PER_MM;
      setCfg((c) => ({
        ...c,
        elements: c.elements.map((it) => {
          if (it.key !== d.key) return it;
          if (d.mode === "move") {
            const x = Math.max(0, Math.min(c.widthMm - it.w, d.origX + dxMm));
            const y = Math.max(0, Math.min(c.heightMm - it.h, d.origY + dyMm));
            return { ...it, x: round(x), y: round(y) };
          }
          const w = Math.max(3, Math.min(c.widthMm - it.x, d.origW + dxMm));
          const h = Math.max(2, Math.min(c.heightMm - it.y, d.origH + dyMm));
          return { ...it, w: round(w), h: round(h) };
        }),
      }));
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const sel = cfg.elements.find((e) => e.key === selected) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="lw">רוחב (מ&quot;מ)</Label>
          <Input
            id="lw"
            type="number"
            dir="ltr"
            className="w-24"
            value={cfg.widthMm}
            onChange={(e) =>
              setCfg((c) => ({ ...c, widthMm: Number(e.target.value) || c.widthMm }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lh">גובה (מ&quot;מ)</Label>
          <Input
            id="lh"
            type="number"
            dir="ltr"
            className="w-24"
            value={cfg.heightMm}
            onChange={(e) =>
              setCfg((c) => ({ ...c, heightMm: Number(e.target.value) || c.heightMm }))
            }
          />
        </div>
        <p className="text-muted-foreground text-sm">
          גררו אלמנט להזזה, וגררו את הפינה השמאלית-תחתונה לשינוי גודל.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {/* Canvas */}
        <div
          className="bg-muted/30 rounded-md p-4"
          onPointerDown={() => setSelected(null)}
        >
          <div
            className="relative bg-white shadow"
            style={{ width: px(cfg.widthMm), height: px(cfg.heightMm) }}
          >
            {cfg.elements
              .filter((e) => e.enabled)
              .map((e) => {
                const isSel = e.key === selected;
                return (
                  <div
                    key={e.key}
                    onPointerDown={(ev) => onPointerDown(ev, e, "move")}
                    style={{
                      position: "absolute",
                      left: px(e.x),
                      top: px(e.y),
                      width: px(e.w),
                      height: px(e.h),
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        e.align === "left"
                          ? "flex-start"
                          : e.align === "right"
                            ? "flex-end"
                            : "center",
                      overflow: "hidden",
                      cursor: "move",
                      outline: isSel
                        ? "2px solid var(--brand-pink)"
                        : "1px dashed #cbcbd1",
                    }}
                  >
                    <ElementContent el={e} data={SAMPLE_DATA} fontSize={font(e.fontPt)} />
                    {isSel && (
                      <span
                        onPointerDown={(ev) => onPointerDown(ev, e, "resize")}
                        style={{
                          position: "absolute",
                          right: -4,
                          bottom: -4,
                          width: 10,
                          height: 10,
                          background: "var(--brand-pink)",
                          borderRadius: 2,
                          cursor: "nwse-resize",
                        }}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Inspector */}
        <div className="min-w-56 flex-1 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">אלמנטים</p>
            <div className="flex flex-wrap gap-2">
              {cfg.elements.map((e) => (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => {
                    updateEl(e.key, { enabled: !e.enabled });
                    if (!e.enabled) setSelected(e.key);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    e.enabled
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {ELEMENT_LABELS[e.key]}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              לחיצה מדליקה/מכבה אלמנט במדבקה.
            </p>
          </div>

          {sel && sel.enabled && (
            <div className="space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">{ELEMENT_LABELS[sel.key]}</p>
              {sel.key !== "logo" && sel.key !== "barcode" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">גודל גופן (pt)</Label>
                    <Input
                      type="number"
                      dir="ltr"
                      className="h-8 w-24"
                      value={sel.fontPt}
                      onChange={(ev) =>
                        updateEl(sel.key, { fontPt: Number(ev.target.value) || sel.fontPt })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">יישור</Label>
                    <div className="flex gap-1">
                      {ALIGNS.map((al) => (
                        <Button
                          key={al.value}
                          type="button"
                          size="sm"
                          variant={sel.align === al.value ? "default" : "outline"}
                          onClick={() => updateEl(sel.key, { align: al.value })}
                        >
                          {al.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <p className="text-muted-foreground text-xs">
                מיקום {round(sel.x)},{round(sel.y)} · גודל {round(sel.w)}×
                {round(sel.h)} מ&quot;מ
              </p>
            </div>
          )}
        </div>
      </div>

      <form action={formAction} className="flex items-center gap-3">
        <input type="hidden" name="config" value={JSON.stringify(cfg)} />
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : "שמירת עיצוב המדבקה"}
        </Button>
        {state.error && <span className="text-destructive text-sm">{state.error}</span>}
        {state.ok && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
            <Check className="size-4" />
            נשמר
          </span>
        )}
      </form>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
