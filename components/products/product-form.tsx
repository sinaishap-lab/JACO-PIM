"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usageUnitOptions } from "@/lib/schemas/product";
import type { ProductFormState } from "@/app/(dashboard)/products/actions";
import type { Product, ProductType, Supplier } from "@/lib/types";
import type { DepartmentNode } from "@/lib/services/classification.service";

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

type Action = (
  state: ProductFormState,
  formData: FormData
) => Promise<ProductFormState>;

export function ProductForm({
  action,
  product,
  initialType,
  tree = [],
  suppliers = [],
  preferredSupplierId,
}: {
  action: Action;
  product?: Product;
  initialType?: ProductType;
  tree?: DepartmentNode[];
  suppliers?: Supplier[];
  preferredSupplierId?: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});
  // Product type is fixed by the route it was created from (product vs raw
  // material) — no longer chosen in the form.
  const type: ProductType = product?.type ?? initialType ?? "finished";
  const [deptId, setDeptId] = useState(product?.departmentId ?? "");
  const [subId, setSubId] = useState(product?.subDepartmentId ?? "");
  const [modelId, setModelId] = useState(product?.modelId ?? "");

  const subOptions = tree.find((d) => d.id === deptId)?.subDepartments ?? [];
  const modelOptions =
    subOptions.find((s) => s.id === subId)?.models ?? [];
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

  const errorText = "text-destructive text-sm";

  // Live per-unit cost for raw materials: package price ÷ content amount.
  const costNum = parseFloat(costStr);
  const contentNum = parseFloat(contentStr);
  const unitCost =
    !Number.isNaN(costNum) && contentNum > 0
      ? costNum / contentNum
      : !Number.isNaN(costNum)
        ? costNum
        : null;

  // Live profit for finished products: sale price − purchase cost.
  const saleNum = parseFloat(saleStr);
  const margin =
    !Number.isNaN(saleNum) && !Number.isNaN(costNum)
      ? saleNum - costNum
      : null;
  const marginPct =
    margin != null && saleNum > 0 ? (margin / saleNum) * 100 : null;

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="type" value={type} />

      <div className="space-y-2">
        <Label>מק&quot;ט</Label>
        {product?.sku ? (
          <p className="font-mono text-sm" dir="ltr">
            {product.sku}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            ייווצר אוטומטית מקוד הספק, הסיווג והמספר הרץ.
          </p>
        )}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="supplierId">ספק עיקרי</Label>
        <select
          id="supplierId"
          name="supplierId"
          defaultValue={preferredSupplierId ?? ""}
          className={selectClass}
        >
          <option value="">— ללא —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.code ? ` (${s.code})` : ""}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">
          הספק העיקרי של המוצר. קוד הספק משמש לג&apos;ינרוט המק&quot;ט. ניתן
          להוסיף ספקים נוספים ופרטי עלות במסך המוצר.
        </p>
      </div>

      {type === "finished" ? (
        <div className="space-y-4 rounded-lg border p-4">
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
                aria-invalid={Boolean(state.fieldErrors?.salePrice)}
                placeholder="0.00"
              />
              {state.fieldErrors?.salePrice && (
                <p className={errorText}>{state.fieldErrors.salePrice[0]}</p>
              )}
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
                aria-invalid={Boolean(state.fieldErrors?.costPrice)}
                placeholder="0.00"
              />
              {state.fieldErrors?.costPrice && (
                <p className={errorText}>{state.fieldErrors.costPrice[0]}</p>
              )}
            </div>
          </div>
          <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
            רווח:{" "}
            <span className="font-semibold">
              {margin == null
                ? "—"
                : `₪${margin.toLocaleString("he-IL", {
                    maximumFractionDigits: 2,
                  })}${
                    marginPct == null
                      ? ""
                      : ` (${marginPct.toLocaleString("he-IL", {
                          maximumFractionDigits: 1,
                        })}%)`
                  }`}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            עלות הקנייה היא לרכישת מוצר מוכן. למוצר המורכב מחומרי גלם, העלות
            מחושבת גם מהמתכון שבמסך המוצר.
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border p-4">
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
                aria-invalid={Boolean(state.fieldErrors?.costPrice)}
                placeholder="0.00"
              />
              {state.fieldErrors?.costPrice && (
                <p className={errorText}>{state.fieldErrors.costPrice[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="packUnit">יחידת רכישה</Label>
              <Input
                id="packUnit"
                name="packUnit"
                defaultValue={product?.packUnit ?? ""}
                placeholder="גליל / פלטה / אריזה"
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
                aria-invalid={Boolean(state.fieldErrors?.contentAmount)}
                placeholder="לדוגמה: 50"
              />
              {state.fieldErrors?.contentAmount && (
                <p className={errorText}>
                  {state.fieldErrors.contentAmount[0]}
                </p>
              )}
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
          </div>
          <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
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
      )}

      <div className="space-y-2">
        <Label htmlFor="description">תיאור</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.description)}
          placeholder="תיאור שיווקי של המוצר…"
        />
        {state.fieldErrors?.description && (
          <p className={errorText}>{state.fieldErrors.description[0]}</p>
        )}
      </div>

      {tree.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="departmentId">מחלקה</Label>
            <select
              id="departmentId"
              name="departmentId"
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
            <Label htmlFor="subDepartmentId">תת-מחלקה</Label>
            <select
              id="subDepartmentId"
              name="subDepartmentId"
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
            <Label htmlFor="modelId">דגם</Label>
            <select
              id="modelId"
              name="modelId"
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

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : product ? "שמירת שינויים" : "צור מוצר"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/products">ביטול</Link>
        </Button>
      </div>
    </form>
  );
}
