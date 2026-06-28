import { createClient } from "@/lib/supabase/server";

/**
 * Product↔supplier service — which suppliers provide a product, each with
 * their own price, part number, and product name. The product's effective
 * cost is the preferred supplier's price, or the cheapest if none is preferred.
 */

export interface ProductSupplierLine {
  id: string;
  supplierId: string;
  supplierLabel: string;
  supplierSku: string | null;
  supplierProductName: string | null;
  costPrice: number | null;
  isPreferred: boolean;
}

function num(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(n) ? null : n;
}

/** Effective cost from a set of supplier lines: preferred, else cheapest. */
export function effectiveCost(lines: ProductSupplierLine[]): number | null {
  const preferred = lines.find((l) => l.isPreferred && l.costPrice != null);
  if (preferred) return preferred.costPrice;
  const costs = lines
    .map((l) => l.costPrice)
    .filter((c): c is number => c != null);
  return costs.length ? Math.min(...costs) : null;
}

export async function listProductSuppliers(
  productId: string
): Promise<ProductSupplierLine[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("product_suppliers")
    .select("id, supplier_id, supplier_sku, supplier_name, cost_price, is_preferred")
    .eq("product_id", productId);
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    supplier_id: string;
    supplier_sku: string | null;
    supplier_name: string | null;
    cost_price: number | string | null;
    is_preferred: boolean;
  };
  const links = rows as Row[];
  if (links.length === 0) return [];

  const { data: sups, error: supErr } = await supabase
    .from("suppliers")
    .select("id, name")
    .in(
      "id",
      links.map((r) => r.supplier_id)
    );
  if (supErr) throw new Error(supErr.message);

  const nameById = new Map(
    (sups as { id: string; name: string }[]).map((s) => [s.id, s.name])
  );

  return links.map((r) => ({
    id: r.id,
    supplierId: r.supplier_id,
    supplierLabel: nameById.get(r.supplier_id) ?? "(ספק נמחק)",
    supplierSku: r.supplier_sku,
    supplierProductName: r.supplier_name,
    costPrice: num(r.cost_price),
    isPreferred: r.is_preferred,
  }));
}

/** Cheapest supplier cost per product id (for cost roll-ups like BOM). */
export async function getEffectiveCostMap(
  productIds: string[]
): Promise<Map<string, number | null>> {
  const result = new Map<string, number | null>();
  if (productIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_suppliers")
    .select("product_id, cost_price, is_preferred")
    .in("product_id", productIds);
  if (error) throw new Error(error.message);

  const grouped = new Map<string, ProductSupplierLine[]>();
  for (const r of data as {
    product_id: string;
    cost_price: number | string | null;
    is_preferred: boolean;
  }[]) {
    const line = {
      id: "",
      supplierId: "",
      supplierLabel: "",
      supplierSku: null,
      supplierProductName: null,
      costPrice: num(r.cost_price),
      isPreferred: r.is_preferred,
    };
    const arr = grouped.get(r.product_id) ?? [];
    arr.push(line);
    grouped.set(r.product_id, arr);
  }

  for (const [productId, lines] of grouped) {
    result.set(productId, effectiveCost(lines));
  }
  return result;
}

export async function addProductSupplier(
  productId: string,
  input: {
    supplierId: string;
    supplierSku: string | null;
    supplierName: string | null;
    costPrice: number | null;
    isPreferred: boolean;
  }
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_suppliers").upsert(
    {
      product_id: productId,
      supplier_id: input.supplierId,
      supplier_sku: input.supplierSku,
      supplier_name: input.supplierName,
      cost_price: input.costPrice,
      is_preferred: input.isPreferred,
    },
    { onConflict: "product_id,supplier_id" }
  );
  if (error) throw new Error(error.message);
}

/**
 * Sets a product's primary (preferred) supplier from the product form, together
 * with the supplier's own SKU for this product. Links the supplier if not yet
 * linked, marks it preferred, sets the supplier SKU, and clears the preferred
 * flag on the product's other suppliers. Passing a null supplierId clears the
 * preferred flag entirely.
 */
export async function setPreferredSupplier(
  productId: string,
  supplierId: string | null,
  supplierSku: string | null = null
): Promise<void> {
  const supabase = await createClient();

  // Clear the preferred flag on all current links for this product.
  const { error: clearErr } = await supabase
    .from("product_suppliers")
    .update({ is_preferred: false })
    .eq("product_id", productId);
  if (clearErr) throw new Error(clearErr.message);

  if (!supplierId) return;

  // Does a link already exist? Keep its cost details; mark preferred + SKU.
  const { data: existing, error: findErr } = await supabase
    .from("product_suppliers")
    .select("id")
    .eq("product_id", productId)
    .eq("supplier_id", supplierId)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);

  if (existing) {
    const { error } = await supabase
      .from("product_suppliers")
      .update({ is_preferred: true, supplier_sku: supplierSku })
      .eq("id", (existing as { id: string }).id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("product_suppliers").insert({
      product_id: productId,
      supplier_id: supplierId,
      supplier_sku: supplierSku,
      is_preferred: true,
    });
    if (error) throw new Error(error.message);
  }
}

export async function removeProductSupplier(rowId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_suppliers")
    .delete()
    .eq("id", rowId);
  if (error) throw new Error(error.message);
}
