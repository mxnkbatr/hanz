import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useI18n } from "../../i18n/I18nContext";

export function AdminStaff() {
  const { t } = useI18n();
  const [emails, setEmails] = useState<string[]>([]);
  const [next, setNext] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("admin_allowlist")
      .select("email")
      .order("email");
    if (error) {
      setErr(error.message);
      return;
    }
    setEmails((data || []).map((r) => r.email));
    setErr("");
  }

  useEffect(() => {
    void load();
  }, []);

  async function add() {
    const email = next.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase
      .from("admin_allowlist")
      .insert({ email });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setNext("");
      setMsg(t("admin_saved"));
      await load();
    }
  }

  async function remove(email: string) {
    if (!confirm(t("admin_delete_confirm"))) return;
    setBusy(true);
    const { error } = await supabase
      .from("admin_allowlist")
      .delete()
      .eq("email", email);
    setBusy(false);
    if (error) setErr(error.message);
    else await load();
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_staff")}</h1>
        <p>{t("admin_staff_lead")}</p>
      </header>

      <div className="admin-toolbar">
        <input
          type="email"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="email@example.com"
        />
        <button
          type="button"
          className="admin-btn is-seal"
          disabled={busy}
          onClick={() => void add()}
        >
          + {t("admin_add")}
        </button>
        <button type="button" className="admin-btn" onClick={() => void load()}>
          {t("admin_refresh")}
        </button>
      </div>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      <ul className="admin-list">
        {emails.map((email) => (
          <li key={email} className="admin-list-row">
            <strong>{email}</strong>
            <button
              type="button"
              className="admin-btn is-danger"
              disabled={busy}
              onClick={() => void remove(email)}
            >
              {t("admin_delete")}
            </button>
          </li>
        ))}
        {emails.length === 0 && (
          <li className="admin-empty">{t("admin_cms_empty")}</li>
        )}
      </ul>
    </div>
  );
}
