import { Link, Navigate, useParams } from "react-router-dom";
import {
  getUniversityById,
  uniEnrollStatusKey,
  universitiesMeta,
} from "../data/content";
import { EnrollDock } from "../components/EnrollDock";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { mergeEnrollWindows } from "../lib/cms";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { PhotoGlow } from "../components/PhotoGlow";

export function UniversityDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const { universitiesLive, bundle } = useSiteContent();

  const track = getUniversityById(id);
  const school = universitiesLive.find((x) => x.id === id);

  if (!track && !school) return <Navigate to="/university" replace />;

  /* ── Country track (china / poland) ── */
  if (track) {
    const other = universitiesMeta.find((x) => x.id !== track.id);
    const windows =
      mergeEnrollWindows(bundle, "university", track.id) ??
      track.enrollWindows;
    const hasOpen = windows.some((w) => w.status === "open");
    const enrollTo = `/enroll?interest=consult&uni=${track.id}`;
    const bodyParas = t(track.bodyKey)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <PageShell className="page-detail page-uni is-app ios-app has-enroll-dock">
        <Reveal>
          <Link to="/university" className="text-link back-link">
            ← {t("back")}
          </Link>
        </Reveal>

        <PhotoGlow src={track.image} />
        <article className="app-detail">
          <Reveal>
            <div className="app-detail-hero">
              <SafeImage
                src={track.image}
                alt={t(track.titleKey)}
                loading="eager"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="app-detail-body">
              <div className="app-detail-topline">
                <p className="app-pill">{t(track.countryKey)}</p>
                {hasOpen && (
                  <span className="uni-enroll-status is-open">
                    {t("uni_status_open")}
                  </span>
                )}
              </div>
              <h1 className="h1">{t(track.titleKey)}</h1>
              <p className="app-sub">{t(track.descKey)}</p>

              <ul className="app-chips">
                {track.points.map((p) => (
                  <li key={p}>{t(p)}</li>
                ))}
              </ul>

              {bodyParas.length > 0 && (
                <div className="uni-detail-copy">
                  {bodyParas.map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>
              )}

              <section className="uni-enroll" aria-labelledby="uni-enroll-title">
                <div className="uni-enroll-head">
                  <h2 id="uni-enroll-title">{t("uni_enroll_title")}</h2>
                  <p>{t("uni_enroll_lead")}</p>
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
            </div>
          </Reveal>
        </article>

        {other && (
          <Reveal delay={0.08}>
            <Link
              to={`/university/${other.id}`}
              className="app-row app-row-media app-related"
            >
              <span className="app-row-thumb">
                <SafeImage src={other.image} alt="" />
              </span>
              <span className="app-row-body">
                <strong>{t(other.titleKey)}</strong>
                <em>{t("related")}</em>
              </span>
              <span className="app-row-chevron" aria-hidden>
                ›
              </span>
            </Link>
          </Reveal>
        )}

        <EnrollDock
          title={hasOpen ? t("uni_enroll_cta") : t("uni_cta")}
          status={hasOpen ? t("uni_status_open") : t("uni_status_soon")}
          to={enrollTo}
          cta={t("uni_enroll_cta")}
        />
      </PageShell>
    );
  }

  /* ── Individual school program (bjfu, cq, …) ── */
  const schoolTitle = loc(
    lang,
    t,
    school!.title,
    school!.nameMnKey || school!.titleKey,
  );
  const schoolSub = loc(lang, t, school!.title, school!.titleKey);
  const schoolCity = loc(lang, t, school!.city, school!.cityKey);
  const schoolBody = loc(lang, t, school!.body, school!.descKey);
  const bodyParas = schoolBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const enrollTo = `/enroll?interest=consult&uni=china&school=${school!.id}`;

  return (
    <PageShell className="page-detail page-uni is-app ios-app has-enroll-dock">
      <Reveal>
        <Link to="/university" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <PhotoGlow src={school!.image} />
      <article className="app-detail">
        <Reveal>
          <div className="app-detail-hero">
            <SafeImage
              src={school!.image}
              alt={schoolTitle}
              loading="eager"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="app-detail-body">
            <div className="app-detail-topline">
              {schoolCity && <p className="app-pill">{schoolCity}</p>}
            </div>
            <h1 className="h1">{schoolTitle}</h1>
            {schoolSub && schoolSub !== schoolTitle && (
              <p className="app-sub">{schoolSub}</p>
            )}
            {bodyParas.length > 0 && (
              <div className="uni-detail-copy">
                {bodyParas.map((p) => (
                  <p key={p.slice(0, 28)}>{p}</p>
                ))}
              </div>
            )}
            <Link to="/university/china" className="text-link">
              {t("china_title")} →
            </Link>
          </div>
        </Reveal>
      </article>

      <EnrollDock
        title={t("uni_enroll_cta")}
        status={t("uni_status_open")}
        to={enrollTo}
        cta={t("uni_enroll_cta")}
      />
    </PageShell>
  );
}
