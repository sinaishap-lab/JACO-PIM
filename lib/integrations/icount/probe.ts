import "server-only";

import { icountRequest } from "./client";

/**
 * Focused diagnostic: `inventory/add_item` started returning
 * `item_creation_failed` after we added barcode + VAT-inclusive price fields.
 * This adds those fields one at a time (each with a UNIQUE sku so a previous
 * success doesn't mask the next with `duplicate_sku`) to pinpoint the culprit.
 *
 * Whichever line is the FIRST to fail identifies the offending field. Created
 * test items are named "PROBE — מחק" so they're easy to delete in iCount.
 */

export interface ProbeLine {
  method: string;
  result: string;
}

const VARIANTS: { label: string; body: Record<string, unknown> }[] = [
  {
    label: "1. בסיס {sku,description,unitprice}",
    body: { sku: "PROBE_A", description: "PROBE — מחק", unitprice: 50 },
  },
  {
    label: "2. + unitprice_incvat",
    body: { sku: "PROBE_B", description: "PROBE — מחק", unitprice_incvat: 50 },
  },
  {
    label: "3. + unitprice_incvat_entered",
    body: {
      sku: "PROBE_C",
      description: "PROBE — מחק",
      unitprice_incvat: 50,
      unitprice_incvat_entered: 1,
    },
  },
  {
    label: "4. + cost_amount",
    body: {
      sku: "PROBE_D",
      description: "PROBE — מחק",
      unitprice_incvat: 50,
      cost_amount: 7,
    },
  },
  {
    label: "5. + barcode (פשוט)",
    body: {
      sku: "PROBE_E",
      barcode: "PROBE_E",
      description: "PROBE — מחק",
      unitprice_incvat: 50,
    },
  },
  {
    label: "6. מק\"ט עם מקף+נקודה {sku:PROBE-9.9}",
    body: { sku: "PROBE-9.9", description: "PROBE — מחק", unitprice_incvat: 50 },
  },
  {
    label: "7. ברקוד עם מקף+נקודה {barcode:PROBE-9.9}",
    body: {
      sku: "PROBE_G",
      barcode: "PROBE-9.9",
      description: "PROBE — מחק",
      unitprice_incvat: 50,
    },
  },
  {
    label: "8. הכל יחד (כמו בסנכרון האמיתי)",
    body: {
      sku: "PROBE-1.1",
      barcode: "PROBE-1.1",
      description: "PROBE — מחק",
      unitprice_incvat: 50,
      unitprice_incvat_entered: 1,
      cost_amount: 7,
    },
  },
];

export async function probeIcountMethods(): Promise<ProbeLine[]> {
  const lines: ProbeLine[] = [];
  for (const v of VARIANTS) {
    try {
      await icountRequest("inventory/add_item", v.body);
      lines.push({ method: v.label, result: "✅ הצליח" });
    } catch (err) {
      lines.push({
        method: v.label,
        result: err instanceof Error ? err.message : "שגיאה",
      });
    }
  }
  return lines;
}
