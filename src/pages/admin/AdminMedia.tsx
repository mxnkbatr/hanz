import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { useI18n } from "../../i18n/I18nContext";

type FileItem = { name: string; url: string; updated?: string };

export function AdminMedia() {
  const { t } = useI18n();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folder, setFolder] = useState("uploads");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState("");

  async function load() {
    setBusy(true);
    const { data, error } = await supabase.storage.from("media").list(folder, {
      limit: 100,
      sortBy: { column: "updated_at", order: "desc" },
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    const items = (data || [])
      .filter((f) => f.name && !f.name.endsWith("/"))
      .map((f) => {
        const path = `${folder}/${f.name}`;
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        return {
          name: f.name,
          url: pub.publicUrl,
          updated: f.updated_at ?? undefined,
        };
      });
    setFiles(items);
    setErr("");
  }

  useEffect(() => {
    void load();
  }, [folder]);

  async function remove(name: string) {
    if (!confirm(t("admin_delete_confirm"))) return;
    setBusy(true);
    const { error } = await supabase.storage
      .from("media")
      .remove([`${folder}/${name}`]);
    setBusy(false);
    if (error) setErr(error.message);
    else await load();
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_media")}</h1>
        <p>{t("admin_media_lead")}</p>
      </header>

      <div className="admin-toolbar">
        <select value={folder} onChange={(e) => setFolder(e.target.value)}>
          <option value="uploads">uploads</option>
          <option value="news">news</option>
          <option value="products">products</option>
          <option value="courses">courses</option>
          <option value="travel">travel</option>
          <option value="universities">universities</option>
          <option value="kids">kids</option>
        </select>
        <button type="button" className="admin-btn" onClick={() => void load()}>
          {t("admin_refresh")}
        </button>
      </div>

      <section className="admin-card">
        <ImageUpload
          value={uploaded}
          onChange={(url) => {
            setUploaded(url);
            void load();
          }}
          folder={folder}
        />
      </section>

      {err && <p className="admin-err">{err}</p>}
      {busy && <p className="admin-muted">{t("form_sending")}</p>}

      <div className="admin-media-grid">
        {files.map((f) => (
          <article key={f.name} className="admin-media-card">
            <img src={f.url} alt={f.name} loading="lazy" />
            <p>{f.name}</p>
            <div className="admin-row-actions">
              <button
                type="button"
                className="admin-btn"
                onClick={() => void navigator.clipboard.writeText(f.url)}
              >
                URL
              </button>
              <button
                type="button"
                className="admin-btn is-danger"
                onClick={() => void remove(f.name)}
              >
                {t("admin_delete")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
