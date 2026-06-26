import { createClient } from "@/lib/supabase/server";
import { generateBaseSku } from "@/lib/sku";

/**
 * SKU generation — recomputes a product's base SKU from its preferred supplier
 * code, classification codes, and a per-department running number, and stores
 * it. Call after anything that affects those inputs (create/update, supplier
 * changes).
 */

function toNum(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return Infinity;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(n) ? Infinity : n;
}

/** The preferred supplier's code (preferred ⭐, else cheapest with a code). */
async function getPreferredSupplierCode(
  productId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("product_suppliers")
    .select("supplier_id, cost_price, is_preferred")
    .eq("product_id", productId);
  if (!rows || rows.length === 0) return null;

  const { data: sups } = await supabase
    .from("suppliers")
    .select("id, code")
    .in(
      "id",
      rows.map((r) => r.supplier_id)
    );
  const codeById = new Map(
    (sups as { id: string; code: string | null }[] | null)?.map((s) => [
      s.id,
      s.code,
    ]) ?? []
  );

  const candidates = rows.filter((r) => codeById.get(r.supplier_id));
  if (candidates.length === 0) return null;

  const preferred = candidates.find((r) => r.is_preferred);
  const chosen =
    preferred ??
    candidates
      .slice()
      .sort((a, b) => toNum(a.cost_price) - toNum(b.cost_price))[0];
  return codeById.get(chosen.supplier_id) ?? null;
}

async function codeOf(
  table: "departments" | "sub_departments",
  id: string | null
): Promise<string | null> {
  if (!id) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select("code")
    .eq("id", id)
    .maybeSingle();
  return (data as { code: string | null } | null)?.code ?? null;
}

export async function regenerateProductSku(productId: string): Promise<void> {
  const supabase = await createClient();
  const { data: p, error } = await supabase
    .from("products")
    .select("department_id, sub_department_id, product_number")
    .eq("id", productId)
    .single();
  if (error || !p) return;

  const departmentCode = await codeOf("departments", p.department_id);
  const subDepartmentCode = await codeOf("sub_departments", p.sub_department_id);

  // Assign a per-department running number on first use.
  let productNumber: number | null = p.product_number ?? null;
  if (productNumber == null && p.department_id) {
    const { data } = await supabase
      .from("products")
      .select("product_number")
      .eq("department_id", p.department_id)
      .not("product_number", "is", null)
      .order("product_number", { ascending: false })
      .limit(1);
    const max =
      data && data.length ? Number(data[0].product_number) || 0 : 0;
    productNumber = max + 1;
  }

  const supplierCode = await getPreferredSupplierCode(productId);

  const base = generateBaseSku({
    supplierCode,
    departmentCode,
    subDepartmentCode,
    productNumber,
  });

  await supabase
    .from("products")
    .update({ sku: base || null, product_number: productNumber })
    .eq("id", productId);
}
