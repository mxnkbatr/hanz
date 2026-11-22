import { useMemo, useState } from "react";
import { type NewsTag } from "../data/content";
import { AppLink } from "../components/AppLink";
import { IosFilterBar } from "../components/IosFilterBar";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";
import { PageBanner } from "../components/PageBanner";

const filters: NewsTag[] = ["all", "tag_study", "tag_course", "tag_academy"];

function isNew(date: string) {
  return date.startsWith("2026");
}

export function News() {
  const { t, lang } = useI18n();
  const { newsLive } = useSiteContent();
  const [filter, setFilter] = useState<NewsTag>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: newsLive.length };
    for (const n of newsLive) {
      map[n.tagKey] = (map[n.tagKey] || 0) + 1;
    }
    return map;
  }, [newsLive]);

  const options = useMemo(
    () =>
      filters.map((f) => ({
        id: f,
        label: f === "all" ? t("filter_all") : t(f),
        count: counts[f] ?? 0,
      })),
    [counts, t],
  );

  const list = useMemo(() => {
    const base =
      filter === "all" ? newsLive : newsLive.filter((n) => n.tagKey === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((n) => {
      const hay =
        `${loc(lang, t, n.title, n.titleKey)} ${loc(lang, t, n.excerpt, n.excerptKey)} ${loc(lang, t, n.tag, n.tagKey)}`.toLowerCase();
      return hay.includes(query);
    });
  }, [filter, q, t, lang, newsLive]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = filter !== "all" || hasQuery;

  return (
    <PageShell className="page-news is-app ios-app">
      <PageBanner eyebrow={t("pb_brand")} title={t("news_title")} lead={t("news_lead")} image="/images/news-scholarship.webp" />
      <header className="page-head app-head has-banner">
        <Reveal>
          <p className="eyebrow desk-only">{t("nav_news")}</p>
          <h1 className="h1">{t("news_title")}</h1>
          <p className="lead desk-only">{t("news_lead")}</p>
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
              placeholder={t("search_news")}
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
            onChange={(id) => setFilter(id as NewsTag)}
            ariaLabel={t("news_filter_label")}
            layoutId="news-filter-pill"
            showClear={isFiltered}
            clearLabel={t("news_clear")}
            onClear={() => {
              setFilter("all");
              setQ("");
            }}
          />

          <p className="ios-result-meta desk-only">
            {t("results_count")}: <strong>{list.length}</strong>
          </p>
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          <p className="ios-empty">{t("empty_filter")}</p>
        ) : (
          <Stagger className="ios-feed ios-feed-news">
            {list.map((item) => {
              const title = loc(lang, t, item.title, item.titleKey);
              const excerpt = loc(lang, t, item.excerpt, item.excerptKey);
              const tag = loc(lang, t, item.tag, item.tagKey);
              return (
                <StaggerItem key={item.id}>
                  <AppLink
                    to={`/medee/${item.id}`}
                    className="ios-card"
                    onClick={() => void hapticLight()}
                  >
                    <div className="ios-card-media">
                      <SharedMedia
                        id={`news-${item.id}`}
                        src={item.image}
                        alt={title}
                      />
                      {isNew(item.date) && (
                        <em className="ios-badge">{t("badge_new")}</em>
                      )}
                    </div>
                    <div className="ios-card-body">
                      <span className="ios-meta">
                        {tag} · {item.date}
                      </span>
                      <h3>{title}</h3>
                      <p className="ios-card-desc">{excerpt}</p>
                    </div>
                  </AppLink>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>
    </PageShell>
  );
}
