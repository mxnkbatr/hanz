import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { type EnrollmentRow } from "../../lib/cms";
import { useI18n } from "../../i18n/I18nContext";
import { ADMIN_HUB_GROUPS, ADMIN_QUICK_ADD } from "../../lib/adminNav";

function inLastMs(iso: string, ms: number) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= ms;
}

export function AdminDashboard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    void supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(400)
      .then(({ data, error }) => {
        if (error) {
          setErr(error.message);
          return;
        }
        setRows((data as EnrollmentRow[]) ?? []);
      });
  }, []);

  const stats = useMemo(() => {
    const day = 86400000;
    const today = rows.filter((r) => inLastMs(r.created_at, day)).length;
    const week = rows.filter((r) => inLastMs(r.created_at, day * 7)).length;
    const month = rows.filter((r) => inLastMs(r.created_at, day * 30)).length;
    const neu = rows.filter((r) => (r.status || "new") === "new").length;
    return { today, week, month, neu, total: rows.length };
  }, [rows]);

  const recent = rows.slice(0, 6);

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_dash")}</h1>
        <p>{t("admin_dash_lead")}</p>
      </header>

      {err && <p className="admin-err">{err}</p>}

      <div className="admin-stats">
        <article>
          <em>{t("admin_stat_today")}</em>
          <strong>{stats.today}</strong>
        </article>
        <article>
          <em>{t("admin_stat_week")}</em>
          <strong>{stats.week}</strong>
        </article>
        <article>
          <em>{t("admin_stat_month")}</em>
          <strong>{stats.month}</strong>
        </article>
        <article className="is-accent">
          <em>{t("admin_stat_new")}</em>
          <strong>{stats.neu}</strong>
        </article>
      </div>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>{t("admin_quick_add")}</h2>
          <p>{t("admin_quick_add_d")}</p>
        </div>
        <div className="admin-quick-grid">
          {ADMIN_QUICK_ADD.map((item) => (
            <Link
              key={item.id}
              to={`${item.to}?new=1`}
              className="admin-quick-card"
            >
              <span className="admin-quick-ico" aria-hidden>
                {item.ico}
              </span>
              <strong>
                + {t(item.key)}
              </strong>
              <em>{t("admin_add")}</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head row">
          <div>
            <h2>{t("admin_recent_leads")}</h2>
            <p>
              {stats.neu > 0
                ? `${stats.neu} ${t("admin_stat_new").toLowerCase()}`
                : t("admin_empty_leads")}
            </p>
          </div>
          <Link to="/admin/leads" className="admin-btn is-seal">
            {t("admin_all_leads")}
          </Link>
        </div>

        <div className="admin-rn-list admin-dash-leads">
          {recent.length === 0 ? (
            <p className="admin-empty">{t("admin_empty_leads")}</p>
          ) : (
            recent.map((r) => (
              <Link
                key={r.id}
                to="/admin/leads"
                className="admin-rn-card admin-dash-lead"
              >
                <span className="admin-rn-card-main">
                  <strong>{r.name}</strong>
                  <em>
                    {r.phone} · {r.interest}
                  </em>
                </span>
                <span className={`admin-badge is-${r.status || "new"}`}>
                  {t(`admin_status_${r.status || "new"}`)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>{t("admin_cms")}</h2>
          <p>{t("admin_group_content_d")}</p>
        </div>
        <div className="admin-map-grid">
          {ADMIN_HUB_GROUPS.map((g) => (
            <div key={g.id} className="admin-map-card">
              <h3>{t(g.titleKey)}</h3>
              <p>{t(g.hintKey)}</p>
              <ul>
                {g.items.map((item) => (
                  <li key={item.id}>
                    <Link to={item.to}>
                      <span aria-hidden>{item.ico}</span>
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
