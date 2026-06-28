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
 * Effective cost range per product across its variants, for list views. For
 * each variant the effective cost is the preferred supplier's cost (if set),
 * else the cheapest supplier's cost; the range spans the min/max of those.
 */
export async function getSizedCostRangeMap(
  productIds: string[]
): Promise<Map<string, { min: number; max: number }>> {
  const result = new Map<string, { min: number; max: number }>();
  if (productIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_variant_skus")
    .select("product_id, supplier_id, size_value, color_value, cost_price")
    .in("product_id", productIds);
  if (error) throw new Error(error.message);

  const rows = (
    (data as {
      product_id: string;
      supplier_id: string;
      size_value: string;
      color_value: string;
      cost_price: number | string | null;
    }[]) ?? []
  ).filter((r) => num(r.cost_price) != null);
  if (rows.length === 0) return result;

  const { data: ps } = await supabase
    .from("product_suppliers")
    .select("product_id, supplier_id, is_preferred")
    .in("product_id", productIds);
  const preferredByProduct = new Map<string, string>();
  for (const p of (ps as {
    product_id: string;
    supplier_id: string;
    is_preferred: boolean;
  }[]) ?? []) {
    if (p.is_preferred) preferredByProduct.set(p.product_id, p.supplier_id);
  }

  // product_id → variantKey → [{ supplierId, cost }]
  const byProduct = new Map<
    string,
    Map<string, { supplierId: string; cost: number }[]>
  >();
  for (const r of rows) {
    const cost = num(r.cost_price);
    if (cost == null) continue;
    const vk = `${r.size_value}::${r.color_value}`;
    const variants = byProduct.get(r.product_id) ?? new Map();
    const arr = variants.get(vk) ?? [];
    arr.push({ supplierId: r.supplier_id, cost });
    variants.set(vk, arr);
    byProduct.set(r.product_id, variants);
  }

  for (const [productId, variants] of byProduct) {
    const preferred = preferredByProduct.get(productId);
    const effective: number[] = [];
    for (const [, list] of variants) {
      const pref = preferred
        ? list.find((v) => v.supplierId === preferred)
        : undefined;
      effective.push(pref ? pref.cost : Math.min(...list.map((v) => v.cost)));
    }
    if (effective.length) {
      result.set(productId, {
        min: Math.min(...effective),
        max: Math.max(...effective),
      });
    }
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
