"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { paymentTermsLabels } from "@/lib/schemas/supplier";
import type { SupplierFormState } from "@/app/(dashboard)/suppliers/actions";
import type { PaymentTerms, Supplier } from "@/lib/types";

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

const paymentTermsKeys = Object.keys(paymentTermsLabels) as PaymentTerms[];

type Action = (
  state: SupplierFormState,
  formData: FormData
) => Promise<SupplierFormState>;

export function SupplierForm({
  action,
  supplier,
}: {
  action: Action;
  supplier?: Supplier;
}) {
  const [state, formAction, pending] = useActionState<
    SupplierFormState,
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

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="name">שם הספק *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={supplier?.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            placeholder="לדוגמה: דפוס הצפון בע״מ"
          />
          {state.fieldErrors?.name && (
            <p className={errorText}>{state.fieldErrors.name[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">קוד (למק&quot;ט)</Label>
          <Input
            id="code"
            name="code"
            dir="ltr"
            defaultValue={supplier?.code ?? ""}
            className="w-28 font-mono uppercase"
            placeholder="DH"
            aria-invalid={Boolean(state.fieldErrors?.code)}
          />
          {state.fieldErrors?.code && (
            <p className={errorText}>{state.fieldErrors.code[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactName">איש קשר *</Label>
          <Input
            id="contactName"
            name="contactName"
            defaultValue={supplier?.contactName ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.contactName)}
          />
          {state.fieldErrors?.contactName && (
            <p className={errorText}>{state.fieldErrors.contactName[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון *</Label>
          <Input
            id="phone"
            name="phone"
            dir="ltr"
            defaultValue={supplier?.phone ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
          {state.fieldErrors?.phone && (
            <p className={errorText}>{state.fieldErrors.phone[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            defaultValue={supplier?.email ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email && (
            <p className={errorText}>{state.fieldErrors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">תנאי תשלום</Label>
          <select
            id="paymentTerms"
            name="paymentTerms"
            defaultValue={supplier?.paymentTerms ?? ""}
            className={selectClass}
          >
            <option value="">— ללא —</option>
            {paymentTermsKeys.map((k) => (
              <option key={k} value={k}>
                {paymentTermsLabels[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">קישור לקטלוג / אתר</Label>
        <Input
          id="website"
          name="website"
          type="url"
          dir="ltr"
          defaultValue={supplier?.website ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.website)}
          placeholder="https://example.com"
        />
        {state.fieldErrors?.website && (
          <p className={errorText}>{state.fieldErrors.website[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={supplier?.notes ?? ""}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="bg-brand-gradient hover:brightness-105">
          {pending ? "שומר…" : supplier ? "שמירת שינויים" : "צור ספק"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/suppliers">ביטול</Link>
        </Button>
      </div>
    </form>
  );
}
