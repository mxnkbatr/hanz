import { useMemo, useState } from "react";
import { AppLink } from "../components/AppLink";
import { CITY_LABELS, cityLabel, universities, type University } from "../data/universities";
import { IosFilterBar } from "../components/IosFilterBar";
import { useDesktop } from "../hooks/useDesktop";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { UniversityCard } from "../components/UniversityCard";
import { useI18n } from "../i18n/I18nContext";
import { AbroadMobile } from "../components/AbroadMobile";

/** City chips: every city with at least three schools, biggest first. */
const CITY_CHIPS = Object.entries(
  universities.reduce<Record<string, number>>((acc, u) => {
    if (u.city) acc[u.city] = (acc[u.city] ?? 0) + 1;
    return acc;
  }, {}),
)
  .filter(([, n]) => n >= 3)
  .sort((a, b) => b[1] - a[1]);

/** Phones get the app's "Зуучлал" tab; desktop keeps the full page. */
export function University() {
  const desktop = useDesktop();
  return desktop ? <UniversityDesktop /> : <AbroadMobile />;
}

function UniversityDesktop() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");

  const listed = useMemo(() => {
    const query = q.trim().toLowerCase();
    const inCity = city === "all" ? universities : universities.filter((u) => u.city === city);
    if (!query) return inCity;
    return inCity.filter((u) => {
      const names = u.city ? Object.values(CITY_LABELS[u.city] ?? {}).join(" ") : "";
      return `${u.name} ${u.zh ?? ""} ${u.city ?? ""} ${names}`.toLowerCase().includes(query);
    });
  }, [q, city]);

  const hasQuery = q.trim().length > 0;

  return (
    <PageShell className="page-uni is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("ab_title")}</h1>
          <div className="uni-head-actions">
            <AppLink to="/university/china" className="text-link">
              {t("country_cn")} <i aria-hidden>→</i>
            </AppLink>
            <AppLink to="/university/poland" className="text-link">
              {t("country_pl")} <i aria-hidden>→</i>
            </AppLink>
          </div>
        </Reveal>
      </header>

      <Reveal>
        <AppLink
          to="/enroll?interest=university"
          className="course-match glass-panel course-match-compact is-intro uni-desk-cta"
        >
          <span className="course-match-compact-row">
            <span className="course-match-mark" aria-hidden>
              咨
            </span>
            <span className="course-match-compact-copy">
              <strong>{t("ab_help")}</strong>
            </span>
            <span className="btn btn-seal course-match-start-mini">
              <span>{t("ab_book_t")}</span>
            </span>
          </span>
        </AppLink>
      </Reveal>

      <section className="section tight uni-schools-section section-last">
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
              options={[
                { id: "all", label: t("filter_all") },
                ...CITY_CHIPS.map(([id]) => ({
                  id,
                  label: cityLabel({ city: id } as University, lang),
                })),
              ]}
              value={city}
              onChange={setCity}
              ariaLabel={t("uni_city")}
              layoutId="uni-city-pill"
            />
          </div>
        </Reveal>

        <Reveal>
          <div className="ios-section-head">
            <h2>{t("ab_unis")}</h2>
          </div>
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
    </PageShell>
  );
}
