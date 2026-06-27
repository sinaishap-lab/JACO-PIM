import { createClient } from "@/lib/supabase/server";
import type { AttributeDefinition } from "@/lib/types";
import type { AttributeInput } from "@/lib/schemas/attribute";

/**
 * Attribute-definition service — the only place the app touches the
 * `attribute_definitions` table. Definitions describe the dynamic fields;
 * the values live per-product in `attribute_values`.
 */

interface AttributeRow {
  id: string;
  key: string;
  label: string;
  type: AttributeDefinition["type"];
  group_id: string | null;
  audience: AttributeDefinition["audience"];
  options: string[] | null;
  required: boolean;
}

function toAttribute(row: AttributeRow): AttributeDefinition {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    type: row.type,
    groupId: row.group_id,
    audience: row.audience ?? "supplier",
    options: row.options,
    required: row.required,
  };
}

/** Generates a stable, integration-friendly key for a new attribute. */
function generateKey(): string {
  return `attr_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

export async function listAttributes(): Promise<AttributeDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attribute_definitions")
    .select("*")
    .order("label", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as AttributeRow[]).map(toAttribute);
}

export async function getAttribute(
  id: string
): Promise<AttributeDefinition | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attribute_definitions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toAttribute(data as AttributeRow) : null;
}

export async function createAttribute(
  input: AttributeInput
): Promise<AttributeDefinition> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attribute_definitions")
    .insert({
      key: generateKey(),
      label: input.label,
      type: input.type,
      audience: input.audience,
      options: input.type === "select" ? input.options : null,
      required: input.required,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toAttribute(data as AttributeRow);
}

export async function updateAttribute(
  id: string,
  input: AttributeInput
): Promise<AttributeDefinition> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attribute_definitions")
    .update({
      label: input.label,
      type: input.type,
      audience: input.audience,
      options: input.type === "select" ? input.options : null,
      required: input.required,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toAttribute(data as AttributeRow);
}

export async function deleteAttribute(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("attribute_definitions")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
