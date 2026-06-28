"use client";

import { useActionState, useState } from "react";
import { Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  saveProductAttributesAction,
  type AttributeValuesState,
} from "@/app/(dashboard)/products/actions";
import type { AttributeDefinition } from "@/lib/types";

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

function isUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/** True when a stored value means "this field is in use". */
function hasValue(value: unknown): boolean {
  if (value == null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** The input control for one field (no label — the toggle carries the label). */
function FieldControl({
  attr,
  value,
}: {
  attr: AttributeDefinition;
  value: unknown;
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
    <>
      <Input
        id={field}
        name={field}
        type={
          attr.type === "number" ? "number" : attr.type === "date" ? "date" : "text"
        }
        step={attr.type === "number" ? "any" : undefined}
        defaultValue={str}
        dir={attr.type === "text" && isUrl(str) ? "ltr" : undefined}
      />
      {attr.type === "text" && isUrl(str) && (
        <a
          href={str.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 text-xs"
        >
          <ExternalLink className="size-3" />
          פתח קישור
        </a>
      )}
    </>
  );
}

export function ProductAttributes({
  productId,
  attributes,
  values,
}: {
  productId: string;
  attributes: AttributeDefinition[];
  values: Record<string, unknown>;
}) {
  const action = saveProductAttributesAction.bind(null, productId);
  const [state, formAction, pending] = useActionState<
    AttributeValuesState,
    FormData
  >(action, {});

  // A field is "on" by default if it already holds a value.
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(attributes.map((a) => [a.id, hasValue(values[a.id])]))
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={enabled[attr.id] ?? false}
                onChange={(e) =>
                  setEnabled((p) => ({ ...p, [attr.id]: e.target.checked }))
                }
                className="border-input size-4 rounded"
              />
              {attr.label}
            </label>
            {enabled[attr.id] && (
              <FieldControl attr={attr} value={values[attr.id]} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : "שמירת שדות"}
        </Button>
        {state.ok && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
            <Check className="size-4" />
            נשמר
          </span>
        )}
      </div>
    </form>
  );
}
