"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  attributeTypeLabels,
  attributeAudienceLabels,
  type AttributeFormType,
  type AttributeAudienceType,
} from "@/lib/schemas/attribute";
import type { AttributeFormState } from "@/app/(dashboard)/attributes/actions";
import type { AttributeDefinition } from "@/lib/types";

type Action = (
  state: AttributeFormState,
  formData: FormData
) => Promise<AttributeFormState>;

const types = Object.keys(attributeTypeLabels) as AttributeFormType[];
const audiences = Object.keys(
  attributeAudienceLabels
) as AttributeAudienceType[];

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

export function AttributeForm({
  action,
  attribute,
}: {
  action: Action;
  attribute?: AttributeDefinition;
}) {
  const [state, formAction, pending] = useActionState<
    AttributeFormState,
    FormData
  >(action, {});
  const [type, setType] = useState<AttributeFormType>(
    (attribute?.type as AttributeFormType) ?? "text"
  );

  const errorText = "text-destructive text-sm";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">שם המאפיין *</Label>
        <Input
          id="label"
          name="label"
          defaultValue={attribute?.label}
          aria-invalid={Boolean(state.fieldErrors?.label)}
          placeholder="לדוגמה: צבע, נפח, חומר"
        />
        {state.fieldErrors?.label && (
          <p className={errorText}>{state.fieldErrors.label[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">קבוצה</Label>
        <select
          id="audience"
          name="audience"
          defaultValue={attribute?.audience ?? "supplier"}
          className={selectClass}
        >
          {audiences.map((a) => (
            <option key={a} value={a}>
              {attributeAudienceLabels[a]}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">
          מאפייני ספק הם מידע פנימי; מאפייני לקוח מוצגים בקטלוג השיווקי.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">סוג</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as AttributeFormType)}
          className={selectClass}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {attributeTypeLabels[t]}
            </option>
          ))}
        </select>
      </div>

      {(type === "select" || type === "multiselect") && (
        <div className="space-y-2">
          <Label htmlFor="options">אפשרויות (שורה לכל אפשרות)</Label>
          <Textarea
            id="options"
            name="options"
            rows={4}
            defaultValue={attribute?.options?.join("\n") ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.options)}
            placeholder={"אדום\nכחול\nירוק"}
          />
          {state.fieldErrors?.options && (
            <p className={errorText}>{state.fieldErrors.options[0]}</p>
          )}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="required"
          defaultChecked={attribute?.required}
          className="size-4 rounded border-input"
        />
        שדה חובה
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : attribute ? "שמירת שינויים" : "צור מאפיין"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/attributes">ביטול</Link>
        </Button>
      </div>
    </form>
  );
}
