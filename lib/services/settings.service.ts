import { createClient } from "@/lib/supabase/server";

/**
 * App settings — a simple key/value store (table `app_settings`) for things
 * like integration credentials entered in the UI.
 */

export async function getSettings(
  keys: string[]
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  for (const k of keys) result[k] = null;
  if (keys.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", keys);
  if (error) throw new Error(error.message);

  for (const row of (data as { key: string; value: string | null }[]) ?? []) {
    result[row.key] = row.value;
  }
  return result;
}

/** Upserts settings. A null/empty value clears (deletes) the key. */
export async function setSettings(
  values: Record<string, string | null>
): Promise<void> {
  const supabase = await createClient();

  const toUpsert = Object.entries(values)
    .filter(([, v]) => v != null && v.trim() !== "")
    .map(([key, value]) => ({ key, value: (value as string).trim() }));
  const toDelete = Object.entries(values)
    .filter(([, v]) => v == null || v.trim() === "")
    .map(([key]) => key);

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("app_settings")
      .upsert(toUpsert, { onConflict: "key" });
    if (error) throw new Error(error.message);
  }
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("app_settings")
      .delete()
      .in("key", toDelete);
    if (error) throw new Error(error.message);
  }
}
