import "server-only";

/**
 * Thin client for the iCount v3 REST API (https://api.icount.co.il/api/v3.php).
 * Credentials come from the environment — never hard-code them:
 *   ICOUNT_CID   – company id
 *   ICOUNT_USER  – API user
 *   ICOUNT_PASS  – API password
 * (Override the base URL with ICOUNT_API_URL if needed.)
 */

const BASE_URL =
  process.env.ICOUNT_API_URL ?? "https://api.icount.co.il/api/v3.php";

function credentials() {
  const cid = process.env.ICOUNT_CID;
  const user = process.env.ICOUNT_USER;
  const pass = process.env.ICOUNT_PASS;
  if (!cid || !user || !pass) {
    throw new Error(
      "חסרים פרטי iCount ב-.env.local (ICOUNT_CID, ICOUNT_USER, ICOUNT_PASS)"
    );
  }
  return { cid, user, pass };
}

export function isIcountConfigured(): boolean {
  return Boolean(
    process.env.ICOUNT_CID && process.env.ICOUNT_USER && process.env.ICOUNT_PASS
  );
}

/**
 * POSTs to an iCount endpoint (e.g. "items/create") with credentials merged in,
 * and returns the parsed JSON. Throws on HTTP or API-level errors.
 */
export async function icountRequest(
  path: string,
  body: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...credentials(), ...body }),
    cache: "no-store",
  });

  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`iCount: תשובה לא תקינה (${res.status})`);
  }

  if (!res.ok || json.status === false) {
    const reason =
      (typeof json.reason === "string" && json.reason) ||
      (typeof json.error_description === "string" && json.error_description) ||
      `iCount error (${res.status})`;
    throw new Error(reason);
  }
  return json;
}
