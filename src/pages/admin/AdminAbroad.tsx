import { useState } from "react";
import { MultiLangField } from "../../components/admin/MultiLangField";
import { emptyI18nText } from "../../lib/i18nText";
import type { GuideRowCms, SiteBundle, UniInfoCms } from "../../lib/cms";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";
import { universities } from "../../data/universities";
import { polandTopUniversities } from "../../data/poland";

/**
 * Study abroad tab content: per-school tuition / dorm / deadline / majors (feeds
 * the city and major filters) and optional country-guide rows that replace the
 * built-in ones.
 */
export function AdminAbroad() {
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [info, setInfo] = useState<UniInfoCms | null>(null);
  const [guide, setGuide] = useState<{ field: "guideCn" | "guidePl"; row: GuideRowCms } | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const infos = bundle.uniInfo ?? [];
  const schools = [
    ...universities.map((u) => ({ id: u.slug, label: `🇨🇳 ${u.name}` })),
    ...polandTopUniversities.map((u) => ({ id: u.name, label: `🇵🇱 ${u.name}` })),
  ];

  async function save(next: Partial<SiteBundle>) {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await saveBundle({ ...bundle, ...next });
    setBusy(false);
    if (res.error) setErr(res.error);
    else {
      setMsg(t("admin_saved"));
      setInfo(null);
      setGuide(null);
    }
  }

  function saveInfo() {
    if (!info || !info.id) return;
    const rest = infos.filter((x) => x.id !== info.id);
    void save({ uniInfo: [...rest, info] });
  }

  function saveGuide() {
    if (!guide) return;
    const list = bundle[guide.field] ?? [];
    const i = list.findIndex((r) => r.id === guide.row.id);
    const next = i >= 0 ? list.map((r, n) => (n === i ? guide.row : r)) : [...list, guide.row];
    void save({ [guide.field]: next });
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Зуучлал (апп)</h1>
        <p>Сургууль бүрийн төлбөр, дотуур байр, элсэлтийн хугацаа, мэргэжил. Мэргэжил оруулсан сургуулиуд аппын "Мэргэжил" шүүлтүүрт гарна.</p>
      </header>
      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      <section className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card-head">
          <h2>Сургуулийн мэдээлэл</h2>
          <button
            type="button"
            className="admin-btn is-seal"
            onClick={() =>
              setInfo({ id: "", tuition: emptyI18nText(), dorm: emptyI18nText(), deadline: emptyI18nText(), majors: "" })
            }
          >
            + {t("admin_add")}
          </button>
        </div>

        {info && (
          <div className="admin-cms-form">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Сургууль</span>
                <select value={info.id} onChange={(e) => setInfo({ ...info, id: e.target.value })}>
                  <option value="">—</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <MultiLangField label="Төлбөр (жилд)" value={info.tuition} onChange={(tuition) => setInfo({ ...info, tuition })} />
              <MultiLangField label="Дотуур байр" value={info.dorm} onChange={(dorm) => setInfo({ ...info, dorm })} />
              <MultiLangField label="Элсэлтийн хугацаа" value={info.deadline} onChange={(deadline) => setInfo({ ...info, deadline })} />
              <label className="admin-field">
                <span>Мэргэжлүүд (таслалаар)</span>
                <input
                  value={info.majors}
                  onChange={(e) => setInfo({ ...info, majors: e.target.value })}
                  placeholder="Бизнес, Анагаах ухаан, Инженер"
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="admin-btn is-seal" disabled={busy || !info.id} onClick={saveInfo}>
                {t("admin_save")}
              </button>
              <button type="button" className="admin-ghost-btn" onClick={() => setInfo(null)}>
                {t("admin_cancel")}
              </button>
            </div>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <tbody>
              {infos.map((x) => (
                <tr key={x.id}>
                  <td>{schools.find((s) => s.id === x.id)?.label ?? x.id}</td>
                  <td>{x.majors || "—"}</td>
                  <td className="admin-row-actions">
                    <button type="button" className="admin-btn" onClick={() => setInfo({ ...x })}>
                      {t("admin_edit")}
                    </button>
                    <button
                      type="button"
                      className="admin-btn is-danger"
                      onClick={() => {
                        if (confirm(t("admin_delete_confirm"))) void save({ uniInfo: infos.filter((y) => y.id !== x.id) });
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
      </section>

      {(["guideCn", "guidePl"] as const).map((field) => {
        const rows = bundle[field] ?? [];
        return (
          <section key={field} className="admin-card" style={{ marginBottom: "1.5rem" }}>
            <div className="admin-card-head">
              <h2>{field === "guideCn" ? "Хятад" : "Польш"} — улсын танилцуулга</h2>
              <button
                type="button"
                className="admin-btn is-seal"
                onClick={() =>
                  setGuide({ field, row: { id: `g-${Date.now().toString(36)}`, label: emptyI18nText(), value: emptyI18nText() } })
                }
              >
                + {t("admin_add")}
              </button>
            </div>
            <p className="admin-hint">
              Хоосон бол аппын үндсэн мөрүүд (хэл, төлбөр, виз…) харагдана. Мөр нэмбэл тэдгээрийг бүрэн орлоно.
            </p>
            {guide?.field === field && (
              <div className="admin-cms-form">
                <div className="admin-form-grid">
                  <MultiLangField label="Гарчиг (жишээ: Амьдрах өртөг)" value={guide.row.label} onChange={(label) => setGuide({ field, row: { ...guide.row, label } })} />
                  <MultiLangField label="Утга" value={guide.row.value} onChange={(value) => setGuide({ field, row: { ...guide.row, value } })} multiline rows={2} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="admin-btn is-seal" disabled={busy} onClick={saveGuide}>
                    {t("admin_save")}
                  </button>
                  <button type="button" className="admin-ghost-btn" onClick={() => setGuide(null)}>
                    {t("admin_cancel")}
                  </button>
                </div>
              </div>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.label.mn || r.id}</td>
                      <td>{r.value.mn}</td>
                      <td className="admin-row-actions">
                        <button type="button" className="admin-btn" onClick={() => setGuide({ field, row: { ...r } })}>
                          {t("admin_edit")}
                        </button>
                        <button
                          type="button"
                          className="admin-btn is-danger"
                          onClick={() => {
                            if (confirm(t("admin_delete_confirm"))) void save({ [field]: rows.filter((y) => y.id !== r.id) });
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
          </section>
        );
      })}
    </div>
  );
}
