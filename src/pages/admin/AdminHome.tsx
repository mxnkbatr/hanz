import { useState, type ReactNode } from "react";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { MultiLangField } from "../../components/admin/MultiLangField";
import { emptyI18nText } from "../../lib/i18nText";
import type {
  AbroadKind,
  AbroadProgramCms,
  HomeBannerCms,
  SiteBundle,
  SuccessStoryCms,
} from "../../lib/cms";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";

/**
 * Phone home content: promo banners, study-abroad programme cards and student
 * success stories. Each block appears on the app home only once it has entries.
 */
export function AdminHome() {
  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Нүүр хуудас (апп)</h1>
        <p>
          Баннер, зуучлалын хөтөлбөр, амжилтын түүх. Хэсэг бүр нэг ч бичлэггүй бол аппын нүүрэнд
          харагдахгүй.
        </p>
      </header>

      <ListEditor<HomeBannerCms>
        title="Баннер (слайдер)"
        hint="Шинэ элсэлт, тэтгэлэг, хямдралын зар. Зураг заавал. Холбоос: /courses/hsk1, /university/poland гэх мэт."
        field="banners"
        blank={() => ({
          id: `bn-${Date.now().toString(36)}`,
          image: "",
          title: emptyI18nText(),
          subtitle: emptyI18nText(),
          href: "",
        })}
        summary={(b) => b.title.mn || b.href || b.id}
        form={(d, set) => (
          <>
            <div className="admin-field">
              <span>Зураг</span>
              <ImageUpload value={d.image} onChange={(image) => set({ ...d, image })} folder="banners" />
            </div>
            <MultiLangField label="Гарчиг" value={d.title} onChange={(title) => set({ ...d, title })} />
            <MultiLangField label="Дэд гарчиг" value={d.subtitle} onChange={(subtitle) => set({ ...d, subtitle })} />
            <label className="admin-field">
              <span>Холбоос</span>
              <input value={d.href} onChange={(e) => set({ ...d, href: e.target.value })} placeholder="/courses" />
            </label>
          </>
        )}
      />

      <ListEditor<AbroadProgramCms>
        title="Зуучлалын хөтөлбөр"
        hint="Хэлний бэлтгэл, бакалавр, магистр, 100% тэтгэлэг — Хятад эсвэл Польш."
        field="abroadPrograms"
        blank={() => ({
          id: `ap-${Date.now().toString(36)}`,
          kind: "bachelor",
          country: "cn",
          title: emptyI18nText(),
          body: emptyI18nText(),
          image: "",
          href: "",
        })}
        summary={(p) => `${p.country === "pl" ? "🇵🇱" : "🇨🇳"} ${p.title.mn || p.id}`}
        form={(d, set) => (
          <>
            <label className="admin-field">
              <span>Төрөл</span>
              <select value={d.kind} onChange={(e) => set({ ...d, kind: e.target.value as AbroadKind })}>
                <option value="language">Хэлний бэлтгэл</option>
                <option value="bachelor">Бакалавр</option>
                <option value="master">Магистр</option>
                <option value="scholarship">100% тэтгэлэг</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Улс</span>
              <select
                value={d.country}
                onChange={(e) => set({ ...d, country: e.target.value as AbroadProgramCms["country"] })}
              >
                <option value="cn">Хятад</option>
                <option value="pl">Польш</option>
              </select>
            </label>
            <MultiLangField label="Гарчиг" value={d.title} onChange={(title) => set({ ...d, title })} />
            <MultiLangField label="Товч тайлбар" value={d.body} onChange={(body) => set({ ...d, body })} multiline rows={3} />
            <div className="admin-field">
              <span>Зураг</span>
              <ImageUpload value={d.image} onChange={(image) => set({ ...d, image })} folder="programs" />
            </div>
            <label className="admin-field">
              <span>Холбоос</span>
              <input value={d.href} onChange={(e) => set({ ...d, href: e.target.value })} placeholder="/university/poland" />
            </label>
          </>
        )}
      />

      <ListEditor<SuccessStoryCms>
        title="Амжилтын түүх"
        hint="Визээ авч гадаадад суралцаж буй оюутны зураг, сэтгэгдэл. Оюутны зөвшөөрөлтэйгөөр нийтлээрэй."
        field="stories"
        blank={() => ({
          id: `st-${Date.now().toString(36)}`,
          name: "",
          photo: "",
          country: "cn",
          school: emptyI18nText(),
          quote: emptyI18nText(),
        })}
        summary={(s) => s.name || s.id}
        form={(d, set) => (
          <>
            <label className="admin-field">
              <span>Нэр</span>
              <input value={d.name} onChange={(e) => set({ ...d, name: e.target.value })} />
            </label>
            <div className="admin-field">
              <span>Зураг</span>
              <ImageUpload value={d.photo} onChange={(photo) => set({ ...d, photo })} folder="stories" />
            </div>
            <label className="admin-field">
              <span>Улс</span>
              <select
                value={d.country}
                onChange={(e) => set({ ...d, country: e.target.value as SuccessStoryCms["country"] })}
              >
                <option value="cn">Хятад</option>
                <option value="pl">Польш</option>
              </select>
            </label>
            <MultiLangField label="Сургууль · хөтөлбөр" value={d.school} onChange={(school) => set({ ...d, school })} />
            <MultiLangField label="Сэтгэгдэл" value={d.quote} onChange={(quote) => set({ ...d, quote })} multiline rows={4} />
          </>
        )}
      />
    </div>
  );
}

type Item = { id: string; hidden?: boolean };
type ListField = "banners" | "abroadPrograms" | "stories";

function ListEditor<T extends Item>({
  title,
  hint,
  field,
  blank,
  summary,
  form,
}: {
  title: string;
  hint: string;
  field: ListField;
  blank: () => T;
  summary: (item: T) => string;
  form: (draft: T, set: (next: T) => void) => ReactNode;
}) {
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const rows = (bundle[field] ?? []) as unknown as T[];
  const [draft, setDraft] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function persist(next: T[]) {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await saveBundle({ ...bundle, [field]: next } as SiteBundle);
    setBusy(false);
    if (res.error) setErr(res.error);
    else {
      setMsg(t("admin_saved"));
      setDraft(null);
    }
  }

  function save() {
    if (!draft) return;
    const i = rows.findIndex((r) => r.id === draft.id);
    void persist(i >= 0 ? rows.map((r, n) => (n === i ? draft : r)) : [...rows, draft]);
  }

  function move(i: number, by: -1 | 1) {
    const j = i + by;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    void persist(next);
  }

  return (
    <section className="admin-card" style={{ marginBottom: "1.5rem" }}>
      <div className="admin-card-head">
        <h2>{title}</h2>
        <button type="button" className="admin-btn is-seal" onClick={() => setDraft(blank())}>
          + {t("admin_add")}
        </button>
      </div>
      <p className="admin-hint">{hint}</p>
      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      {draft && (
        <div className="admin-cms-form">
          <div className="admin-form-grid">
            {form(draft, (next) => setDraft(next))}
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(draft.hidden)}
                onChange={(e) => setDraft({ ...draft, hidden: e.target.checked })}
              />
              <span>Нуух</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="admin-btn is-seal" disabled={busy} onClick={save}>
              {t("admin_save")}
            </button>
            <button type="button" className="admin-ghost-btn" onClick={() => setDraft(null)}>
              {t("admin_cancel")}
            </button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="admin-hint">Одоогоор хоосон — аппын нүүрэнд энэ хэсэг харагдахгүй.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    {summary(r)}
                    {r.hidden ? " · (нуусан)" : ""}
                  </td>
                  <td className="admin-row-actions">
                    <button type="button" className="admin-btn" onClick={() => move(i, -1)} aria-label="Up">
                      ↑
                    </button>
                    <button type="button" className="admin-btn" onClick={() => move(i, 1)} aria-label="Down">
                      ↓
                    </button>
                    <button type="button" className="admin-btn" onClick={() => setDraft({ ...r })}>
                      {t("admin_edit")}
                    </button>
                    <button
                      type="button"
                      className="admin-btn is-danger"
                      onClick={() => {
                        if (confirm(t("admin_delete_confirm"))) void persist(rows.filter((x) => x.id !== r.id));
                      }}
                    >
                      {t("admin_delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
