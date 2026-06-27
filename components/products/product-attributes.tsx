"use client";

import { useActionState } from "react";
import { Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  saveProductAttributesAction,
  type AttributeValuesState,
} from "@/app/(dashboard)/products/actions";
import type { AttributeAudience, AttributeDefinition } from "@/lib/types";

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

/** True for http(s) links, so we can render them as a clickable link. */
function isUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function AttributeField({
  attr,
  value,
}: {
  attr: AttributeDefinition;
  value: unknown;
}) {
  const field = `attr_${attr.id}`;
  const str = value == null ? "" : String(value);

  if (attr.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name={field}
          defaultChecked={value === true}
          className="border-input size-4 rounded"
        />
        {attr.label}
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field}>
        {attr.label}
        {attr.required && " *"}
      </Label>
      {attr.type === "select" ? (
        <select
          id={field}
          name={field}
          defaultValue={str}
          className={selectClass}
        >
          <option value="">— ללא —</option>
          {(attr.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
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
          dir={attr.type === "text" && isUrl(str) ? "ltr" : undefined}
        />
      )}
      {attr.type === "text" && isUrl(str) && (
        <a
          href={str.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <ExternalLink className="size-3" />
          פתח קישור
        </a>
      )}
    </div>
  );
}

export function ProductAttributes({
  productId,
  audience,
  attributes,
  values,
}: {
  productId: string;
  audience: AttributeAudience;
  attributes: AttributeDefinition[];
  values: Record<string, unknown>;
}) {
  const action = saveProductAttributesAction.bind(null, productId, audience);
  const [state, formAction, pending] = useActionState<
    AttributeValuesState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {attributes.map((attr) => (
          <AttributeField key={attr.id} attr={attr} value={values[attr.id]} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : "שמירת מאפיינים"}
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
