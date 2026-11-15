import { Link, Navigate, useParams } from "react-router-dom";
import { getTravelById, uniEnrollStatusKey } from "../data/content";
import { EnrollDock } from "../components/EnrollDock";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useDesktop } from "../hooks/useDesktop";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import type { TravelLive } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { PhotoGlow } from "../components/PhotoGlow";
import { hapticLight } from "../lib/native";

export function TravelDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const desktop = useDesktop();
  const { travelLive } = useSiteContent();
  const pack = (travelLive.find((x) => x.id === id) ??
    getTravelById(id)) as TravelLive | undefined;

  if (!pack) return <Navigate to="/travel" replace />;

  const meta = getTravelById(pack.id);
  const windows = pack.enrollWindows ?? meta?.enrollWindows ?? [];
  const other = travelLive.find((x) => x.id !== pack.id);
  const interest = pack.id === "china" ? "travel_china" : "travel_poland";
  const enrollTo = `/enroll?interest=${interest}`;
  const hasOpen = windows.some((w) => w.status === "open");

  const title = loc(lang, t, pack.title, pack.titleKey);
  const tag = loc(lang, t, pack.tag, pack.tagKey);
  const lead = loc(lang, t, pack.duration, pack.descKey);
  const bodyText = loc(lang, t, pack.body, pack.bodyKey);
  const paragraphs = bodyText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const otherTitle = other
    ? loc(lang, t, other.title, other.titleKey)
    : "";

  return (
    <PageShell
      className={`page-detail page-travel is-app ios-app${desktop ? "" : " has-enroll-dock"}`}
    >
      <Reveal>
        <Link to="/travel" className="text-link back-link app-mobile">
          ← {t("back")}
        </Link>
      </Reveal>

      <PhotoGlow src={pack.image} />
      <article className="app-detail">
        <Reveal className="app-detail-media">
          <div className="app-detail-hero">
            <SafeImage src={pack.image} alt={title} loading="eager" />
            <Link to="/travel" className="cd-back detail-desk-back" aria-label={t("back")}>
              ←
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="app-detail-body">
            <div className="app-detail-topline">
              <p className="app-pill">{tag}</p>
              {hasOpen && (
                <span className="uni-enroll-status is-open">
                  {t("uni_status_open")}
                </span>
              )}
            </div>

            <h1 className="h1">{title}</h1>
            {lead && <p className="app-sub">{lead}</p>}

            <div className="uni-detail-copy">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 28)}>{p}</p>
              ))}
            </div>

            {pack.highlights?.length > 0 && (
              <section className="travel-desk-block">
                <h2 className="desk-detail-label">{t("detail_more")}</h2>
                <ul className="travel-desk-points">
                  {pack.highlights.map((h) => (
                    <li key={h}>{t(h)}</li>
                  ))}
                </ul>
              </section>
            )}

            {windows.length > 0 && (
              <section
                className="travel-desk-block"
                aria-labelledby="travel-enroll-title"
              >
                <div className="uni-enroll-head">
                  <h2 id="travel-enroll-title" className="desk-detail-label">
                    {t("travel_enroll_title")}
                  </h2>
                  <p>{t("travel_enroll_lead")}</p>
                </div>
                <ul className="uni-enroll-list">
                  {windows.map((w) => (
                    <li
                      key={w.id}
                      className={`uni-enroll-row is-${w.status}`}
                    >
                      <div className="uni-enroll-row-main">
                        <strong>{t(w.labelKey)}</strong>
                        <em>{t(w.dateKey)}</em>
                      </div>
                      <span className={`uni-enroll-status is-${w.status}`}>
                        {t(uniEnrollStatusKey(w.status))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="desk-detail-actions travel-desk-cta">
              <Link
                to={enrollTo}
                className="btn btn-seal"
                onClick={() => void hapticLight()}
              >
                <span>{t("uni_enroll_cta")}</span>
              </Link>
              <span className="travel-desk-cta-status">
                {hasOpen ? t("uni_status_open") : t("uni_status_soon")}
              </span>
            </div>
          </div>
        </Reveal>
      </article>

      {other && (
        <Reveal delay={0.08}>
          <Link
            to={`/travel/${other.id}`}
            className="app-row app-row-media app-related travel-desk-related"
          >
            <span className="app-row-thumb">
              <SafeImage src={other.image} alt="" />
            </span>
            <span className="app-row-body">
              <strong>{otherTitle}</strong>
              <em>{t("related")}</em>
            </span>
            <span className="app-row-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </Reveal>
      )}

      {!desktop && (
        <EnrollDock
          title={t("travel_cta")}
          status={hasOpen ? t("uni_status_open") : t("uni_status_soon")}
          to={enrollTo}
          cta={t("uni_enroll_cta")}
        />
      )}
    </PageShell>
  );
}
