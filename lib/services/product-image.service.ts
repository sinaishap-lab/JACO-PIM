import { createClient } from "@/lib/supabase/server";

/**
 * Product image gallery — multiple images per product, one marked primary.
 * The files live in the `product-images` Storage bucket; this table holds the
 * public URLs and which one is the primary image.
 */

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Row {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export async function listProductImages(
  productId: string
): Promise<ProductImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, is_primary, sort_order")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data as Row[]).map((r) => ({
    id: r.id,
    url: r.url,
    isPrimary: r.is_primary,
  }));
}

/** Primary image URL for many products at once (for list/label views). */
export async function getPrimaryImageMap(
  productIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (productIds.length === 0) return map;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, url, is_primary, sort_order")
    .in("product_id", productIds)
    .order("is_primary", { ascending: false })
    .order("sort_order");
  if (error) throw new Error(error.message);
  for (const r of (data as (Row & { product_id: string })[]) ?? []) {
    // First row per product wins (primary sorts first).
    if (!map.has(r.product_id)) map.set(r.product_id, r.url);
  }
  return map;
}

/** Replaces a product's images with the given set (used on save). */
export async function setProductImages(
  productId: string,
  images: { url: string; isPrimary: boolean }[]
): Promise<void> {
  const supabase = await createClient();
  const { error: delErr } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (delErr) throw new Error(delErr.message);

  if (images.length === 0) return;
  // Ensure exactly one primary (default to the first image).
  const hasPrimary = images.some((i) => i.isPrimary);
  const rows = images.map((img, i) => ({
    product_id: productId,
    url: img.url,
    is_primary: hasPrimary ? img.isPrimary : i === 0,
    sort_order: i,
  }));
  const { error } = await supabase.from("product_images").insert(rows);
  if (error) throw new Error(error.message);
}
