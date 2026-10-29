import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { UniversityCard, UniversityMedia } from "../components/UniversityCard";
import {
  cityLabel,
  describeUniversity,
  universities,
  universityType,
  type University,
} from "../data/universities";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";

const STEPS = [
  ["step1", "step1_d"],
  ["step2", "step2_d"],
  ["step3", "step3_d"],
  ["step4", "step4_d"],
] as const;

/**
 * One university from the academy's list (/university/<slug>), in the same
 * iOS 26 layout as the course page: photo, quick facts, a short factual
 * description, the official site, how we help you apply, other schools in the
 * same city, and a floating "get advice" bar into the enroll flow.
 */
export function UniversitySchool({ u }: { u: University }) {
  const { t, lang } = useI18n();
  const city = cityLabel(u, lang);
  const sameCity = u.city ? universities.filter((x) => x.city === u.city && x.slug !== u.slug).slice(0, 4) : [];
  const enrollTo = `/enroll?interest=consult&uni=china&school=${encodeURIComponent(u.name)}`;

  return (
    <PageShell className="page-uni cd">
      <div className="cd-layout">
        <Reveal className="cd-media-wrap">
          <div className="cd-media">
            <UniversityMedia u={u} className="uni-hero-media" eager />
            <Link to="/university" className="cd-back" aria-label={t("back")}>
              ←
            </Link>
          </div>
          {u.photo && (
            <p className="uni-credit">
              {t("uni_photo_credit")}: {u.photo.author} ·{" "}
              {u.photo.licenseUrl ? (
                <a href={u.photo.licenseUrl} target="_blank" rel="noopener noreferrer">
                  {u.photo.license}
                </a>
              ) : (
                u.photo.license
              )}{" "}
              ·{" "}
              <a href={u.photo.page} target="_blank" rel="noopener noreferrer">
                Wikimedia Commons
              </a>
            </p>
          )}
        </Reveal>

        <div className="cd-body">
          <Reveal>
            <header className="cd-head">
              <span className="cd-tag">{universityType(u)[lang]}</span>
              <h1 className="cd-title">{u.name}</h1>
              {u.zh && (
                <p className="cd-unit" lang="zh">
                  {u.zh}
                </p>
              )}
            </header>
          </Reveal>

          <Reveal>
            <ul className="cd-facts">
              {city && (
                <li>
                  <span>{t("uni_city")}</span>
                  <strong>{city}</strong>
                </li>
              )}
              {u.founded && (
                <li>
                  <span>{t("uni_founded")}</span>
                  <strong>{u.founded}</strong>
                </li>
              )}
              <li>
                <span>{t("uni_type")}</span>
                <strong>{universityType(u)[lang]}</strong>
              </li>
            </ul>
          </Reveal>

          <Reveal>
            <section className="cd-group">
              <h2 className="cd-label">{t("uni_about")}</h2>
              <div className="cd-card cd-copy">
                <p>{describeUniversity(u, lang)}</p>
                <p>{t("uni_about_more")}</p>
              </div>
              {u.website && (
                <a className="cd-card cd-link" href={u.website} target="_blank" rel="noopener noreferrer">
                  <span>{t("uni_website")}</span>
                  <i aria-hidden>↗</i>
                </a>
              )}
            </section>
          </Reveal>

          <Reveal>
            <section className="cd-group">
              <h2 className="cd-label">{t("uni_how")}</h2>
              <ol className="cd-card cd-list cd-steps">
                {STEPS.map(([title, desc], i) => (
                  <li key={title}>
                    <span className="cd-step-num" aria-hidden>
                      {i + 1}
                    </span>
                    <span>
                      <strong>{t(title)}</strong>
                      <small>{t(desc)}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          {sameCity.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("uni_same_city").replace("{city}", city)}</h2>
                <Stagger className="uni-tiles uni-tiles-compact">
                  {sameCity.map((x) => (
                    <StaggerItem key={x.slug}>
                      <UniversityCard university={x} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            </Reveal>
          )}
        </div>
      </div>

      {createPortal(
        <div className="cd-bar">
          <div className="cd-bar-price">
            <strong>{u.name}</strong>
          </div>
          <Link to={enrollTo} className="btn btn-seal" onClick={() => void hapticLight()}>
            <span>{t("uni_tile_cta")}</span>
          </Link>
        </div>,
        document.body,
      )}
    </PageShell>
  );
}
