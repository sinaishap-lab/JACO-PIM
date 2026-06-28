import "server-only";

import { icountRequest } from "./client";

/**
 * Diagnostic: `add_item` returns `item_creation_failed`, yet a previously
 * "failed" SKU later reported `duplicate_sku` — suggesting the item IS created
 * despite the error. This dumps the FULL add_item response and then checks
 * get_items to confirm whether the item actually landed in iCount.
 */

export interface ProbeLine {
  method: string;
  result: string;
}

const TEST_SKU = "PROBE_X1";

export async function probeIcountMethods(): Promise<ProbeLine[]> {
  const lines: ProbeLine[] = [];

  // 1. Full raw response of an add_item call (catch HTTP-level throw too).
  try {
    const json = await icountRequest("inventory/add_item", {
      sku: TEST_SKU,
      description: "PROBE — מחק",
      unitprice: 50,
    });
    lines.push({
      method: "add_item תשובה מלאה",
      result: JSON.stringify(json),
    });
  } catch (err) {
    lines.push({
      method: "add_item נזרקה שגיאה",
      result: err instanceof Error ? err.message : "שגיאה",
    });
  }

  // 2. Does the SKU now exist in iCount despite the error above?
  try {
    const json = await icountRequest("inventory/get_items");
    const raw = (json.items ?? json.data ?? json.list ?? json) as unknown;
    const arr: Record<string, unknown>[] = Array.isArray(raw)
      ? (raw as Record<string, unknown>[])
      : (Object.values(raw as object).filter(
          (v) => v && typeof v === "object"
        ) as Record<string, unknown>[]);
    const found = arr.find((it) => String(it.sku ?? "") === TEST_SKU);
    lines.push({
      method: `נמצא ${TEST_SKU} ב-iCount?`,
      result: found
        ? "✅ כן — הפריט נוצר! " + JSON.stringify(found).slice(0, 200)
        : `לא נמצא (מתוך ${arr.length} פריטים)`,
    });
  } catch (err) {
    lines.push({
      method: "get_items נכשל",
      result: err instanceof Error ? err.message : "שגיאה",
    });
  }

  return lines;
}
