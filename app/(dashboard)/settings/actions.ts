"use server";

import { revalidatePath } from "next/cache";

import { setSettings } from "@/lib/services/settings.service";

export type SettingsState = { ok?: boolean; error?: string };

/** Saves iCount credentials entered on the Settings page. */
export async function saveIcountSettingsAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const cid = String(formData.get("icount_cid") ?? "").trim();
  const user = String(formData.get("icount_user") ?? "").trim();
  const pass = String(formData.get("icount_pass") ?? "").trim();

  try {
    const values: Record<string, string | null> = {
      icount_cid: cid || null,
      icount_user: user || null,
    };
    // Only change the password when a new one is typed (blank = keep existing).
    if (pass) values.icount_pass = pass;
    await setSettings(values);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בשמירת ההגדרות",
    };
  }
  revalidatePath("/settings");
  return { ok: true };
}
