"use client";

import { useActionState, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveLabelSettingsAction,
  type SettingsState,
} from "@/app/(dashboard)/settings/actions";
import { LabelSticker } from "@/components/products/label-sticker";
import type { LabelConfig } from "@/lib/label-config";

const FIELD_TOGGLES: { key: keyof LabelConfig; label: string }[] = [
  { key: "showLogo", label: "לוגו" },
  { key: "showName", label: "שם מוצר" },
  { key: "showSize", label: "גודל" },
  { key: "showBarcode", label: "ברקוד" },
  { key: "showSku", label: "מק\"ט (טקסט)" },
  { key: "showPrice", label: "מחיר" },
];

const SAMPLE = {
  sku: "DL03001-10.15",
  name: "מוצר לדוגמה",
  size: "10.15",
  price: 59,
};

export function LabelSettingsForm({ config }: { config: LabelConfig }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveLabelSettingsAction,
    {}
  );
  // Local copy drives the live preview as the user edits.
  const [cfg, setCfg] = useState<LabelConfig>(config);

  const num = (key: keyof LabelConfig, value: string) =>
    setCfg((c) => ({ ...c, [key]: Number(value) }));
  const toggle = (key: keyof LabelConfig, value: boolean) =>
    setCfg((c) => ({ ...c, [key]: value }));

  return (
    <div className="flex flex-wrap gap-8">
      <form action={formAction} className="max-w-md flex-1 space-y-5">
        {state.error && (
          <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="widthMm">רוחב (מ&quot;מ)</Label>
            <Input
              id="widthMm"
              name="widthMm"
              type="number"
              dir="ltr"
              value={cfg.widthMm}
              onChange={(e) => num("widthMm", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heightMm">גובה (מ&quot;מ)</Label>
            <Input
              id="heightMm"
              name="heightMm"
              type="number"
              dir="ltr"
              value={cfg.heightMm}
              onChange={(e) => num("heightMm", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameFontPt">גופן שם (pt)</Label>
            <Input
              id="nameFontPt"
              name="nameFontPt"
              type="number"
              dir="ltr"
              value={cfg.nameFontPt}
              onChange={(e) => num("nameFontPt", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceFontPt">גופן מחיר (pt)</Label>
            <Input
              id="priceFontPt"
              name="priceFontPt"
              type="number"
              dir="ltr"
              value={cfg.priceFontPt}
              onChange={(e) => num("priceFontPt", e.target.value)}
            />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">שדות להצגה</legend>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_TOGGLES.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={f.key}
                  checked={cfg[f.key] as boolean}
                  onChange={(e) => toggle(f.key, e.target.checked)}
                  className="border-input size-4 rounded"
                />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "שומר…" : "שמירת עיצוב המדבקה"}
          </Button>
          {state.ok && (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
              <Check className="size-4" />
              נשמר
            </span>
          )}
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">תצוגה מקדימה</p>
        <div className="bg-muted/30 inline-block rounded-md p-4">
          <LabelSticker data={SAMPLE} config={cfg} />
        </div>
      </div>
    </div>
  );
}
