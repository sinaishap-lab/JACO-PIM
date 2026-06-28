"use server";

import { isIcountConfigured } from "@/lib/integrations/icount/client";
import { syncProductsToIcount } from "@/lib/integrations/icount/sync";

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
    const errs = r.errors.length
      ? ` · ${r.errors.length} שגיאות · ${r.errors[0]}`
      : "";
    return {
      ok: r.errors.length === 0,
      message: `סונכרן: ${r.created} נוצרו, ${r.updated} עודכנו (מתוך ${r.total})${errs}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "שגיאה בסנכרון ל-iCount",
    };
  }
}
