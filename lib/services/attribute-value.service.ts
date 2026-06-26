import { createClient } from "@/lib/supabase/server";

/**
 * Attribute-value service — reads/writes the actual values of dynamic
 * attributes for a given product (`attribute_values` table). Keyed by
 * attribute definition id.
 */

/** Returns a map of attributeId → stored value for a product. */
export async function getProductAttributeValues(
  productId: string
): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attribute_values")
    .select("attribute_id, value")
    .eq("product_id", productId);

  if (error) throw new Error(error.message);

  const map: Record<string, unknown> = {};
  for (const row of data as { attribute_id: string; value: unknown }[]) {
    map[row.attribute_id] = row.value;
  }
  return map;
}

/**
 * Upserts the provided attribute values for a product. A `null` value removes
 * the stored value for that attribute.
 */
export async function setProductAttributeValues(
  productId: string,
  values: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  const toUpsert: {
    product_id: string;
    attribute_id: string;
    value: unknown;
  }[] = [];
  const toDelete: string[] = [];

  for (const [attributeId, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === "") {
      toDelete.push(attributeId);
    } else {
      toUpsert.push({ product_id: productId, attribute_id: attributeId, value });
    }
  }

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("attribute_values")
      .upsert(toUpsert, { onConflict: "product_id,attribute_id" });
    if (error) throw new Error(error.message);
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("attribute_values")
      .delete()
      .eq("product_id", productId)
      .in("attribute_id", toDelete);
    if (error) throw new Error(error.message);
  }
}
