"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductImagesField } from "@/components/products/product-images-field";
import { cn } from "@/lib/utils";
import { usageUnitOptions } from "@/lib/schemas/product";
import {
  pricePerCm2,
  sizeCost,
  type MaterialForm,
} from "@/lib/material-cost";
import type { ProductFormState } from "@/app/(dashboard)/products/actions";
import type {
  AttributeDefinition,
  Product,
  ProductType,
  Supplier,
} from "@/lib/types";
import type { DepartmentNode } from "@/lib/services/classification.service";
import type { RawMaterialOption } from "@/lib/services/component.service";

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

type Action = (
  state: ProductFormState,
  formData: FormData
) => Promise<ProductFormState>;

export type SupplierRow = {
  supplierId: string;
  costPrice: string;
  supplierSku: string;
  supplierName: string;
  isPreferred: boolean;
};
export type SizeRow = { value: string; price: string; costPrice: string };
type PricingMode = "single" | "sized";
export type ColorRow = { value: string; letter: string };
export type ComponentRow = { componentId: string; quantity: string };

/** Initial collection data when editing an existing product. */
export type ProductFormInitial = {
  pricingMode: PricingMode;
  suppliers: SupplierRow[];
  sizes: SizeRow[];
  colors: ColorRow[];
  components: ComponentRow[];
  variantSku: Record<string, string>;
  variantCost: Record<string, string>;
  fieldValues: Record<string, unknown>;
  images?: { url: string; isPrimary: boolean }[];
};

function vKey(supplierId: string, size: string | null, color: string | null) {
  return `${supplierId}::${size ?? ""}::${color ?? ""}`;
}

export function ProductCreateForm({
  action,
  product,
  initialType,
  tree = [],
  suppliers = [],
  rawMaterials = [],
  attributes = [],
  initial,
}: {
  action: Action;
  product?: Product;
  initialType?: ProductType;
  tree?: DepartmentNode[];
  suppliers?: Supplier[];
  rawMaterials?: RawMaterialOption[];
  attributes?: AttributeDefinition[];
  initial?: ProductFormInitial;
}) {
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  const type: ProductType = product?.type ?? initialType ?? "finished";
  const isFinished = type === "finished";
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    initial?.pricingMode ?? "single"
  );
  const sized = isFinished && pricingMode === "sized";

  const [deptId, setDeptId] = useState(product?.departmentId ?? "");
  const [subId, setSubId] = useState(product?.subDepartmentId ?? "");
  const [modelId, setModelId] = useState(product?.modelId ?? "");
  const subOptions = tree.find((d) => d.id === deptId)?.subDepartments ?? [];
  const modelOptions = subOptions.find((s) => s.id === subId)?.models ?? [];

  const [costStr, setCostStr] = useState(
    product?.costPrice != null ? String(product.costPrice) : ""
  );
  const [saleStr, setSaleStr] = useState(
    product?.salePrice != null ? String(product.salePrice) : ""
  );
  const [contentStr, setContentStr] = useState(
    product?.contentAmount != null ? String(product.contentAmount) : ""
  );
  const [usageUnit, setUsageUnit] = useState(product?.usageUnit ?? "יחידה");
  // Raw-material area pricing (sheet/roll).
  const [materialForm, setMaterialForm] = useState<MaterialForm>(
    product?.materialForm ?? "simple"
  );
  const [sheetW, setSheetW] = useState(
    product?.sheetWidthCm != null ? String(product.sheetWidthCm) : ""
  );
  const [sheetH, setSheetH] = useState(
    product?.sheetHeightCm != null ? String(product.sheetHeightCm) : ""
  );
  const [wasteStr, setWasteStr] = useState(
    product?.wastePercent != null ? String(product.wastePercent) : ""
  );

  const [supplierRows, setSupplierRows] = useState<SupplierRow[]>(
    initial?.suppliers ?? []
  );
  const [sizes, setSizes] = useState<SizeRow[]>(initial?.sizes ?? []);
  const [colors, setColors] = useState<ColorRow[]>(initial?.colors ?? []);
  const [components, setComponents] = useState<ComponentRow[]>(
    initial?.components ?? []
  );
  const [variantSku, setVariantSku] = useState<Record<string, string>>(
    initial?.variantSku ?? {}
  );
  const [variantCost, setVariantCost] = useState<Record<string, string>>(
    initial?.variantCost ?? {}
  );
  const fieldValues = initial?.fieldValues ?? {};

  const errorText = "text-destructive text-sm";

  // Live cost helpers.
  const costNum = parseFloat(costStr);
  const contentNum = parseFloat(contentStr);
  const unitCost =
    !Number.isNaN(costNum) && contentNum > 0
      ? costNum / contentNum
      : !Number.isNaN(costNum)
        ? costNum
        : null;
  const saleNum = parseFloat(saleStr);
  const margin =
    !Number.isNaN(saleNum) && !Number.isNaN(costNum) ? saleNum - costNum : null;

  // Live derived price per m² for the raw-material section (sheet/roll).
  const pricePerM2 = useMemo(() => {
    const ppc = pricePerCm2({
      materialForm,
      costPrice: Number.isNaN(costNum) ? null : costNum,
      sheetWidthCm: parseFloat(sheetW) || null,
      sheetHeightCm: parseFloat(sheetH) || null,
      wastePercent: parseFloat(wasteStr) || null,
    });
    return ppc == null ? null : ppc * 10000; // cm² → m²
  }, [materialForm, costNum, sheetW, sheetH, wasteStr]);

  // Map of raw-material id → its area-pricing data, for auto cost on sizes.
  const materialById = useMemo(
    () => new Map(rawMaterials.map((m) => [m.id, m])),
    [rawMaterials]
  );

  /** Auto cost of one size from the recipe's sheet/roll (+ simple) materials. */
  const autoCostForSize = (sizeValue: string): number | null => {
    let total = 0;
    let any = false;
    for (const c of components) {
      const m = materialById.get(c.componentId);
      if (!m) continue;
      const qty = parseFloat(c.quantity) || 1;
      if (m.materialForm === "sheet" || m.materialForm === "roll") {
        const sc = sizeCost(m, sizeValue);
        if (sc != null) {
          total += sc * qty;
          any = true;
        }
      } else if (m.unitCost != null) {
        total += m.unitCost * qty;
        any = true;
      }
    }
    return any ? total : null;
  };

  const hasAreaMaterial = components.some((c) => {
    const m = materialById.get(c.componentId);
    return m?.materialForm === "sheet" || m?.materialForm === "roll";
  });

  const applyAutoCosts = () =>
    setSizes((rows) =>
      rows.map((r) => {
        const c = autoCostForSize(r.value.trim());
        return c != null ? { ...r, costPrice: c.toFixed(2) } : r;
      })
    );

  // Sale price = cost × multiplier (e.g. ×3). Uses each size's current cost,
  // falling back to the auto-computed cost from the raw material.
  const [markupStr, setMarkupStr] = useState("");
  const applyAutoPrices = () =>
    setSizes((rows) =>
      rows.map((r) => {
        const mult = parseFloat(markupStr);
        if (!(mult > 0)) return r;
        const cost =
          parseFloat(r.costPrice) || autoCostForSize(r.value.trim()) || 0;
        if (!(cost > 0)) return r;
        return { ...r, price: (cost * mult).toFixed(2) };
      })
    );

  // Variant combos for the per-variant SKU matrix.
  const sizeVals = sizes.map((s) => s.value.trim()).filter(Boolean);
  const colorVals = colors.map((c) => c.value.trim()).filter(Boolean);
  const hasVariants = sizeVals.length > 0 || colorVals.length > 0;
  const combos: { size: string | null; color: string | null }[] = (
    sizeVals.length ? sizeVals : [null]
  ).flatMap((size) =>
    (colorVals.length ? colorVals : [null]).map((color) => ({ size, color }))
  );
  const linkedSuppliers = supplierRows.filter((r) => r.supplierId);

  // Serialized collections sent to the server action.
  const variantSkuEntries = linkedSuppliers.flatMap((r) =>
    combos
      .map((c) => {
        const k = vKey(r.supplierId, c.size, c.color);
        return {
          supplierId: r.supplierId,
          size: c.size,
          color: c.color,
          sku: variantSku[k] ?? "",
          cost: variantCost[k] ?? "",
        };
      })
      .filter((e) => e.sku.trim() || e.cost.trim())
  );

  // Which extra fields are enabled (on if they already hold a value).
  const [fieldOn, setFieldOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      attributes.map((a) => {
        const v = fieldValues[a.id];
        const on =
          v != null && v !== "" && !(Array.isArray(v) && v.length === 0);
        return [a.id, on];
      })
    )
  );

  const supplierName = (id: string) =>
    suppliers.find((s) => s.id === id)?.name ?? "ספק";

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {/* Hidden basics + serialized collections */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="departmentId" value={deptId} />
      <input type="hidden" name="subDepartmentId" value={subId} />
      <input type="hidden" name="modelId" value={modelId} />
      <input
        type="hidden"
        name="suppliers"
        value={JSON.stringify(linkedSuppliers)}
      />
      <input
        type="hidden"
        name="sizes"
        value={JSON.stringify(sized ? sizes.filter((s) => s.value.trim()) : [])}
      />
      <input
        type="hidden"
        name="colors"
        value={JSON.stringify(sized ? colors.filter((c) => c.value.trim()) : [])}
      />
      <input
        type="hidden"
        name="components"
        value={JSON.stringify(components.filter((c) => c.componentId))}
      />
      <input
        type="hidden"
        name="variantSkus"
        value={JSON.stringify(sized ? variantSkuEntries : [])}
      />

      {/* ── Basic ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">פרטים בסיסיים</h2>
        {product && (
          <div className="space-y-1">
            <Label>מק&quot;ט</Label>
            {product.sku ? (
              <p className="font-mono text-sm" dir="ltr">
                {product.sku}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                ייווצר אוטומטית מקוד הספק, הסיווג והמספר הרץ.
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">שם המוצר *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            placeholder="לדוגמה: תמונה מודפסת 10x15"
          />
          {state.fieldErrors?.name && (
            <p className={errorText}>{state.fieldErrors.name[0]}</p>
          )}
        </div>

        {isFinished ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>תמחור</Label>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    checked={pricingMode === "single"}
                    onChange={() => setPricingMode("single")}
                    className="size-4"
                  />
                  מוצר יחיד (מחיר אחד)
                </label>
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    checked={pricingMode === "sized"}
                    onChange={() => setPricingMode("sized")}
                    className="size-4"
                  />
                  מוצר עם גדלים (מחיר לכל גודל)
                </label>
              </div>
            </div>

            {pricingMode === "single" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">מחיר מכירה (₪)</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={saleStr}
                    onChange={(e) => setSaleStr(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">מחיר קנייה (עלות) (₪)</Label>
                  <Input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costStr}
                    onChange={(e) => setCostStr(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="bg-muted/50 rounded-md px-3 py-2 text-sm sm:col-span-2">
                  רווח:{" "}
                  <span className="font-semibold">
                    {margin == null
                      ? "—"
                      : `₪${margin.toLocaleString("he-IL", {
                          maximumFractionDigits: 2,
                        })}`}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                המחירים (קנייה ומכירה) נקבעים לכל גודל בקטע &quot;גדלים&quot;
                למטה.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border p-4">
            {/* Submitted with the product form. */}
            <input type="hidden" name="materialForm" value={materialForm} />
            <input
              type="hidden"
              name="sheetWidthCm"
              value={materialForm !== "simple" ? sheetW : ""}
            />
            <input
              type="hidden"
              name="sheetHeightCm"
              value={materialForm === "sheet" ? sheetH : ""}
            />
            <input
              type="hidden"
              name="wastePercent"
              value={materialForm !== "simple" ? wasteStr : ""}
            />

            <div className="space-y-2">
              <Label>צורת חומר הגלם</Label>
              <select
                value={materialForm}
                onChange={(e) => setMaterialForm(e.target.value as MaterialForm)}
                className={selectClass}
              >
                <option value="simple">פשוט — מחיר לפי יחידה</option>
                <option value="sheet">פלטה — תמחור לפי מ&quot;ר</option>
                <option value="roll">גליל — תמחור לפי מטר רץ</option>
              </select>
            </div>

            {materialForm === "simple" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">מחיר לאריזה (₪)</Label>
                  <Input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costStr}
                    onChange={(e) => setCostStr(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packUnit">יחידת רכישה</Label>
                  <Input
                    id="packUnit"
                    name="packUnit"
                    defaultValue={product?.packUnit ?? ""}
                    placeholder="גליל / פלטה"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentAmount">כמות באריזה</Label>
                  <Input
                    id="contentAmount"
                    name="contentAmount"
                    type="number"
                    step="any"
                    min="0"
                    value={contentStr}
                    onChange={(e) => setContentStr(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageUnit">יחידת שימוש</Label>
                  <select
                    id="usageUnit"
                    name="usageUnit"
                    value={usageUnit}
                    onChange={(e) => setUsageUnit(e.target.value)}
                    className={selectClass}
                  >
                    {usageUnitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-muted/50 rounded-md px-3 py-2 text-sm sm:col-span-2">
                  עלות ליחידה:{" "}
                  <span className="font-semibold">
                    {unitCost == null
                      ? "—"
                      : `₪${unitCost.toLocaleString("he-IL", {
                          maximumFractionDigits: 4,
                        })} / ${usageUnit}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">
                    {materialForm === "sheet"
                      ? "מחיר הפלטה (₪)"
                      : "מחיר למטר רץ (₪)"}
                  </Label>
                  <Input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costStr}
                    onChange={(e) => setCostStr(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {materialForm === "sheet"
                      ? 'רוחב הפלטה (ס"מ)'
                      : 'רוחב הגליל (ס"מ)'}
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={sheetW}
                    onChange={(e) => setSheetW(e.target.value)}
                    placeholder="120"
                  />
                </div>
                {materialForm === "sheet" && (
                  <div className="space-y-2">
                    <Label>גובה הפלטה (ס&quot;מ)</Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={sheetH}
                      onChange={(e) => setSheetH(e.target.value)}
                      placeholder="244"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>אחוז פחת (%)</Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={wasteStr}
                    onChange={(e) => setWasteStr(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="bg-muted/50 rounded-md px-3 py-2 text-sm sm:col-span-2">
                  מחיר למ&quot;ר:{" "}
                  <span className="font-semibold">
                    {pricePerM2 == null
                      ? "—"
                      : `₪${pricePerM2.toLocaleString("he-IL", {
                          maximumFractionDigits: 2,
                        })} / מ"ר`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">תיאור</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label>תמונות מוצר</Label>
          <ProductImagesField defaultImages={initial?.images ?? []} />
        </div>

        {tree.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>מחלקה</Label>
              <select
                value={deptId}
                onChange={(e) => {
                  setDeptId(e.target.value);
                  setSubId("");
                  setModelId("");
                }}
                className={selectClass}
              >
                <option value="">— ללא —</option>
                {tree.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>תת-מחלקה</Label>
              <select
                value={subId}
                disabled={!deptId}
                onChange={(e) => {
                  setSubId(e.target.value);
                  setModelId("");
                }}
                className={selectClass}
              >
                <option value="">— ללא —</option>
                {subOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>דגם</Label>
              <select
                value={modelId}
                disabled={!subId}
                onChange={(e) => setModelId(e.target.value)}
                className={selectClass}
              >
                <option value="">— ללא —</option>
                {modelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* ── Variants (sized finished products) ── */}
      {sized && (
        <section className="grid gap-6 border-t pt-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">גדלים (מחיר לכל גודל)</h2>
              <div className="flex flex-wrap items-center gap-2">
                {hasAreaMaterial && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyAutoCosts}
                    title="חשב עלות לכל גודל לפי שטח × מחיר חומר הגלם"
                  >
                    חשב עלות מחומר גלם
                  </Button>
                )}
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={markupStr}
                    onChange={(e) => setMarkupStr(e.target.value)}
                    placeholder="×3"
                    className="h-8 w-16"
                    aria-label="מכפיל מחיר"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyAutoPrices}
                    title="מחיר מכירה = עלות × מכפיל"
                  >
                    חשב מחיר מכירה
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSizes((s) => [
                      ...s,
                      { value: "", price: "", costPrice: "" },
                    ])
                  }
                >
                  <Plus />
                  גודל
                </Button>
              </div>
            </div>
            {sizes.map((s, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">גודל</label>
                  <Input
                    value={s.value}
                    onChange={(e) =>
                      setSizes((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, value: e.target.value } : r
                        )
                      )
                    }
                    placeholder="10.15"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs font-medium">עלות (₪)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={s.costPrice}
                    onChange={(e) =>
                      setSizes((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, costPrice: e.target.value } : r
                        )
                      )
                    }
                    placeholder={
                      autoCostForSize(s.value.trim())?.toFixed(2) ?? "0.00"
                    }
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs font-medium">מחיר מכירה</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={s.price}
                    onChange={(e) =>
                      setSizes((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, price: e.target.value } : r
                        )
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="הסר גודל"
                  onClick={() =>
                    setSizes((rows) => rows.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">צבעים</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setColors((c) => [...c, { value: "", letter: "" }])
                }
              >
                <Plus />
                צבע
              </Button>
            </div>
            {colors.map((c, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">צבע</label>
                  <Input
                    value={c.value}
                    onChange={(e) =>
                      setColors((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, value: e.target.value } : r
                        )
                      )
                    }
                    placeholder="אדום"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-xs font-medium">אות</label>
                  <Input
                    dir="ltr"
                    maxLength={3}
                    className="font-mono uppercase"
                    value={c.letter}
                    onChange={(e) =>
                      setColors((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, letter: e.target.value } : r
                        )
                      )
                    }
                    placeholder="R"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="הסר צבע"
                  onClick={() =>
                    setColors((rows) => rows.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Suppliers ── */}
      <section className="space-y-3 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ספקים</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSupplierRows((r) => [
                ...r,
                {
                  supplierId: "",
                  costPrice: "",
                  supplierSku: "",
                  supplierName: "",
                  isPreferred: r.length === 0,
                },
              ])
            }
          >
            <Plus />
            הוסף ספק
          </Button>
        </div>
        {suppliers.length === 0 && (
          <p className="text-muted-foreground text-sm">
            אין ספקים. הוסיפו קודם ספקים במסך <b>ספקים</b>.
          </p>
        )}
        {sized && supplierRows.length > 0 && (
          <p className="text-muted-foreground text-sm">
            מחיר המכירה נקבע לכל גודל (בקטע &quot;גדלים&quot;); מחיר העלות
            והמק&quot;ט נקבעים לכל וריאנט ולכל ספק (בקטע &quot;מק&quot;ט ועלות
            ספק לכל וריאנט&quot;).
          </p>
        )}
        {supplierRows.map((row, i) => (
          <div key={i} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">ספק</label>
              <select
                value={row.supplierId}
                onChange={(e) =>
                  setSupplierRows((rows) =>
                    rows.map((r, j) =>
                      j === i ? { ...r, supplierId: e.target.value } : r
                    )
                  )
                }
                className={selectClass}
              >
                <option value="">— בחרו ספק —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.code ? ` (${s.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {!sized && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">מחיר עלות (₪)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.costPrice}
                  onChange={(e) =>
                    setSupplierRows((rows) =>
                      rows.map((r, j) =>
                        j === i ? { ...r, costPrice: e.target.value } : r
                      )
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            )}
            {!sized && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">מק&quot;ט אצל הספק</label>
                <Input
                  dir="ltr"
                  value={row.supplierSku}
                  onChange={(e) =>
                    setSupplierRows((rows) =>
                      rows.map((r, j) =>
                        j === i ? { ...r, supplierSku: e.target.value } : r
                      )
                    )
                  }
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">שם הספק למוצר</label>
              <Input
                value={row.supplierName}
                onChange={(e) =>
                  setSupplierRows((rows) =>
                    rows.map((r, j) =>
                      j === i ? { ...r, supplierName: e.target.value } : r
                    )
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={row.isPreferred}
                onChange={() =>
                  setSupplierRows((rows) =>
                    rows.map((r, j) => ({ ...r, isPreferred: j === i }))
                  )
                }
                className="border-input size-4 rounded"
              />
              ספק ראשי
            </label>
            <div className="flex items-end sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="הסר ספק"
                onClick={() =>
                  setSupplierRows((rows) => rows.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* ── Per-variant supplier SKUs ── */}
      {sized && hasVariants && (
        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">
            מק&quot;ט ועלות ספק לכל וריאנט
          </h2>
          <p className="text-muted-foreground text-sm">
            כאן מזינים את מק&quot;ט הספק והעלות לכל גודל — לא בשדה הגודל.
          </p>
          {linkedSuppliers.length === 0 && (
            <p className="text-destructive text-sm">
              הוסיפו ספק בקטע &quot;ספקים&quot; למעלה כדי להזין מק&quot;ט ועלות.
            </p>
          )}
          {linkedSuppliers.map((sup) => (
            <div key={sup.supplierId} className="space-y-2">
              <h3 className="text-sm font-semibold">
                {supplierName(sup.supplierId)}
              </h3>
              <div className="space-y-2">
                {combos.map((c) => (
                  <div
                    key={vKey(sup.supplierId, c.size, c.color)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-muted-foreground w-28 text-sm">
                      {c.size ?? "—"} / {c.color ?? "—"}
                    </span>
                    <Input
                      dir="ltr"
                      className="h-8 flex-1"
                      placeholder="מק״ט"
                      value={
                        variantSku[vKey(sup.supplierId, c.size, c.color)] ?? ""
                      }
                      onChange={(e) =>
                        setVariantSku((m) => ({
                          ...m,
                          [vKey(sup.supplierId, c.size, c.color)]:
                            e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-8 w-28"
                      placeholder="עלות ₪"
                      value={
                        variantCost[vKey(sup.supplierId, c.size, c.color)] ?? ""
                      }
                      onChange={(e) =>
                        setVariantCost((m) => ({
                          ...m,
                          [vKey(sup.supplierId, c.size, c.color)]:
                            e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Recipe (finished only) ── */}
      {isFinished && (
        <section className="space-y-3 border-t pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">מתכון (חומרי גלם)</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={rawMaterials.length === 0}
              onClick={() =>
                setComponents((c) => [...c, { componentId: "", quantity: "1" }])
              }
            >
              <Plus />
              רכיב
            </Button>
          </div>
          {rawMaterials.length === 0 && (
            <p className="text-muted-foreground text-sm">
              אין חומרי גלם להוספה.
            </p>
          )}
          {components.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium">חומר גלם</label>
                <select
                  value={row.componentId}
                  onChange={(e) =>
                    setComponents((rows) =>
                      rows.map((r, j) =>
                        j === i ? { ...r, componentId: e.target.value } : r
                      )
                    )
                  }
                  className={selectClass}
                >
                  <option value="">— בחרו —</option>
                  {rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24 space-y-1">
                <label className="text-xs font-medium">כמות</label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={row.quantity}
                  onChange={(e) =>
                    setComponents((rows) =>
                      rows.map((r, j) =>
                        j === i ? { ...r, quantity: e.target.value } : r
                      )
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="הסר רכיב"
                onClick={() =>
                  setComponents((rows) => rows.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="text-destructive size-4" />
              </Button>
            </div>
          ))}
        </section>
      )}

      {/* ── Extra fields ── */}
      {attributes.length > 0 && (
        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">שדות נוספים</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {attributes.map((a) => (
              <div key={a.id} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={fieldOn[a.id] ?? false}
                    onChange={(e) =>
                      setFieldOn((p) => ({ ...p, [a.id]: e.target.checked }))
                    }
                    className="border-input size-4 rounded"
                  />
                  {a.label}
                </label>
                {fieldOn[a.id] && (
                  <AttributeInput attr={a} value={fieldValues[a.id]} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-2 border-t pt-6">
        <Button type="submit" disabled={pending} className="bg-brand-gradient hover:brightness-105">
          {pending ? "שומר…" : product ? "שמירת שינויים" : "צור מוצר"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={isFinished ? "/products" : "/materials"}>ביטול</Link>
        </Button>
      </div>
    </form>
  );
}

/** The control for one extra field (label is carried by the enable toggle). */
function AttributeInput({
  attr,
  value,
}: {
  attr: AttributeDefinition;
  value?: unknown;
}) {
  const field = `attr_${attr.id}`;
  const str = value == null ? "" : String(value);
  const selected = Array.isArray(value) ? value.map((v) => String(v)) : [];

  if (attr.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={field}
          defaultChecked={value === true}
          className="border-input size-4 rounded"
        />
        כן
      </label>
    );
  }

  if (attr.type === "multiselect") {
    return (
      <div className="space-y-1.5 rounded-md border p-3">
        {(attr.options ?? []).map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={field}
              value={opt}
              defaultChecked={selected.includes(opt)}
              className="border-input size-4 rounded"
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (attr.type === "select") {
    return (
      <select id={field} name={field} defaultValue={str} className={selectClass}>
        <option value="">— ללא —</option>
        {(attr.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      id={field}
      name={field}
      type={
        attr.type === "number"
          ? "number"
          : attr.type === "date"
            ? "date"
            : "text"
      }
      step={attr.type === "number" ? "any" : undefined}
      defaultValue={str}
    />
  );
}
