import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key.
 *
 * ⚠️ SERVER-ONLY. The service-role key BYPASSES Row Level Security, so it must
 * never reach the browser. Only import this from Server Actions, Route
 * Handlers, or server-side scripts — never from a Client Component.
 *
 * Use it for trusted back-office operations (bulk imports, admin tasks). For
 * normal request-scoped access prefer `createClient` from `./server`.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
