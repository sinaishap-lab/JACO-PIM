import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import type { ProductInput } from "@/lib/schemas/product";

/**
 * Product service — the only place the app talks to the `products` table.
 * UI and Server Actions call these functions; they never touch Supabase
 * directly. This keeps business logic in one place and makes the data layer
 * swappable.
 *
 * Expected table (created via a Supabase migration, see supabase/README.md):
 *   products(id uuid pk, sku text unique, name text, description text,
 *            status text, created_at timestamptz, updated_at timestamptz)
 */

/** Shape of a row as stored in Postgres (snake_case). */
interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  status: Product["status"];
  type: Product["type"];
  cost_price: number | string | null;
  sale_price: number | string | null;
  pack_unit: string | null;
  content_amount: number | string | null;
  usage_unit: string | null;
  department_id: string | null;
  sub_department_id: string | null;
  model_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Postgres numeric columns arrive as strings — normalize to number | null. */
function toNumber(value: number | string | null): number | null {
  if (value === null) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(n) ? null : n;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    status: row.status,
    type: row.type,
    costPrice: toNumber(row.cost_price),
    salePrice: toNumber(row.sale_price),
    packUnit: row.pack_unit,
    contentAmount: toNumber(row.content_amount),
    usageUnit: row.usage_unit,
    departmentId: row.department_id,
    subDepartmentId: row.sub_department_id,
    modelId: row.model_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProducts(
  type?: Product["type"]
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toProduct(data as ProductRow) : null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description || null,
      status: input.status,
      type: input.type,
      cost_price: input.costPrice,
      sale_price: input.salePrice,
      pack_unit: input.packUnit,
      content_amount: input.contentAmount,
      usage_unit: input.usageUnit,
      department_id: input.departmentId,
      sub_department_id: input.subDepartmentId,
      model_id: input.modelId,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description || null,
      status: input.status,
      type: input.type,
      cost_price: input.costPrice,
      sale_price: input.salePrice,
      pack_unit: input.packUnit,
      content_amount: input.contentAmount,
      usage_unit: input.usageUnit,
      department_id: input.departmentId,
      sub_department_id: input.subDepartmentId,
      model_id: input.modelId,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
