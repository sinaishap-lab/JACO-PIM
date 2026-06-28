import "server-only";

import { icountRequest } from "./client";

/**
 * Diagnostic for wiring up the iCount inventory sync. The valid endpoints were
 * discovered to be `inventory/get_items` (list) and `inventory/add_item`
 * (create). `add_item` returns a generic `item_creation_failed`, so we don't
 * yet know the exact field names it expects. This probe:
 *   1. Dumps the field structure of an existing iCount item (from get_items),
 *      which reveals the real field names to mirror in add_item.
 *   2. Tries `add_item` with several field-name variants and reports each.
 */

export interface ProbeLine {
  method: string;
  result: string;
}

async function tryCall(
  method: string,
  body: Record<string, unknown>
): Promise<ProbeLine> {
  try {
    const json = await icountRequest(method, body);
    return { method, result: "✅ הצליח · " + JSON.stringify(json).slice(0, 200) };
  } catch (err) {
    return { method, result: err instanceof Error ? err.message : "שגיאה" };
  }
}

/** Pulls a sample existing item and returns its field names + a sample row. */
async function dumpExistingItemShape(): Promise<ProbeLine[]> {
  try {
    const json = await icountRequest("inventory/get_items");
    const raw = (json.items ?? json.data ?? json.list ?? json) as unknown;
    let first: Record<string, unknown> | undefined;
    if (Array.isArray(raw)) {
      first = raw[0] as Record<string, unknown> | undefined;
    } else if (raw && typeof raw === "object") {
      const vals = Object.values(raw as object);
      first = vals.find((v) => v && typeof v === "object") as
        | Record<string, unknown>
        | undefined;
    }
    if (!first) {
      return [{ method: "get_items", result: "אין פריטים קיימים להצגת מבנה" }];
    }
    const keys = Object.keys(first).join(", ");
    return [
      { method: "שדות פריט קיים", result: keys },
      {
        method: "דוגמה",
        result: JSON.stringify(first).slice(0, 400),
      },
    ];
  } catch (err) {
    return [
      {
        method: "get_items",
        result: err instanceof Error ? err.message : "שגיאה",
      },
    ];
  }
}

/** Field-name variants to try against add_item, to find the accepted shape. */
const ADD_ITEM_VARIANTS: { label: string; body: Record<string, unknown> }[] = [
  {
    label: "add_item {sku,name,unitprice}",
    body: { sku: "PROBE_DEL", name: "בדיקה", unitprice: 1 },
  },
  {
    label: "add_item {sku,item_name,unitprice}",
    body: { sku: "PROBE_DEL", item_name: "בדיקה", unitprice: 1 },
  },
  {
    label: "add_item {sku,description,unitprice}",
    body: { sku: "PROBE_DEL", description: "בדיקה", unitprice: 1 },
  },
  {
    label: "add_item {catalog_number,name,unitprice}",
    body: { catalog_number: "PROBE_DEL", name: "בדיקה", unitprice: 1 },
  },
  {
    label: "add_item {sku,name,unitprice,cost}",
    body: { sku: "PROBE_DEL", name: "בדיקה", unitprice: 1, cost: 0.5 },
  },
];

export async function probeIcountMethods(): Promise<ProbeLine[]> {
  const lines: ProbeLine[] = [];
  lines.push(...(await dumpExistingItemShape()));
  for (const v of ADD_ITEM_VARIANTS) {
    const r = await tryCall("inventory/add_item", v.body);
    lines.push({ method: v.label, result: r.result });
  }
  return lines;
}
