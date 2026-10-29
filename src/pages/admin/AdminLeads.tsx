import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { type EnrollmentRow, type LeadStatus } from "../../lib/cms";
import { useI18n } from "../../i18n/I18nContext";
import { hapticLight } from "../../lib/native";
import { formatPrice } from "../../data/content";
import { hskLevelChoices, kidsLevelChoices, programs } from "../../data/enroll";

const statuses: LeadStatus[] = [
  "new",
  "contacted",
  "placed",
  "paid",
  "enrolled",
  "declined",
  "done",
  "spam",
];
const levelChoices = [...hskLevelChoices, ...kidsLevelChoices];
const PAGE = 50;

/** Older leads say "classroom" / "hsk"; they now belong to the intensive class. */
function programOf(interest: string) {
  return interest === "classroom" || interest === "hsk" ? "intensive" : interest;
}

export function AdminLeads() {
  const { t } = useI18n();
  const choiceLabel = (key: string) => (key.startsWith("HSK ") ? key : t(key));
  const programLabel = (interest: string) => {
    const p = programs.find((x) => x.id === programOf(interest));
    return p ? t(p.labelKey) : interest;
  };
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [kind, setKind] = useState<"all" | "course" | "travel" | "consult">(
    "all",
  );
  const [q, setQ] = useState("");
  const [program, setProgram] = useState("all");
  const [level, setLevel] = useState("all");
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
      if (program !== "all" && programOf(r.interest) !== program) return false;
      if (level !== "all" && (r.hsk_level || "") !== level) return false;
      const created = new Date(r.created_at).getTime();
      if (fromTs != null && created < fromTs) return false;
      if (toTs != null && created > toTs) return false;
      if (!query) return true;
      return `${r.name} ${r.phone} ${r.interest} ${r.message || ""} ${r.child_age || ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [rows, filter, kind, program, level, q, from, to]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rows) map[r.status || "new"] = (map[r.status || "new"] || 0) + 1;
    return map;
  }, [rows]);

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
      "child_name",
      "level",
      "schedule",
      "plan",
      "plan_price",
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
          r.child_name || "",
          r.hsk_level || "",
          r.schedule || "",
          r.plan || "",
          r.plan_price ?? "",
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
        <select
          value={program}
          onChange={(e) => {
            setProgram(e.target.value);
            setPage(0);
          }}
          aria-label={t("admin_filter_program")}
        >
          <option value="all">{t("admin_filter_program")}</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {t(p.labelKey)}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(0);
          }}
          aria-label={t("admin_filter_level")}
        >
          <option value="all">{t("admin_filter_level")}</option>
          {levelChoices.map((c) => (
            <option key={c.id} value={c.id}>
              {choiceLabel(c.labelKey)}
            </option>
          ))}
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
      {/* Pipeline at a glance; a chip filters by that status. */}
      <div className="admin-pipeline">
        {statuses
          .filter((s) => counts[s])
          .map((s) => (
            <button
              key={s}
              type="button"
              className={`admin-btn${filter === s ? " is-seal" : ""}`}
              onClick={() => {
                setFilter(filter === s ? "all" : s);
                setPage(0);
              }}
            >
              {t(`admin_status_${s}`)} · {counts[s]}
            </button>
          ))}
      </div>
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
              {programLabel(r.interest)}
              {r.child_age ? (
                <>
                  {" · "}
                  {t("form_child_age")}: {r.child_age}
                </>
              ) : null}
            </p>
            {(r.hsk_level || r.schedule || r.plan || r.child_name) && (
              <dl className="admin-lead-facts">
                {r.child_name && (
                  <div>
                    <dt>{t("admin_lead_child")}</dt>
                    <dd>{r.child_name}</dd>
                  </div>
                )}
                {r.hsk_level && (
                  <div>
                    <dt>{t("admin_lead_level")}</dt>
                    <dd>{choiceLabel(levelChoices.find((c) => c.id === r.hsk_level)?.labelKey ?? r.hsk_level)}</dd>
                  </div>
                )}
                {r.schedule && (
                  <div>
                    <dt>{t("admin_lead_schedule")}</dt>
                    <dd>{t(`sch_${r.schedule}`)}</dd>
                  </div>
                )}
                {r.plan && (
                  <div>
                    <dt>{t("admin_lead_plan")}</dt>
                    <dd>
                      {t(`plan_${r.plan}`)}
                      {r.plan_price != null && ` · ${formatPrice(r.plan_price)}`}
                    </dd>
                  </div>
                )}
              </dl>
            )}
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
