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
}

export interface OrderProduct {
  productId: string;
  productName: string;
  /** Our internal SKU. */
  ourSku: string | null;
  /** The supplier's own part number for this product. */
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

  const [{ data: products }, { data: sizes }, { data: colors }] =
    await Promise.all([
      supabase.from("products").select("id, name, sku").in("id", productIds),
      supabase
        .from("product_sizes")
        .select("product_id, value")
        .in("product_id", productIds),
      supabase
        .from("product_colors")
        .select("product_id, value")
        .in("product_id", productIds),
    ]);

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

  const rows = (products as { id: string; name: string; sku: string | null }[]) ?? [];

  return rows
    .map((p) => {
      const sizeList: (string | null)[] = sizesByProduct.get(p.id) ?? [null];
      const colorList: (string | null)[] = colorsByProduct.get(p.id) ?? [null];
      const variants: OrderVariant[] = sizeList.flatMap((size) =>
        colorList.map((color) => ({
          key: `${p.id}::${size ?? ""}::${color ?? ""}`,
          size,
          color,
        }))
      );
      return {
        productId: p.id,
        productName: p.name,
        ourSku: p.sku,
        supplierSku: supplierSkuByProduct.get(p.id) ?? null,
        variants,
      };
    })
    .sort((a, b) => a.productName.localeCompare(b.productName, "he"));
}
