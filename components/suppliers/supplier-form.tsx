"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SupplierFormState } from "@/app/(dashboard)/suppliers/actions";
import type { Supplier } from "@/lib/types";

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactName">איש קשר</Label>
          <Input
            id="contactName"
            name="contactName"
            defaultValue={supplier?.contactName ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} />
        </div>
      </div>

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
        <Label htmlFor="notes">הערות</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={supplier?.notes ?? ""}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : supplier ? "שמירת שינויים" : "צור ספק"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/suppliers">ביטול</Link>
        </Button>
      </div>
    </form>
  );
}
