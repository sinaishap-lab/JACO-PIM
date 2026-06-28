"use server";

import { isIcountConfigured } from "@/lib/integrations/icount/client";
import { syncProductsToIcount } from "@/lib/integrations/icount/sync";
import { probeIcountMethods } from "@/lib/integrations/icount/probe";

export type IcountSyncState = { ok?: boolean; message?: string };

/** Pushes the product catalog to iCount and returns a short summary. */
export async function syncIcountAction(): Promise<IcountSyncState> {
  if (!(await isIcountConfigured())) {
    return {
      ok: false,
      message: "iCount לא מוגדר — הזינו את הפרטים במסך ההגדרות",
    };
  }
  try {
    const r = await syncProductsToIcount();
    const skipped = r.skipped ? `, ${r.skipped} דולגו` : "";
    const errs = r.errors.length
      ? ` · ${r.errors.length} שגיאות · ${r.errors[0]}`
      : "";
    return {
      ok: r.errors.length === 0,
      message: `סונכרן: ${r.created} נוצרו, ${r.updated} עודכנו${skipped} (מתוך ${r.total})${errs}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "שגיאה בסנכרון ל-iCount",
    };
  }
}

/** Temporary diagnostic: isolates which add_item field breaks item creation. */
export async function probeIcountAction(): Promise<IcountSyncState> {
  if (!(await isIcountConfigured())) {
    return {
      ok: false,
      message: "iCount לא מוגדר — הזינו את הפרטים במסך ההגדרות",
    };
  }
  try {
    const lines = await probeIcountMethods();
    return {
      ok: true,
      message: lines.map((l) => `${l.method} → ${l.result}`).join("\n"),
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "שגיאה באבחון iCount",
    };
  }
}
