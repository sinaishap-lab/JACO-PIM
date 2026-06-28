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
      if (p.sku) {
        items.push({ sku: p.sku, name: p.name, price: p.salePrice });
      }
      continue;
    }

    const sizeList = sizes.length ? sizes : [null];
    const colorList = colors.length ? colors : [null];
    for (const s of sizeList) {
      for (const c of colorList) {
        if (!p.sku) continue;
        const sku = generateVariantSku(p.sku, s?.value, c?.letter);
        const parts = [p.name, s?.value, c?.value].filter(Boolean);
        items.push({
          sku,
          name: parts.join(" "),
          price: s?.price ?? p.salePrice,
        });
      }
    }
  }
  return items;
}

/** Existing iCount items as a map: sku → item_id. */
async function fetchExistingItems(): Promise<Map<string, string | number>> {
  const json = await icountRequest("inventory/get_list");
  const raw = (json.items ?? json.data ?? json.list ?? []) as unknown;
  const arr: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : (Object.values(raw as object) as Record<string, unknown>[]);

  const map = new Map<string, string | number>();
  for (const it of arr) {
    const sku = (it.sku ?? it.catalog_number) as string | undefined;
    const id = (it.item_id ?? it.id) as string | number | undefined;
    if (sku && id != null) map.set(String(sku), id);
  }
  return map;
}

/** Maps our catalog line to iCount item fields. Adjust here if field names differ. */
function toIcountFields(item: CatalogItem): Record<string, unknown> {
  return {
    sku: item.sku,
    description: item.name,
    unitprice: item.price ?? 0,
  };
}

/**
 * Pushes the product catalog to iCount: creates new items and updates existing
 * ones (matched by SKU). Returns a summary.
 */
export async function syncProductsToIcount(): Promise<IcountSyncResult> {
  const items = await buildCatalogItems();
  const existing = await fetchExistingItems();

  const result: IcountSyncResult = {
    total: items.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of items) {
    try {
      const existingId = existing.get(item.sku);
      if (existingId != null) {
        await icountRequest("inventory/update", {
          item_id: existingId,
          ...toIcountFields(item),
        });
        result.updated++;
      } else {
        await icountRequest("inventory/create", toIcountFields(item));
        result.created++;
      }
    } catch (err) {
      result.errors.push(
        `${item.sku}: ${err instanceof Error ? err.message : "שגיאה"}`
      );
    }
  }
  return result;
}
