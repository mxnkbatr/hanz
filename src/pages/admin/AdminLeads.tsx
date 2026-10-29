import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { type EnrollmentRow, type LeadStatus } from "../../lib/cms";
import { useI18n } from "../../i18n/I18nContext";
import { hapticLight } from "../../lib/native";

const statuses: LeadStatus[] = ["new", "contacted", "done", "spam"];
const PAGE = 50;

export function AdminLeads() {
  const { t } = useI18n();
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [kind, setKind] = useState<"all" | "course" | "travel" | "consult">(
    "all",
  );
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((data as EnrollmentRow[]) ?? []);
    setErr("");
  };

  useEffect(() => {
    void load();
  }, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86400000 - 1 : null;
    return rows.filter((r) => {
      if (filter !== "all" && (r.status || "new") !== filter) return false;
      if (kind !== "all" && r.kind !== kind) return false;
      const created = new Date(r.created_at).getTime();
      if (fromTs != null && created < fromTs) return false;
      if (toTs != null && created > toTs) return false;
      if (!query) return true;
      return `${r.name} ${r.phone} ${r.interest} ${r.message || ""} ${r.child_age || ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [rows, filter, kind, q, from, to]);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE));
  const pageSafe = Math.min(page, pageCount - 1);
  const pageRows = list.slice(pageSafe * PAGE, pageSafe * PAGE + PAGE);

  async function patch(
    id: string,
    patch: Partial<Pick<EnrollmentRow, "status" | "admin_note">>,
  ) {
    setBusyId(id);
    void hapticLight();
    const { error } = await supabase
      .from("enrollments")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBusyId("");
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  async function remove(id: string) {
    if (!confirm(t("admin_delete_confirm"))) return;
    setBusyId(id);
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    setBusyId("");
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function exportCsv() {
    const header = [
      "created_at",
      "name",
      "phone",
      "kind",
      "interest",
      "child_age",
      "status",
      "message",
      "admin_note",
    ];
    const lines = [
      header.join(","),
      ...list.map((r) =>
        [
          r.created_at,
          r.name,
          r.phone,
          r.kind,
          r.interest,
          r.child_age || "",
          r.status || "new",
          (r.message || "").replace(/"/g, "'"),
          (r.admin_note || "").replace(/"/g, "'"),
        ]
          .map((c) => `"${c}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hanz-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_leads")}</h1>
        <p>{t("admin_leads_lead")}</p>
      </header>

      <div className="admin-toolbar">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder={t("admin_search_leads")}
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as typeof filter);
            setPage(0);
          }}
        >
          <option value="all">{t("filter_all")}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {t(`admin_status_${s}`)}
            </option>
          ))}
        </select>
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as typeof kind);
            setPage(0);
          }}
        >
          <option value="all">{t("filter_all")}</option>
          <option value="course">{t("nav_courses")}</option>
          <option value="travel">{t("nav_travel")}</option>
          <option value="consult">{t("enroll_interest_consult")}</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(0);
          }}
          aria-label={t("admin_date_from")}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(0);
          }}
          aria-label={t("admin_date_to")}
        />
        <button type="button" className="admin-btn" onClick={() => void load()}>
          {t("admin_refresh")}
        </button>
        <button type="button" className="admin-btn is-seal" onClick={exportCsv}>
          {t("admin_export")}
        </button>
      </div>

      {err && <p className="admin-err">{err}</p>}
      <p className="admin-muted">
        {list.length} · {t("admin_page")} {pageSafe + 1}/{pageCount}
      </p>

      <div className="admin-leads">
        {pageRows.map((r) => (
          <article key={r.id} className="admin-lead-card">
            <div className="admin-lead-top">
              <div>
                <strong>{r.name}</strong>
                <em>
                  {new Date(r.created_at).toLocaleString()} · {r.kind}
                </em>
              </div>
              <select
                value={r.status || "new"}
                disabled={busyId === r.id}
                onChange={(e) =>
                  void patch(r.id, { status: e.target.value as LeadStatus })
                }
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {t(`admin_status_${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <p>
              <a href={`tel:${r.phone}`}>{r.phone}</a>
              {" · "}
              {r.interest}
              {r.child_age ? (
                <>
                  {" · "}
                  {t("form_child_age")}: {r.child_age}
                </>
              ) : null}
            </p>
            {r.message && <p className="admin-lead-msg">{r.message}</p>}
            <label className="admin-note">
              <span>{t("admin_note")}</span>
              <textarea
                defaultValue={r.admin_note || ""}
                rows={2}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next !== (r.admin_note || "")) {
                    void patch(r.id, { admin_note: next || null });
                  }
                }}
              />
            </label>
            <div className="admin-lead-actions">
              <a className="admin-btn" href={`tel:${r.phone}`}>
                {t("call")}
              </a>
              {(r.status || "new") === "new" && (
                <button
                  type="button"
                  className="admin-btn is-seal"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { status: "contacted" })}
                >
                  {t("admin_call_done")}
                </button>
              )}
              <button
                type="button"
                className="admin-btn is-danger"
                disabled={busyId === r.id}
                onClick={() => void remove(r.id)}
              >
                {t("admin_delete")}
              </button>
            </div>
          </article>
        ))}
        {list.length === 0 && (
          <p className="admin-empty">{t("admin_empty_leads")}</p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn"
            disabled={pageSafe <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ←
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={pageSafe >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
