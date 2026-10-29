import { getSupabase } from "./supabase";
import type { I18nText } from "./i18nText";

export type CmsTable =
  | "news"
  | "products"
  | "courses"
  | "travel_packages"
  | "universities";

export type CmsRow = {
  id: string;
  slug: string;
  title: I18nText;
  body: I18nText;
  image_url: string | null;
  hidden: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  // optional per-table
  excerpt?: I18nText;
  tag?: I18nText;
  filter_key?: string;
  published_at?: string;
  price?: number | null;
  in_stock?: boolean;
  duration?: I18nText;
  highlights?: unknown;
  city?: I18nText;
  meta?: Record<string, unknown>;
};

export async function listCms(
  table: CmsTable,
  opts?: { includeHidden?: boolean },
) {
  const supabase = await getSupabase();
  let q = supabase.from(table).select("*").order("sort_order", {
    ascending: true,
  });
  if (!opts?.includeHidden) {
    q = q.eq("hidden", false);
  }
  const { data, error } = await q;
  if (error) return { data: [] as CmsRow[], error: error.message };
  return { data: (data as CmsRow[]) ?? [], error: undefined };
}

export async function createCms(
  table: CmsTable,
  row: Partial<CmsRow>,
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select("*")
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as CmsRow, error: undefined };
}

export async function updateCms(
  table: CmsTable,
  id: string,
  patch: Partial<CmsRow>,
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from(table)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as CmsRow, error: undefined };
}

export async function removeCms(table: CmsTable, id: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function uploadMedia(file: File, folder = "uploads") {
  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const supabase = await getSupabase();
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/webp",
  });
  if (error) return { url: null as string | null, error: error.message };
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, error: undefined };
}
