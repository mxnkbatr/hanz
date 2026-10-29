import { useMemo, useState } from "react";
import { AppLink } from "../components/AppLink";
import { ConsultForm } from "../components/ConsultForm";
import { partnerUniversities } from "../data/content";
import { IosFilterBar } from "../components/IosFilterBar";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";

type UniCityFilter =
  | "all"
  | "map_beijing"
  | "map_chongqing"
  | "map_nanjing"
  | "map_chengdu";

const CITY_FILTERS: UniCityFilter[] = [
  "all",
  "map_beijing",
  "map_chongqing",
  "map_nanjing",
  "map_chengdu",
];

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
  const { t, lang } = useI18n();
  const { universitiesLive } = useSiteContent();
  const [q, setQ] = useState("");
  const [city, setCity] = useState<UniCityFilter>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: universitiesLive.length };
    for (const p of universitiesLive) {
      const key = p.cityKey || "all";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [universitiesLive]);

  const options = useMemo(
    () =>
      CITY_FILTERS.map((f) => ({
        id: f,
        label: f === "all" ? t("filter_all") : t(f),
        count: counts[f] ?? 0,
      })),
    [counts, t],
  );

  const schools = useMemo(() => {
    const byCity =
      city === "all"
        ? universitiesLive
        : universitiesLive.filter((p) => (p.cityKey || "") === city);
    const query = q.trim().toLowerCase();
    if (!query) return byCity;
    return byCity.filter((p) => {
      const hay =
        `${loc(lang, t, p.title, p.titleKey)} ${loc(lang, t, p.title, p.nameMnKey)} ${loc(lang, t, p.title, p.nameZhKey)} ${loc(lang, t, p.city, p.cityKey)} ${loc(lang, t, p.body, p.descKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [city, q, t, lang, universitiesLive]);

  const listed = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query
      ? partnerUniversities.filter((name) => name.toLowerCase().includes(query))
      : partnerUniversities;
  }, [q]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = city !== "all" || hasQuery;

  return (
    <PageShell className="page-uni is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("nav_uni")}</h1>
          <p className="lead desk-only">{t("uni_lead")}</p>
        </Reveal>
      </header>

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

            <IosFilterBar
              options={options}
              value={city}
              onChange={(id) => setCity(id as UniCityFilter)}
              ariaLabel={t("uni_filter_label")}
              layoutId="uni-filter-pill"
              showClear={isFiltered}
              clearLabel={t("news_clear")}
              onClear={() => {
                setCity("all");
                setQ("");
              }}
            />
          </div>
        </Reveal>

        <Reveal>
          <div className="ios-section-head">
            <h2>{t("uni_schools")}</h2>
            <em>{schools.length}</em>
          </div>
        </Reveal>

        {schools.length === 0 ? (
          <p className="ios-empty">{t("empty_uni")}</p>
        ) : (
          <Stagger className="ios-feed ios-feed-schools">
            {schools.map((p) => (
              <StaggerItem key={p.id}>
                <AppLink
                  to={`/university/${p.id}`}
                  className="ios-card"
                  onClick={() => void hapticLight()}
                >
                  <div className="ios-card-media">
                    <SafeImage
                      src={p.image}
                      alt={loc(lang, t, p.title, p.nameMnKey || p.titleKey)}
                    />
                    <span className="ios-badge ios-badge-soft">
                      {loc(lang, t, p.city, p.cityKey)}
                    </span>
                  </div>
                  <div className="ios-card-body">
                    <h3>{loc(lang, t, p.title, p.nameMnKey || p.titleKey)}</h3>
                    <p className="ios-card-sub">
                      {loc(lang, t, p.title, p.titleKey)}
                    </p>
                    <p className="ios-card-desc">
                      {loc(lang, t, p.body, p.descKey)}
                    </p>
                  </div>
                </AppLink>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      {/* Full A–Z list; the search box above filters it too. */}
      <section className="section tight uni-list-section">
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
          <ul className="uni-list">
            {listed.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
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
