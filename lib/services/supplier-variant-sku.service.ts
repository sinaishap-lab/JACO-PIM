import { createClient } from "@/lib/supabase/server";

/**
 * Per-variant supplier data — a supplier's own SKU and cost price for each
 * size × color variant of a product. Keyed by `${size}::${color}` (empty string
 * for an absent axis), matching the variant keys used elsewhere.
 */

export interface SupplierVariant {
  sku: string | null;
  cost: number | null;
}

export function variantKey(
  size: string | null,
  color: string | null
): string {
  return `${size ?? ""}::${color ?? ""}`;
}

function num(value: number | string | null): number | null {
  if (value === null) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(n) ? null : n;
}

/** Map of supplierId → (variantKey → { sku, cost }) for a product. */
export async function listSupplierVariantSkus(
  productId: string
): Promise<Map<string, Map<string, SupplierVariant>>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_variant_skus")
    .select("supplier_id, size_value, color_value, sku, cost_price")
    .eq("product_id", productId);
  if (error) throw new Error(error.message);

  const result = new Map<string, Map<string, SupplierVariant>>();
  for (const r of (data as {
    supplier_id: string;
    size_value: string;
    color_value: string;
    sku: string | null;
    cost_price: number | string | null;
  }[]) ?? []) {
    const inner = result.get(r.supplier_id) ?? new Map<string, SupplierVariant>();
    inner.set(`${r.size_value}::${r.color_value}`, {
      sku: r.sku || null,
      cost: num(r.cost_price),
    });
    result.set(r.supplier_id, inner);
  }
  return result;
}

/**
 * Upserts (or deletes when empty) a set of per-variant rows for one supplier.
 * Each entry is { size, color, sku, cost } — size/color null for an absent axis.
 */
export async function setSupplierVariantSkus(
  productId: string,
  supplierId: string,
  entries: {
    size: string | null;
    color: string | null;
    sku: string | null;
    cost: number | null;
  }[]
): Promise<void> {
  const supabase = await createClient();

  const hasData = (e: (typeof entries)[number]) =>
    (e.sku && e.sku.trim()) || e.cost != null;

  const toUpsert = entries.filter(hasData).map((e) => ({
    product_id: productId,
    supplier_id: supplierId,
    size_value: e.size ?? "",
    color_value: e.color ?? "",
    sku: e.sku ? e.sku.trim() : "",
    cost_price: e.cost,
  }));
  const toClear = entries.filter((e) => !hasData(e));

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
