import { createClient } from "@/lib/supabase/server";

/**
 * Order service — assembles the list of products a supplier provides, expanded
 * into size × color variants, for building a printable purchase order.
 */

export interface OrderVariant {
  /** Stable key for the row (product id + size + color). */
  key: string;
  size: string | null;
  color: string | null;
  /** The supplier's SKU for this specific variant (falls back to product). */
  supplierSku: string | null;
}

export interface OrderProduct {
  productId: string;
  productName: string;
  /** Department name, for grouping (null if unclassified). */
  department: string | null;
  /** Our internal SKU. */
  ourSku: string | null;
  /** The supplier's product-level part number (fallback). */
  supplierSku: string | null;
  variants: OrderVariant[];
}

/** Products supplied by a given supplier, each expanded into its variants. */
export async function listSupplierOrderProducts(
  supplierId: string
): Promise<OrderProduct[]> {
  const supabase = await createClient();

  const { data: links, error } = await supabase
    .from("product_suppliers")
    .select("product_id, supplier_sku")
    .eq("supplier_id", supplierId);
  if (error) throw new Error(error.message);
  if (!links || links.length === 0) return [];

  const productIds = (links as { product_id: string }[]).map(
    (l) => l.product_id
  );
  const supplierSkuByProduct = new Map(
    (links as { product_id: string; supplier_sku: string | null }[]).map((l) => [
      l.product_id,
      l.supplier_sku,
    ])
  );

  const [{ data: products }, { data: sizes }, { data: colors }, { data: vSkus }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, department_id")
        .in("id", productIds),
      supabase
        .from("product_sizes")
        .select("product_id, value")
        .in("product_id", productIds),
      supabase
        .from("product_colors")
        .select("product_id, value")
        .in("product_id", productIds),
      supabase
        .from("supplier_variant_skus")
        .select("product_id, size_value, color_value, sku")
        .eq("supplier_id", supplierId)
        .in("product_id", productIds),
    ]);

  // product_id → (`${size}::${color}` → supplier SKU for that variant)
  const variantSkuByProduct = new Map<string, Map<string, string>>();
  for (const v of (vSkus as {
    product_id: string;
    size_value: string;
    color_value: string;
    sku: string;
  }[]) ?? []) {
    if (!v.sku) continue;
    const inner =
      variantSkuByProduct.get(v.product_id) ?? new Map<string, string>();
    inner.set(`${v.size_value}::${v.color_value}`, v.sku);
    variantSkuByProduct.set(v.product_id, inner);
  }

  const sizesByProduct = new Map<string, string[]>();
  for (const s of (sizes as { product_id: string; value: string }[]) ?? []) {
    const arr = sizesByProduct.get(s.product_id) ?? [];
    arr.push(s.value);
    sizesByProduct.set(s.product_id, arr);
  }
  const colorsByProduct = new Map<string, string[]>();
  for (const c of (colors as { product_id: string; value: string }[]) ?? []) {
    const arr = colorsByProduct.get(c.product_id) ?? [];
    arr.push(c.value);
    colorsByProduct.set(c.product_id, arr);
  }

  const rows =
    (products as {
      id: string;
      name: string;
      sku: string | null;
      department_id: string | null;
    }[]) ?? [];

  // Department names for grouping.
  const deptIds = Array.from(
    new Set(rows.map((r) => r.department_id).filter((d): d is string => !!d))
  );
  const deptById = new Map<string, string>();
  if (deptIds.length) {
    const { data: deps } = await supabase
      .from("departments")
      .select("id, name")
      .in("id", deptIds);
    for (const d of (deps as { id: string; name: string }[]) ?? []) {
      deptById.set(d.id, d.name);
    }
  }

  return rows
    .map((p) => {
      const sizeList: (string | null)[] = sizesByProduct.get(p.id) ?? [null];
      const colorList: (string | null)[] = colorsByProduct.get(p.id) ?? [null];
      const productSku = supplierSkuByProduct.get(p.id) ?? null;
      const perVariant = variantSkuByProduct.get(p.id);
      const variants: OrderVariant[] = sizeList.flatMap((size) =>
        colorList.map((color) => {
          const vKey = `${size ?? ""}::${color ?? ""}`;
          return {
            key: `${p.id}::${vKey}`,
            size,
            color,
            supplierSku: perVariant?.get(vKey) ?? productSku,
          };
        })
      );
      return {
        productId: p.id,
        productName: p.name,
        department: p.department_id ? deptById.get(p.department_id) ?? null : null,
        ourSku: p.sku,
        supplierSku: productSku,
        variants,
      };
    })
    .sort((a, b) => a.productName.localeCompare(b.productName, "he"));
}
