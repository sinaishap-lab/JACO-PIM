"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { productTypeLabels, usageUnitOptions } from "@/lib/schemas/product";
import type { ProductFormState } from "@/app/(dashboard)/products/actions";
import type { Product, ProductType } from "@/lib/types";

const statusOptions = [
  { value: "draft", label: "טיוטה" },
  { value: "published", label: "פורסם" },
  { value: "archived", label: "בארכיון" },
];

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
}: {
  action: Action;
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});
  const [type, setType] = useState<ProductType>(product?.type ?? "finished");
  const [costStr, setCostStr] = useState(
    product?.costPrice != null ? String(product.costPrice) : ""
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

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="type">סוג מוצר</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as ProductType)}
          className={selectClass}
        >
          {(Object.keys(productTypeLabels) as ProductType[]).map((t) => (
            <option key={t} value={t}>
              {productTypeLabels[t]}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">
          {type === "finished"
            ? "מוצר שנמכר ללקוח. העלות תחושב מחומרי הגלם שלו."
            : "חומר גלם שלא נמכר כמו שהוא, עם מחיר עלות."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">מק&quot;ט *</Label>
        <Input
          id="sku"
          name="sku"
          defaultValue={product?.sku}
          aria-invalid={Boolean(state.fieldErrors?.sku)}
          placeholder="לדוגמה: PHOTO-10X15"
        />
        {state.fieldErrors?.sku && (
          <p className={errorText}>{state.fieldErrors.sku[0]}</p>
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

      {type === "finished" ? (
        <div className="space-y-2">
          <Label htmlFor="salePrice">מחיר מכירה (₪)</Label>
          <Input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.salePrice ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.salePrice)}
            placeholder="0.00"
          />
          {state.fieldErrors?.salePrice && (
            <p className={errorText}>{state.fieldErrors.salePrice[0]}</p>
          )}
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

      <div className="space-y-2">
        <Label htmlFor="status">סטטוס</Label>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "draft"}
          className={selectClass}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

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
