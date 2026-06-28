import "server-only";

import { icountRequest } from "./client";
import { listProducts } from "@/lib/services/product.service";
import { getSizesMap, getColorsMap } from "@/lib/services/variant.service";
import { generateVariantSku } from "@/lib/sku";

/**
 * One catalog line to push to iCount. We sync finished products; a product with
 * size/color variants becomes one item per variant (using its variant SKU),
 * otherwise a single item for the product.
 */
interface CatalogItem {
  sku: string;
  name: string;
  price: number | null;
  cost: number | null;
}

export interface IcountSyncResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/** Builds the flat list of catalog items (product/variant) to sync. */
async function buildCatalogItems(): Promise<CatalogItem[]> {
  const products = await listProducts("finished");
  const ids = products.map((p) => p.id);
  const [sizesMap, colorsMap] = await Promise.all([
    getSizesMap(ids),
    getColorsMap(ids),
  ]);

  const items: CatalogItem[] = [];
  for (const p of products) {
    const sizes = sizesMap.get(p.id) ?? [];
    const colors = colorsMap.get(p.id) ?? [];

    if (sizes.length === 0 && colors.length === 0) {
      items.push({
        sku: p.sku ?? "",
        name: p.name,
        price: p.salePrice,
        cost: p.costPrice,
      });
      continue;
    }

    const sizeList = sizes.length ? sizes : [null];
    const colorList = colors.length ? colors : [null];
    for (const s of sizeList) {
      for (const c of colorList) {
        const sku = p.sku
          ? generateVariantSku(p.sku, s?.value, c?.letter)
          : "";
        const parts = [p.name, s?.value, c?.value].filter(Boolean);
        items.push({
          sku,
          name: parts.join(" "),
          price: s?.price ?? p.salePrice,
          cost: p.costPrice,
        });
      }
    }
  }
  return items;
}

/** Existing iCount items as a map: sku → item_id. */
async function fetchExistingItems(): Promise<Map<string, string | number>> {
  const json = await icountRequest("inventory/get_items");
  const raw = (json.items ?? json.data ?? json.list ?? []) as unknown;
  const arr: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : (Object.values(raw as object) as Record<string, unknown>[]);

  const map = new Map<string, string | number>();
  for (const it of arr) {
    const sku = (it.sku ?? it.catalog_number) as string | undefined;
    const id = (it.inventory_item_id ?? it.item_id ?? it.id) as
      | string
      | number
      | undefined;
    if (sku && id != null) map.set(String(sku), id);
  }
  return map;
}

/** Maps our catalog line to iCount item fields. Adjust here if field names differ. */
function toIcountFields(item: CatalogItem): Record<string, unknown> {
  return {
    sku: item.sku,
    description: item.name, // iCount's item-name field is "description"
    unitprice: item.price ?? 0,
    cost_amount: item.cost ?? 0,
  };
}

/**
 * Pushes the product catalog to iCount: creates new items and updates existing
 * ones (matched by SKU). Returns a summary.
 */
export async function syncProductsToIcount(): Promise<IcountSyncResult> {
  const items = await buildCatalogItems();
  // Listing existing items is optional — if iCount doesn't expose it, we still
  // create. (Without it, re-syncing may create duplicates by SKU.)
  let existing = new Map<string, string | number>();
  try {
    existing = await fetchExistingItems();
  } catch {
    existing = new Map();
  }

  const result: IcountSyncResult = {
    total: items.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of items) {
    const existingId = existing.get(item.sku);
    if (existingId != null) {
      // Item already in iCount (matched by SKU). Try to update it; if iCount's
      // update endpoint isn't available, leave the existing item untouched
      // rather than failing the whole sync.
      try {
        await icountRequest("inventory/update_item", {
          inventory_item_id: existingId,
          ...toIcountFields(item),
        });
        result.updated++;
      } catch {
        result.skipped++;
      }
      continue;
    }
    try {
      await icountRequest("inventory/add_item", toIcountFields(item));
      result.created++;
    } catch (err) {
      result.errors.push(
        `${item.sku}: ${err instanceof Error ? err.message : "שגיאה"}`
      );
    }
  }
  return result;
}
