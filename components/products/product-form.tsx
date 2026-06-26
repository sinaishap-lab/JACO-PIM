"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProductFormState } from "@/app/(dashboard)/products/actions";
import type { Product } from "@/lib/types";

const statusOptions = [
  { value: "draft", label: "טיוטה" },
  { value: "published", label: "פורסם" },
  { value: "archived", label: "בארכיון" },
];

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

  const errorText = "text-destructive text-sm";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="sku">מק&quot;ט *</Label>
        <Input
          id="sku"
          name="sku"
          defaultValue={product?.sku}
          aria-invalid={Boolean(state.fieldErrors?.sku)}
          placeholder="לדוגמה: BTL-500-RED"
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
          placeholder="לדוגמה: בקבוק מים 500 מ&quot;ל"
        />
        {state.fieldErrors?.name && (
          <p className={errorText}>{state.fieldErrors.name[0]}</p>
        )}
      </div>

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
          className={cn(
            "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          )}
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
