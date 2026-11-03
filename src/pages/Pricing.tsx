import { Link } from "react-router-dom";
import { PageShell, Reveal } from "../components/PageShell";
import { formatPrice, hskFees } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";

/** Fees and class hours ("Үнэ / Төлбөр" in the academy's page copy). */
export function Pricing() {
  const { t, lang } = useI18n();
  const { coursesLive } = useSiteContent();
  const levels = coursesLive.filter((c) => c.level);

  return (
    <PageShell className="page-pricing">
      <header className="page-head">
        <Reveal>
          <p className="eyebrow">{t("nav_pricing")}</p>
          <h1 className="h1">{t("pricing_title")}</h1>
          <p className="lead">{t("pricing_lead")}</p>
        </Reveal>
      </header>

      <section className="section tight">
        <Reveal>
          <table className="price-table">
            <thead>
              <tr>
                <th scope="col">{t("pricing_col_course")}</th>
                <th scope="col">{t("pricing_col_time")}</th>
                <th scope="col">{t("pricing_col_fee")}</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((c) => (
                <tr key={c.id}>
                  <th scope="row">
                    <Link to={`/courses/${c.id}`}>{loc(lang, t, c.title, c.titleKey)}</Link>
                  </th>
                  <td>{t("course_unit")}</td>
                  <td>{formatPrice(hskFees.month)}</td>
                </tr>
              ))}
              <tr className="is-long">
                <th scope="row">{t("course_6m_t")}</th>
                <td>{t("course_6m_time")}</td>
                <td>{formatPrice(hskFees.sixMonth)}</td>
              </tr>
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="section tight section-last">
        <Reveal>
          <h2 className="h2">{t("schedule_title")}</h2>
          <ul className="price-schedule">
            <li>{t("sched_days")}</li>
            <li>{t("sched_hours")}</li>
            <li>{t("sched_level")}</li>
          </ul>
          <Link to="/enroll?interest=hsk" className="btn btn-seal">
            <span>{t("register_cta")}</span>
          </Link>
        </Reveal>
      </section>
    </PageShell>
  );
}
