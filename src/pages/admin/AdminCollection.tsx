import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { MultiLangField } from "../../components/admin/MultiLangField";
import {
  createCms,
  listCms,
  removeCms,
  updateCms,
  type CmsRow,
  type CmsTable,
} from "../../lib/cmsApi";
import { emptyI18nText, loc, slugify, type I18nText } from "../../lib/i18nText";
import { useI18n } from "../../i18n/I18nContext";
import { hapticLight } from "../../lib/native";
import { useSiteContent } from "../../lib/SiteContentContext";

type CollectionKey = "news" | "products" | "courses" | "travel" | "universities";

const TABLE: Record<CollectionKey, CmsTable> = {
  news: "news",
  products: "products",
  courses: "courses",
  travel: "travel_packages",
  universities: "universities",
};

const TITLE_KEY: Record<CollectionKey, string> = {
  news: "nav_news",
  products: "nav_shop",
  courses: "nav_courses",
  travel: "nav_travel",
  universities: "nav_uni",
};

type Draft = {
  id?: string;
  slug: string;
  title: I18nText;
  body: I18nText;
  excerpt: I18nText;
  tag: I18nText;
  city: I18nText;
  duration: I18nText;
  filter_key: string;
  image_url: string;
  price: string;
  href: string;
  highlights: string;
  /** Courses: poster image and the team members who teach it. */
  poster: string;
  teacherIds: string[];
  in_stock: boolean;
  hidden: boolean;
  sort_order: number;
  published_at: string;
};

const COURSE_FILTERS = [
  "classroom",
  "online",
  "corporate",
  "short",
  "kids",
  "year",
  "hsk",
  "speak",
  "english",
] as const;

const CITY_KEYS = [
  "map_beijing",
  "map_chongqing",
  "map_nanjing",
  "map_chengdu",
] as const;

function blankDraft(): Draft {
  return {
    slug: "",
    title: emptyI18nText(),
    body: emptyI18nText(),
    excerpt: emptyI18nText(),
    tag: emptyI18nText(),
    city: emptyI18nText(),
    duration: emptyI18nText(),
    filter_key: "tag_academy",
    image_url: "",
    price: "0",
    href: "",
    highlights: "",
    poster: "",
    teacherIds: [],
    in_stock: true,
    hidden: false,
    sort_order: 0,
    published_at: new Date().toISOString().slice(0, 10),
  };
}

function rowToDraft(r: CmsRow, collection: CollectionKey = "news"): Draft {
  const meta = (r.meta || {}) as {
    href?: string;
    highlights?: string[];
    cityKey?: string;
    poster?: string;
    teacherIds?: string[];
  };
  const fallbackFilter =
    collection === "products"
      ? "porcelain"
      : collection === "courses"
        ? "classroom"
        : collection === "universities"
          ? meta.cityKey || r.city?.mn || ""
          : "tag_academy";
  return {
    id: r.id,
    slug: r.slug,
    title: r.title || emptyI18nText(),
    body: r.body || emptyI18nText(),
    excerpt: r.excerpt || emptyI18nText(),
    tag: r.tag || emptyI18nText(),
    city: r.city || emptyI18nText(),
    duration: r.duration || emptyI18nText(),
    filter_key: r.filter_key || fallbackFilter,
    image_url: r.image_url || "",
    price: String(r.price ?? 0),
    href: String((r.meta as { href?: string } | undefined)?.href || ""),
    highlights: Array.isArray(r.highlights)
      ? (r.highlights as string[]).join("\n")
      : Array.isArray((r.meta as { highlights?: string[] } | undefined)?.highlights)
        ? ((r.meta as { highlights: string[] }).highlights || []).join("\n")
        : "",
    poster: meta.poster || "",
    teacherIds: Array.isArray(meta.teacherIds) ? meta.teacherIds : [],
    in_stock: r.in_stock ?? true,
    hidden: r.hidden,
    sort_order: r.sort_order ?? 0,
    published_at: (r.published_at || "").slice(0, 10),
  };
}

export function AdminCollection({
  collection = "news",
}: {
  collection?: CollectionKey;
}) {
  const key = (
    ["news", "products", "courses", "travel", "universities"].includes(
      collection,
    )
      ? collection
      : "news"
  ) as CollectionKey;
  const table = TABLE[key];
  const { t, lang } = useI18n();
  const { teamLive, coursesLive } = useSiteContent();

  // A course row saved before teachers existed keeps showing its default teachers; start the editor from those.
  function openRow(r: CmsRow) {
    const d = rowToDraft(r, key);
    if (key === "courses" && !Array.isArray(r.meta?.teacherIds)) {
      d.teacherIds = [...(coursesLive.find((c) => c.id === (r.slug || r.id))?.teacherIds ?? [])];
    }
    setDraft(d);
  }
  const [params, setParams] = useSearchParams();

  const [rows, setRows] = useState<CmsRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data, error } = await listCms(table, { includeHidden: true });
    if (error) setErr(error);
    else {
      setErr("");
      setRows(data);
    }
  };

  useEffect(() => {
    setDraft(null);
    void load();
  }, [table]);

  const sorted = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...rows]
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((r) => {
        if (!needle) return true;
        const title =
          r.title?.[lang] || r.title?.mn || r.title?.en || r.title?.zh || "";
        return (
          title.toLowerCase().includes(needle) ||
          r.slug.toLowerCase().includes(needle)
        );
      });
  }, [rows, q, lang]);

  function openNew() {
    const d = blankDraft();
    d.sort_order = rows.length;
    if (key === "products") d.filter_key = "porcelain";
    if (key === "courses") d.filter_key = "classroom";
    setDraft(d);
  }

  useEffect(() => {
    if (params.get("new") !== "1") return;
    openNew();
    const next = new URLSearchParams(params);
    next.delete("new");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once from ?new=1
  }, [table, params.get("new")]);

  async function save() {
    if (!draft) return;
    setBusy(true);
    void hapticLight();
    const slug =
      draft.slug.trim() ||
      slugify(draft.title.mn || draft.title.en || draft.title.zh || "item");

    const base: Partial<CmsRow> = {
      slug,
      title: draft.title,
      body: draft.body,
      image_url: draft.image_url || null,
      hidden: draft.hidden,
      sort_order: Number(draft.sort_order) || 0,
    };

    if (key === "news") {
      Object.assign(base, {
        excerpt: draft.excerpt,
        tag: draft.tag,
        filter_key: draft.filter_key,
        published_at: draft.published_at || null,
      });
    }
    if (key === "products") {
      Object.assign(base, {
        tag: draft.tag,
        filter_key: draft.filter_key || "porcelain",
        price: Number(draft.price) || 0,
        in_stock: draft.in_stock,
        meta: { href: draft.href.trim() || undefined },
      });
    }
    if (key === "courses") {
      Object.assign(base, {
        tag: draft.tag,
        filter_key: draft.filter_key || "classroom",
        meta: {
          highlights: draft.highlights
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          poster: draft.poster || undefined,
          teacherIds: draft.teacherIds,
        },
      });
    }
    if (key === "travel") {
      Object.assign(base, {
        tag: draft.tag,
        duration: draft.duration,
        price: draft.price === "" ? null : Number(draft.price) || 0,
        highlights: draft.highlights
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }
    if (key === "universities") {
      const cityKey = draft.filter_key || "";
      Object.assign(base, {
        city: cityKey
          ? { mn: cityKey, en: cityKey, zh: cityKey }
          : draft.city,
        meta: { cityKey: cityKey || undefined },
      });
    }

    const res = draft.id
      ? await updateCms(table, draft.id, base)
      : await createCms(table, base);

    setBusy(false);
    if (res.error) {
      setErr(res.error);
      return;
    }
    setDraft(null);
    await load();
  }

  async function toggleHidden(row: CmsRow) {
    setBusy(true);
    const { error } = await updateCms(table, row.id, { hidden: !row.hidden });
    setBusy(false);
    if (error) setErr(error);
    else await load();
  }

  async function del(row: CmsRow) {
    if (!confirm(t("admin_delete_confirm"))) return;
    setBusy(true);
    const { error } = await removeCms(table, row.id);
    setBusy(false);
    if (error) setErr(error);
    else await load();
  }

  async function moveRow(row: CmsRow, dir: -1 | 1) {
    const ordered = [...rows].sort((a, b) => a.sort_order - b.sort_order);
    const idx = ordered.findIndex((r) => r.id === row.id);
    const swap = ordered[idx + dir];
    if (idx < 0 || !swap) return;
    setBusy(true);
    const a = row.sort_order;
    const b = swap.sort_order;
    const [r1, r2] = await Promise.all([
      updateCms(table, row.id, { sort_order: b }),
      updateCms(table, swap.id, { sort_order: a }),
    ]);
    setBusy(false);
    if (r1.error || r2.error) setErr(r1.error || r2.error || "");
    else await load();
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t(TITLE_KEY[key])}</h1>
        <p>{t("admin_cms_lead")}</p>
        <button type="button" className="admin-btn is-seal" onClick={openNew}>
          + {t("admin_add")}
        </button>
      </header>

      <label className="admin-search">
        <span className="sr-only">{t("admin_search_cms")}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("admin_search_cms")}
        />
      </label>

      {err && <p className="admin-err">{err}</p>}

      {draft && (
        <section className="admin-card admin-cms-form admin-sheet">
          <div className="admin-card-head admin-sheet-head">
            <button
              type="button"
              className="admin-sheet-back"
              onClick={() => setDraft(null)}
            >
              ← {t("admin_cancel")}
            </button>
            <h2>{draft.id ? t("admin_edit") : t("admin_add")}</h2>
            <button
              type="button"
              className="admin-btn is-seal admin-sheet-save"
              disabled={busy}
              onClick={() => void save()}
            >
              {t("admin_save")}
            </button>
            <button
              type="button"
              className="admin-ghost-btn admin-desk-cancel"
              onClick={() => setDraft(null)}
            >
              {t("admin_cancel")}
            </button>
          </div>

          <div className="admin-form-grid">
            <MultiLangField
              label={t("admin_title_field")}
              value={draft.title}
              onChange={(title) => setDraft({ ...draft, title })}
            />
            {(key === "news" || key === "products" || key === "courses" || key === "travel") && (
              <MultiLangField
                label={t("admin_tag_field")}
                value={draft.tag}
                onChange={(tag) => setDraft({ ...draft, tag })}
              />
            )}
            {key === "news" && (
              <MultiLangField
                label={t("admin_excerpt_field")}
                value={draft.excerpt}
                onChange={(excerpt) => setDraft({ ...draft, excerpt })}
                multiline
                rows={3}
              />
            )}
            <MultiLangField
              label={t("admin_body_field")}
              value={draft.body}
              onChange={(body) => setDraft({ ...draft, body })}
              multiline
              rows={6}
            />
            {key === "travel" && (
              <MultiLangField
                label={t("admin_duration_field")}
                value={draft.duration}
                onChange={(duration) => setDraft({ ...draft, duration })}
              />
            )}

            <ImageUpload
              value={draft.image_url}
              onChange={(image_url) => setDraft({ ...draft, image_url })}
              folder={key}
            />

            <label className="admin-field">
              <span>Slug</span>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="auto"
              />
            </label>

            <label className="admin-field">
              <span>{t("admin_sort")}</span>
              <input
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                }
              />
            </label>

            {(key === "products" || key === "travel") && (
              <label className="admin-field">
                <span>{t("admin_price")}</span>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </label>
            )}

            {key === "products" && (
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={draft.in_stock}
                  onChange={(e) =>
                    setDraft({ ...draft, in_stock: e.target.checked })
                  }
                />
                <span>{t("admin_in_stock")}</span>
              </label>
            )}

            {key === "news" && (
              <label className="admin-field">
                <span>{t("admin_date")}</span>
                <input
                  type="date"
                  value={draft.published_at}
                  onChange={(e) =>
                    setDraft({ ...draft, published_at: e.target.value })
                  }
                />
              </label>
            )}

            {key === "products" && (
              <>
                <label className="admin-field">
                  <span>{t("shop_filter_label")}</span>
                  <select
                    value={draft.filter_key || "porcelain"}
                    onChange={(e) =>
                      setDraft({ ...draft, filter_key: e.target.value })
                    }
                  >
                    <option value="porcelain">{t("cat_porcelain")}</option>
                    <option value="books">{t("cat_books")}</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>{t("admin_product_href")}</span>
                  <input
                    value={draft.href}
                    onChange={(e) =>
                      setDraft({ ...draft, href: e.target.value })
                    }
                    placeholder="https://"
                  />
                </label>
              </>
            )}

            {key === "courses" && (
              <>
                <label className="admin-field">
                  <span>{t("admin_filter_key")}</span>
                  <select
                    value={draft.filter_key || "classroom"}
                    onChange={(e) =>
                      setDraft({ ...draft, filter_key: e.target.value })
                    }
                  >
                    {COURSE_FILTERS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>{t("admin_course_advantages")}</span>
                  <textarea
                    rows={4}
                    value={draft.highlights}
                    onChange={(e) =>
                      setDraft({ ...draft, highlights: e.target.value })
                    }
                  />
                </label>
                <div className="admin-field">
                  <span>{t("admin_course_poster")}</span>
                  <ImageUpload
                    value={draft.poster}
                    onChange={(poster) => setDraft({ ...draft, poster })}
                    folder="courses"
                  />
                </div>
                <fieldset className="admin-field admin-checks">
                  <legend>{t("admin_course_teachers")}</legend>
                  {teamLive.map((m) => (
                    <label key={m.id} className="admin-check">
                      <input
                        type="checkbox"
                        checked={draft.teacherIds.includes(m.id)}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            teacherIds: e.target.checked
                              ? [...draft.teacherIds, m.id]
                              : draft.teacherIds.filter((x) => x !== m.id),
                          })
                        }
                      />
                      <span>{loc(lang, t, m.name, m.nameKey)}</span>
                    </label>
                  ))}
                </fieldset>
              </>
            )}

            {key === "travel" && (
              <label className="admin-field">
                <span>{t("admin_highlights")}</span>
                <textarea
                  rows={3}
                  value={draft.highlights}
                  onChange={(e) =>
                    setDraft({ ...draft, highlights: e.target.value })
                  }
                  placeholder="travel_china_h1&#10;travel_china_h2"
                />
              </label>
            )}

            {key === "universities" && (
              <label className="admin-field">
                <span>{t("uni_filter_label")}</span>
                <select
                  value={draft.filter_key || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, filter_key: e.target.value })
                  }
                >
                  <option value="">—</option>
                  {CITY_KEYS.map((c) => (
                    <option key={c} value={c}>
                      {t(c)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {key === "news" && (
              <label className="admin-field">
                <span>{t("admin_filter_key")}</span>
                <input
                  value={draft.filter_key}
                  onChange={(e) =>
                    setDraft({ ...draft, filter_key: e.target.value })
                  }
                />
              </label>
            )}

            <label className="admin-check">
              <input
                type="checkbox"
                checked={draft.hidden}
                onChange={(e) =>
                  setDraft({ ...draft, hidden: e.target.checked })
                }
              />
              <span>{t("admin_hide")}</span>
            </label>
          </div>

          <div className="admin-form-actions admin-sticky-save">
            <button
              type="button"
              className="admin-btn is-seal"
              disabled={busy}
              onClick={() => void save()}
            >
              {t("admin_save")}
            </button>
          </div>
        </section>
      )}

      {/* Phone: card list */}
      <section className="admin-rn-list" aria-label={t(TITLE_KEY[key])}>
        {sorted.length === 0 ? (
          <p className="admin-empty">{t("admin_cms_empty")}</p>
        ) : (
          sorted.map((r) => {
            const title =
              r.title?.[lang] || r.title?.mn || r.title?.en || r.slug;
            return (
              <article key={r.id} className="admin-rn-card">
                <button
                  type="button"
                  className="admin-rn-card-main"
                  onClick={() => openRow(r)}
                >
                  <strong>{title}</strong>
                  <em>
                    {r.slug}
                    {r.hidden ? ` · ${t("admin_hide")}` : ""}
                  </em>
                </button>
                <div className="admin-rn-card-actions">
                  <button
                    type="button"
                    className="admin-icon-btn"
                    disabled={busy}
                    onClick={() => void moveRow(r, -1)}
                    aria-label={t("admin_move_up")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    disabled={busy}
                    onClick={() => void moveRow(r, 1)}
                    aria-label={t("admin_move_down")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    disabled={busy}
                    onClick={() => void toggleHidden(r)}
                    aria-label={r.hidden ? t("admin_show") : t("admin_hide")}
                  >
                    {r.hidden ? "○" : "●"}
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn is-danger"
                    disabled={busy}
                    onClick={() => void del(r)}
                    aria-label={t("admin_delete")}
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Desktop: table */}
      <section className="admin-card admin-desk-table">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin_sort")}</th>
                <th>{t("admin_title_field")}</th>
                <th>{t("admin_status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4}>{t("admin_cms_empty")}</td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr key={r.id}>
                    <td>{r.sort_order}</td>
                    <td>
                      <strong>
                        {r.title?.[lang] ||
                          r.title?.mn ||
                          r.title?.en ||
                          r.slug}
                      </strong>
                      <em className="admin-muted"> {r.slug}</em>
                    </td>
                    <td>{r.hidden ? t("admin_hide") : t("admin_visible")}</td>
                    <td className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busy}
                        onClick={() => void moveRow(r, -1)}
                        title={t("admin_move_up")}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busy}
                        onClick={() => void moveRow(r, 1)}
                        title={t("admin_move_down")}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => openRow(r)}
                      >
                        {t("admin_edit")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busy}
                        onClick={() => void toggleHidden(r)}
                      >
                        {r.hidden ? t("admin_show") : t("admin_hide")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn is-danger"
                        disabled={busy}
                        onClick={() => void del(r)}
                      >
                        {t("admin_delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!draft && (
        <button
          type="button"
          className="admin-fab"
          onClick={openNew}
          aria-label={t("admin_add")}
        >
          +
        </button>
      )}
    </div>
  );
}
