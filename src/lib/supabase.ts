import type { SupabaseClient } from "@supabase/supabase-js";

let client: Promise<SupabaseClient> | undefined;

/**
 * The Supabase SDK (~210 KB) loads on first use instead of with the main bundle,
 * so the first screen paints without waiting for it. Admin pages are lazy routes
 * already and import `supabase` from ./supabaseClient directly.
 */
export function getSupabase(): Promise<SupabaseClient> {
  client ??= import("./supabaseClient").then((m) => m.supabase);
  return client;
}
