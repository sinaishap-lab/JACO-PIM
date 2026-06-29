import { createClient } from "@/lib/supabase/server";
import { getEffectiveCostMap } from "@/lib/services/product-supplier.service";

/**
 * Bill-of-materials service — manages which raw materials a finished product
 * is made of, and provides the data needed to compute its cost.
 */

/** One raw material in a finished product's recipe, with its cost. */
export interface ComponentLine {
  componentId: string;
  sku: string;
  name: string;
  /** Cost per usage unit (package price ÷ content amount). */
  unitCost: number | null;
  usageUnit: string | null;
  quantity: number;
}

/** A raw material option for the component picker. */
export interface RawMaterialOption {
  id: string;
  sku: string;
  name: string;
  unitCost: number | null;
  usageUnit: string | null;
  /** Area pricing (for size-cost calculation). */
  materialForm: "simple" | "sheet" | "roll";
  costPrice: number | null;
  sheetWidthCm: number | null;
  sheetHeightCm: number | null;
  wastePercent: number | null;
}

function num(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(n) ? null : n;
}

/** Per-unit cost = package price ÷ content amount (falls back to the price). */
function unitCostOf(
  costPrice: number | null,
  contentAmount: number | null
): number | null {
  if (costPrice == null) return null;
  if (contentAmount != null && contentAmount > 0) return costPrice / contentAmount;
  return costPrice;
}

type RawProductRow = {
  id: string;
  sku: string;
  name: string;
  cost_price: number | string | null;
  content_amount: number | string | null;
  usage_unit: string | null;
  material_form: "simple" | "sheet" | "roll" | null;
  sheet_width_cm: number | string | null;
  sheet_height_cm: number | string | null;
  waste_percent: number | string | null;
};

const RAW_SELECT =
  "id, sku, name, cost_price, content_amount, usage_unit, material_form, sheet_width_cm, sheet_height_cm, waste_percent";

/** Returns the recipe lines (raw materials + quantities) of a product. */
export async function listComponents(
  productId: string
): Promise<ComponentLine[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("product_components")
    .select("component_id, quantity")
    .eq("product_id", productId);
  if (error) throw new Error(error.message);

  const links = rows as { component_id: string; quantity: number | string }[];
  if (links.length === 0) return [];

  const ids = links.map((r) => r.component_id);
  const { data: prods, error: prodErr } = await supabase
    .from("products")
    .select(RAW_SELECT)
    .in("id", ids);
  if (prodErr) throw new Error(prodErr.message);

  const byId = new Map(
    (prods as RawProductRow[]).map((p) => [p.id, p])
  );

  // Prefer the cheapest supplier price; fall back to the product's own cost.
  const supplierCosts = await getEffectiveCostMap(ids);

  return links.map((r) => {
    const p = byId.get(r.component_id);
    const packageCost = supplierCosts.get(r.component_id) ?? num(p?.cost_price);
    return {
      componentId: r.component_id,
      sku: p?.sku ?? "",
      name: p?.name ?? "(חומר גלם נמחק)",
      unitCost: unitCostOf(packageCost, num(p?.content_amount)),
      usageUnit: p?.usage_unit ?? null,
      quantity: num(r.quantity) ?? 0,
    };
  });
}

/** Lists products that can be used as components (raw materials). */
export async function listRawMaterials(): Promise<RawMaterialOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(RAW_SELECT)
    .eq("type", "raw_material")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return (data as RawProductRow[]).map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    unitCost: unitCostOf(num(p.cost_price), num(p.content_amount)),
    usageUnit: p.usage_unit ?? null,
    materialForm: p.material_form ?? "simple",
    costPrice: num(p.cost_price),
    sheetWidthCm: num(p.sheet_width_cm),
    sheetHeightCm: num(p.sheet_height_cm),
    wastePercent: num(p.waste_percent),
  }));
}

/** Adds (or updates the quantity of) a raw material in a product's recipe. */
export async function addComponent(
  productId: string,
  componentId: string,
  quantity: number
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_components")
    .upsert(
      { product_id: productId, component_id: componentId, quantity },
      { onConflict: "product_id,component_id" }
    );
  if (error) throw new Error(error.message);
}

/** Removes a raw material from a product's recipe. */
export async function removeComponent(
  productId: string,
  componentId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_components")
    .delete()
    .eq("product_id", productId)
    .eq("component_id", componentId);
  if (error) throw new Error(error.message);
}

/** Removes the entire recipe of a product (used before a full re-save). */
export async function clearComponents(productId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_components")
    .delete()
    .eq("product_id", productId);
  if (error) throw new Error(error.message);
}

/** Computed cost of a finished product = Σ(unit cost × quantity). */
export function computeCost(lines: ComponentLine[]): number {
  return lines.reduce(
    (sum, line) => sum + (line.unitCost ?? 0) * line.quantity,
    0
  );
}

/** Recipe (BOM) cost per product id, for list views. Null if no recipe. */
export async function getBomCostMap(
  productIds: string[]
): Promise<Map<string, number | null>> {
  const result = new Map<string, number | null>();
  if (productIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_components")
    .select("product_id, component_id, quantity")
    .in("product_id", productIds);
  if (error) throw new Error(error.message);

  const links =
    (data as { product_id: string; component_id: string; quantity: number | string }[]) ??
    [];
  if (links.length === 0) return result;

  const componentIds = Array.from(new Set(links.map((l) => l.component_id)));
  const { data: prods } = await supabase
    .from("products")
    .select("id, cost_price, content_amount")
    .in("id", componentIds);
  const byId = new Map(
    (prods as { id: string; cost_price: number | string | null; content_amount: number | string | null }[] | null)?.map(
      (p) => [p.id, p]
    ) ?? []
  );
  const supplierCosts = await getEffectiveCostMap(componentIds);

  for (const l of links) {
    const p = byId.get(l.component_id);
    const packageCost = supplierCosts.get(l.component_id) ?? num(p?.cost_price);
    const unit = unitCostOf(packageCost, num(p?.content_amount));
    const add = (unit ?? 0) * (num(l.quantity) ?? 0);
    result.set(l.product_id, (result.get(l.product_id) ?? 0) + add);
  }
  return result;
}
