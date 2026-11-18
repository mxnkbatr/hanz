import { Link, Navigate, useParams } from "react-router-dom";
import { getNewsById } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { SharedMedia } from "../components/SharedMedia";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import type { NewsLive } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { toDateTime } from "../lib/date";
import { PhotoGlow } from "../components/PhotoGlow";
import { ShareButton } from "../components/ShareButton";
import { shortCode } from "../lib/shortCode";

export function NewsDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const { newsLive } = useSiteContent();
  const item = (newsLive.find((n) => n.id === id) ??
    getNewsById(id)) as NewsLive | undefined;

  if (!item) return <Navigate to="/medee" replace />;

  const related = newsLive.filter((n) => n.id !== item.id).slice(0, 3);
  const title = loc(lang, t, item.title, item.titleKey);
  const excerpt = loc(lang, t, item.excerpt, item.excerptKey);
  const tag = loc(lang, t, item.tag, item.tagKey);
  const bodyText = loc(lang, t, item.body, item.bodyKey);
  const paragraphs = bodyText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell className="page-detail page-news is-app ios-app">
      <div className="news-desk-shell">
        <Reveal>
          <Link to="/medee" className="text-link back-link app-mobile">
            ← {t("back")}
          </Link>
        </Reveal>

        <PhotoGlow src={item.image} />
        <article className="desk-article">
          <Reveal>
            <div className="desk-article-hero">
              <SharedMedia
                id={`news-${item.id}`}
                src={item.image}
                alt={title}
                loading="eager"
              />
              <Link to="/medee" className="cd-back detail-desk-back" aria-label={t("back")}>
                ←
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="desk-article-body">
              <p className="app-pill">
                {tag} ·{" "}
                <time dateTime={toDateTime(item.date)}>{item.date}</time>
              </p>
              <h1 className="h1">{title}</h1>
              <ShareButton shortPath={`/m/${shortCode(item.id)}`} title={title} text={excerpt} />
              {excerpt ? <p className="app-sub desk-article-lead">{excerpt}</p> : null}
              <div className="desk-article-copy">
                {paragraphs.map((p) => (
                  <p key={p.slice(0, 28)}>{p}</p>
                ))}
              </div>
            </div>
          </Reveal>
        </article>

        {related.length > 0 && (
          <section className="section tight section-last related-block">
            <Reveal>
              <h2 className="desk-detail-label">{t("related")}</h2>
            </Reveal>
            <Stagger className="app-list app-mobile">
              {related.map((n) => (
                <StaggerItem key={n.id}>
                  <Link to={`/medee/${n.id}`} className="app-row app-row-media">
                    <span className="app-row-thumb">
                      <SafeImage src={n.image} alt="" />
                    </span>
                    <span className="app-row-body">
                      <strong>{loc(lang, t, n.title, n.titleKey)}</strong>
                      <em>{loc(lang, t, n.tag, n.tagKey)}</em>
                    </span>
                    <span className="app-row-chevron" aria-hidden>
                      ›
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>

            <Stagger className="news-grid desk-only">
              {related.map((n) => (
                <StaggerItem key={n.id}>
                  <Link to={`/medee/${n.id}`} className="news-card">
                    <div className="news-card-media">
                      <SafeImage src={n.image} alt={loc(lang, t, n.title, n.titleKey)} />
                    </div>
                    <div className="news-card-body">
                      <div className="news-meta">
                        <span>{loc(lang, t, n.tag, n.tagKey)}</span>
                        <time dateTime={toDateTime(n.date)}>{n.date}</time>
                      </div>
                      <h3>{loc(lang, t, n.title, n.titleKey)}</h3>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </div>
    </PageShell>
  );
}
