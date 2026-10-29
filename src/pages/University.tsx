import { useMemo, useState } from "react";
import { AppLink } from "../components/AppLink";
import { ConsultForm } from "../components/ConsultForm";
import { CITY_LABELS, universities } from "../data/universities";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { UniversityCard } from "../components/UniversityCard";
import { useI18n } from "../i18n/I18nContext";

const steps = [
  ["step1", "step1_d"],
  ["step2", "step2_d"],
  ["step3", "step3_d"],
  ["step4", "step4_d"],
] as const;

const faqs = [
  ["faq1_q", "faq1_a"],
  ["faq2_q", "faq2_a"],
  ["faq3_q", "faq3_a"],
  ["faq4_q", "faq4_a"],
] as const;

const compareRows = [
  ["cmp_lang", "cmp_c1", "cmp_p1"],
  ["cmp_cost", "cmp_c2", "cmp_p2"],
  ["cmp_visa", "cmp_c3", "cmp_p3"],
  ["cmp_degree", "cmp_c4", "cmp_p4"],
] as const;

export function University() {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  // English name, Chinese name or city (any language) all match.
  const listed = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return universities;
    return universities.filter((u) => {
      const city = u.city ? Object.values(CITY_LABELS[u.city] ?? {}).join(" ") : "";
      return `${u.name} ${u.zh ?? ""} ${u.city ?? ""} ${city}`.toLowerCase().includes(query);
    });
  }, [q]);

  const hasQuery = q.trim().length > 0;

  return (
    <PageShell className="page-uni is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("nav_uni")}</h1>
          <p className="lead desk-only">{t("uni_lead")}</p>
        </Reveal>
      </header>

      {/* The academy's universities as cards (A–Z); the search filters them. */}
      <section className="section tight uni-schools-section">
        <Reveal>
          <div className="ios-toolbar">
            <label className="ios-search">
              <span aria-hidden>⌕</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_uni")}
                autoComplete="off"
              />
              {hasQuery && (
                <button
                  type="button"
                  className="ios-search-clear"
                  onClick={() => setQ("")}
                  aria-label={t("news_clear")}
                >
                  ×
                </button>
              )}
            </label>
          </div>
        </Reveal>

        <Reveal>
          <div className="ios-section-head">
            <h2>{t("uni_list_title")}</h2>
            <em>{listed.length}</em>
          </div>
          <p className="uni-list-lead">{t("uni_list_lead")}</p>
        </Reveal>

        {listed.length === 0 ? (
          <p className="ios-empty">{t("uni_list_empty")}</p>
        ) : (
          <Stagger className="uni-tiles">
            {listed.map((u) => (
              <StaggerItem key={u.slug}>
                <UniversityCard university={u} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="section tight app-mobile">
        <Reveal>
          <AppLink to="/university/china" className="uni-enroll-teaser">
            <div>
              <strong>{t("uni_enroll_title")}</strong>
              <em>
                {t("uni_enroll_now")} · {t("uni_status_open")}
              </em>
            </div>
            <span aria-hidden>›</span>
          </AppLink>
        </Reveal>
      </section>

      <section className="section tight section-last app-mobile">
        <Reveal>
          <AppLink to="/enroll?interest=consult&uni=china" className="ios-cta">
            {t("uni_enroll_cta")}
          </AppLink>
        </Reveal>
      </section>

      <section className="section desk-only">
        <Reveal>
          <h2 className="h2">{t("steps_title")}</h2>
        </Reveal>
        <Stagger className="steps-grid">
          {steps.map(([title, desc], i) => (
            <StaggerItem key={title}>
              <div className="step-card">
                <span className="step-num">0{i + 1}</span>
                <h3>{t(title)}</h3>
                <p>{t(desc)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section desk-only">
        <Reveal>
          <h2 className="h2">{t("compare_title")}</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="compare-table" role="table">
            <div className="compare-row compare-head" role="row">
              <span role="columnheader" />
              <span role="columnheader">{t("china")}</span>
              <span role="columnheader">{t("poland")}</span>
            </div>
            {compareRows.map(([label, c, p]) => (
              <div key={label} className="compare-row" role="row">
                <span role="rowheader">{t(label)}</span>
                <span role="cell">{t(c)}</span>
                <span role="cell">{t(p)}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section desk-only">
        <Reveal>
          <h2 className="h2">{t("faq_title")}</h2>
        </Reveal>
        <Stagger className="faq-list">
          {faqs.map(([qKey, a]) => (
            <StaggerItem key={qKey}>
              <details className="faq-item">
                <summary>{t(qKey)}</summary>
                <p>{t(a)}</p>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section section-last uni-form-wrap desk-only">
        <Reveal>
          <ConsultForm />
        </Reveal>
      </section>
    </PageShell>
  );
}
