import { useMemo, useState } from "react";
import { AppLink } from "../components/AppLink";
import { IosFilterBar } from "../components/IosFilterBar";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";

type TravelFilter = "all" | "travel_tag_tour" | "travel_tag_europe";

const FILTERS: TravelFilter[] = [
  "all",
  "travel_tag_tour",
  "travel_tag_europe",
];

export function Travel() {
  const { t, lang } = useI18n();
  const { travelLive } = useSiteContent();
  const [filter, setFilter] = useState<TravelFilter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: travelLive.length };
    for (const p of travelLive) {
      map[p.tagKey] = (map[p.tagKey] || 0) + 1;
    }
    return map;
  }, [travelLive]);

  const options = useMemo(
    () =>
      FILTERS.map((f) => ({
        id: f,
        label: f === "all" ? t("filter_all") : t(f),
        count: counts[f] ?? 0,
      })),
    [counts, t],
  );

  const list = useMemo(() => {
    const base =
      filter === "all"
        ? travelLive
        : travelLive.filter((p) => p.tagKey === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((p) => {
      const hay =
        `${loc(lang, t, p.title, p.titleKey)} ${loc(lang, t, p.body, p.descKey)} ${loc(lang, t, p.tag, p.tagKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [filter, q, t, lang, travelLive]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = filter !== "all" || hasQuery;

  return (
    <PageShell className="page-travel is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow desk-only">{t("nav_travel")}</p>
          <h1 className="h1">{t("travel_page")}</h1>
          <p className="lead desk-only">{t("travel_lead")}</p>
        </Reveal>
      </header>

      <Reveal>
        <div className="ios-toolbar">
          <label className="ios-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_travel")}
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
            value={filter}
            onChange={(id) => setFilter(id as TravelFilter)}
            ariaLabel={t("travel_filter_label")}
            layoutId="travel-filter-pill"
            showClear={isFiltered}
            clearLabel={t("news_clear")}
            onClear={() => {
              setFilter("all");
              setQ("");
            }}
          />
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          <p className="ios-empty">{t("empty_travel")}</p>
        ) : (
          <Stagger className="ios-feed ios-feed-stack travel-desk-grid">
            {list.map((p) => (
              <StaggerItem key={p.id}>
                <AppLink
                  to={`/travel/${p.id}`}
                  className="ios-card ios-travel-card"
                  onClick={() => void hapticLight()}
                >
                  <div className="ios-card-media ios-travel-media">
                    <SharedMedia
                      id={`travel-${p.id}`}
                      src={p.image}
                      alt={loc(lang, t, p.title, p.titleKey)}
                    />
                    <span className="ios-badge ios-badge-soft">
                      {loc(lang, t, p.tag, p.tagKey)}
                    </span>
                  </div>
                  <div className="ios-card-body">
                    <h3>{loc(lang, t, p.title, p.titleKey)}</h3>
                    <p className="ios-card-desc">
                      {loc(lang, t, p.body, p.descKey)}
                    </p>
                    <ul className="ios-card-points">
                      {p.highlights.slice(0, 2).map((h) => (
                        <li key={h}>{t(h)}</li>
                      ))}
                    </ul>
                    <span className="ios-card-cta">
                      {t("view")} <i aria-hidden>→</i>
                    </span>
                  </div>
                </AppLink>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </PageShell>
  );
}
