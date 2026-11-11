import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const previewFlag = (process.env.EXPO_PUBLIC_PREVIEW ?? "").trim().toLowerCase();

export const hasSupabase = Boolean(url && anonKey);

/**
 * Fixture catalog + sandbox QPay.
 * Preview is on when EXPO_PUBLIC_PREVIEW=1, or when no anon key is configured.
 */
export const isPreview =
  previewFlag === "1" || previewFlag === "true" || (!hasSupabase && previewFlag !== "0" && previewFlag !== "false");

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}
