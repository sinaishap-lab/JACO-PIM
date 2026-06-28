import { createClient } from "@/lib/supabase/server";

/**
 * Variant service — size options (each with a price) and color options (each
 * with an English letter) for a finished product. The sellable variants are
 * the size × color combinations.
 */

export interface SizeOption {
  id: string;
  value: string;
  /** Sell price for this size. */
  price: number | null;
  /** Buy/cost price for this size. */
  costPrice: number | null;
}
export interface ColorOption {
  id: string;
  value: string;
  letter: string | null;
}

function num(value: number | string | null): number | null {
  if (value === null) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(n) ? null : n;
}

export async function listSizes(productId: string): Promise<SizeOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_sizes")
    .select("id, value, price, cost_price")
    .eq("product_id", productId)
    .order("value");
  if (error) throw new Error(error.message);
  return (
    data as {
      id: string;
      value: string;
      price: number | string | null;
      cost_price: number | string | null;
    }[]
  ).map((r) => ({
    id: r.id,
    value: r.value,
    price: num(r.price),
    costPrice: num(r.cost_price),
  }));
}

export async function listColors(productId: string): Promise<ColorOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_colors")
    .select("id, value, letter")
    .eq("product_id", productId)
    .order("value");
  if (error) throw new Error(error.message);
  return data as ColorOption[];
}

export async function addSize(
  productId: string,
  value: string,
  price: number | null,
  costPrice: number | null = null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_sizes")
    .upsert(
      { product_id: productId, value, price, cost_price: costPrice },
      { onConflict: "product_id,value" }
    );
  if (error) throw new Error(error.message);
}

export async function removeSize(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_sizes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addColor(
  productId: string,
  value: string,
  letter: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_colors")
    .upsert(
      { product_id: productId, value, letter },
      { onConflict: "product_id,value" }
    );
  if (error) throw new Error(error.message);
}

export async function removeColor(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("product_colors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Removes all sizes & colors of a product (used before a full re-save). */
export async function clearVariants(productId: string): Promise<void> {
  const supabase = await createClient();
  const { error: se } = await supabase
    .from("product_sizes")
    .delete()
    .eq("product_id", productId);
  if (se) throw new Error(se.message);
  const { error: ce } = await supabase
    .from("product_colors")
    .delete()
    .eq("product_id", productId);
  if (ce) throw new Error(ce.message);
}
