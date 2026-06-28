import { createClient } from "@/lib/supabase/server";

/**
 * Per-variant supplier SKUs — a supplier's own part number for each size × color
 * variant of a product. Keyed by `${size}::${color}` (empty string for an
 * absent axis), matching the variant keys used elsewhere.
 */

export function variantKey(
  size: string | null,
  color: string | null
): string {
  return `${size ?? ""}::${color ?? ""}`;
}

/** Map of supplierId → (variantKey → supplier SKU) for a product. */
export async function listSupplierVariantSkus(
  productId: string
): Promise<Map<string, Map<string, string>>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_variant_skus")
    .select("supplier_id, size_value, color_value, sku")
    .eq("product_id", productId);
  if (error) throw new Error(error.message);

  const result = new Map<string, Map<string, string>>();
  for (const r of (data as {
    supplier_id: string;
    size_value: string;
    color_value: string;
    sku: string;
  }[]) ?? []) {
    const inner = result.get(r.supplier_id) ?? new Map<string, string>();
    inner.set(`${r.size_value}::${r.color_value}`, r.sku);
    result.set(r.supplier_id, inner);
  }
  return result;
}

/** Per-variant SKUs for one (product, supplier): variantKey → SKU. */
export async function listSupplierVariantSkusFor(
  productId: string,
  supplierId: string
): Promise<Map<string, string>> {
  const all = await listSupplierVariantSkus(productId);
  return all.get(supplierId) ?? new Map<string, string>();
}

/**
 * Upserts (or deletes when empty) a set of per-variant SKUs for one supplier.
 * Entries are { size, color, sku } — size/color null for an absent axis.
 */
export async function setSupplierVariantSkus(
  productId: string,
  supplierId: string,
  entries: { size: string | null; color: string | null; sku: string | null }[]
): Promise<void> {
  const supabase = await createClient();

  const toUpsert = entries
    .filter((e) => e.sku && e.sku.trim())
    .map((e) => ({
      product_id: productId,
      supplier_id: supplierId,
      size_value: e.size ?? "",
      color_value: e.color ?? "",
      sku: (e.sku as string).trim(),
    }));
  const toClear = entries.filter((e) => !e.sku || !e.sku.trim());

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("supplier_variant_skus")
      .upsert(toUpsert, {
        onConflict: "product_id,supplier_id,size_value,color_value",
      });
    if (error) throw new Error(error.message);
  }

  for (const e of toClear) {
    const { error } = await supabase
      .from("supplier_variant_skus")
      .delete()
      .eq("product_id", productId)
      .eq("supplier_id", supplierId)
      .eq("size_value", e.size ?? "")
      .eq("color_value", e.color ?? "");
    if (error) throw new Error(error.message);
  }
}
