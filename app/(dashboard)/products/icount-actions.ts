"use server";

import { isIcountConfigured } from "@/lib/integrations/icount/client";
import { syncProductsToIcount } from "@/lib/integrations/icount/sync";

export type IcountSyncState = { ok?: boolean; message?: string };

/** Pushes the product catalog to iCount and returns a short summary. */
export async function syncIcountAction(): Promise<IcountSyncState> {
  if (!isIcountConfigured()) {
    return {
      ok: false,
      message: "iCount לא מוגדר — הוסיפו ICOUNT_CID / ICOUNT_USER / ICOUNT_PASS ל-.env.local",
    };
  }
  try {
    const r = await syncProductsToIcount();
    const errs = r.errors.length ? ` · ${r.errors.length} שגיאות` : "";
    return {
      ok: true,
      message: `סונכרן: ${r.created} נוצרו, ${r.updated} עודכנו (מתוך ${r.total})${errs}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "שגיאה בסנכרון ל-iCount",
    };
  }
}
