import "server-only";

import { getSettings } from "@/lib/services/settings.service";

/**
 * Thin client for the iCount v3 REST API (https://api.icount.co.il/api/v3.php).
 * Credentials are read from the in-app settings (entered on the Settings page),
 * falling back to environment variables (ICOUNT_CID/USER/PASS) if set.
 */

const BASE_URL =
  process.env.ICOUNT_API_URL ?? "https://api.icount.co.il/api/v3.php";

type IcountAuth =
  | { token: string }
  | { cid: string; user: string; pass: string };

/** Reads iCount auth from app settings (token preferred), falling back to env. */
export async function getIcountAuth(): Promise<IcountAuth | null> {
  const s = await getSettings([
    "icount_token",
    "icount_cid",
    "icount_user",
    "icount_pass",
  ]);
  const token = s.icount_token || process.env.ICOUNT_TOKEN || "";
  if (token) return { token };

  const cid = s.icount_cid || process.env.ICOUNT_CID || "";
  const user = s.icount_user || process.env.ICOUNT_USER || "";
  const pass = s.icount_pass || process.env.ICOUNT_PASS || "";
  if (cid && user && pass) return { cid, user, pass };
  return null;
}

export async function isIcountConfigured(): Promise<boolean> {
  return (await getIcountAuth()) != null;
}

/**
 * POSTs to an iCount endpoint (e.g. "items/create") with credentials merged in,
 * and returns the parsed JSON. Throws on HTTP or API-level errors.
 */
export async function icountRequest(
  path: string,
  body: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const auth = await getIcountAuth();
  if (!auth) {
    throw new Error("פרטי iCount לא הוגדרו — הזינו אותם במסך ההגדרות");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let payload: Record<string, unknown> = body;
  if ("token" in auth) {
    // Access-token auth (Bearer).
    headers["Authorization"] = `Bearer ${auth.token}`;
  } else {
    // Company id + user + pass auth (in body).
    payload = { ...auth, ...body };
  }

  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`iCount: תשובה לא תקינה (${res.status})`);
  }

  // iCount's PHP API may signal failure as false, 0 or "0".
  const failed =
    json.status === false || json.status === 0 || json.status === "0";
  if (!res.ok || failed) {
    const reason =
      (typeof json.reason === "string" && json.reason) ||
      (typeof json.error_description === "string" && json.error_description) ||
      `iCount error (${res.status})`;
    throw new Error(reason);
  }
  return json;
}
