import "server-only";

import { icountRequest } from "./client";

/**
 * Diagnostic: we don't know the exact iCount inventory method name (create/list
 * have all returned `bad_method`). This probes a list of candidate endpoints
 * with a tiny test payload and reports the result of each, so we can identify
 * the real method name from the one that does NOT return `bad_method`.
 *
 * A `bad_method` reply means the endpoint doesn't exist. Anything else (success,
 * or a field-level error like "missing description") means the method IS valid
 * — that's the one we want.
 */

const CREATE_CANDIDATES = [
  "inventory/create",
  "inventory/add",
  "inventory/add_item",
  "inventory/create_item",
  "inventory/new",
  "inventory/save",
  "inventory/insert",
  "inventory/store",
  "inventory/item",
  "inventory/set",
];

const LIST_CANDIDATES = [
  "inventory/list",
  "inventory/get_list",
  "inventory/items",
  "inventory/get_items",
  "inventory/get",
  "inventory/all",
  "inventory/search",
  "inventory/index",
];

/** A harmless test item used only to probe which create endpoint exists. */
const TEST_ITEM = {
  sku: "PROBE_DEL",
  description: "בדיקת חיבור — אפשר למחוק",
  unitprice: 1,
};

export interface ProbeLine {
  method: string;
  result: string;
}

async function probeOne(
  method: string,
  body: Record<string, unknown>
): Promise<ProbeLine> {
  try {
    await icountRequest(method, body);
    return { method, result: "✅ הצליח" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "שגיאה";
    return { method, result: msg };
  }
}

export async function probeIcountMethods(): Promise<ProbeLine[]> {
  const lines: ProbeLine[] = [];
  // Read-only list probes first (no side effects).
  for (const m of LIST_CANDIDATES) {
    lines.push(await probeOne(m, {}));
  }
  // Create probes (may create a "PROBE_DEL" item if a method works).
  for (const m of CREATE_CANDIDATES) {
    lines.push(await probeOne(m, TEST_ITEM));
  }
  return lines;
}
