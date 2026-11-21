import { Link } from "react-router-dom";
import { whyHanzMeta } from "../data/content";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { PartnersSection } from "../components/PartnersSection";
import { StatsStrip } from "../components/StatsStrip";
import { TeachersSection } from "../components/TeachersSection";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";

/**
 * About, in one order on every screen (client, 2026-11-21):
 * who we are → numbers → partners → team → why us → results → branches → translation.
 * Courses and universities have their own pages, so they are linked, not repeated.
 */
export function About() {
  const { t, lang } = useI18n();
  const { academyLive: academy, branchesLive } = useSiteContent();

  return (
    <PageShell className="page-about is-app about-page">
      {/* 1 · Who we are */}
      <header className="page-head app-head about-intro">
        <Reveal>
          <p className="eyebrow">{t("about_title")}</p>
          <h1 className="h1">{t("about_title")}</h1>
        </Reveal>
        <Reveal className="about-intro-copy">
          <p className="lead">{t("about_body")}</p>
          <div className="about-intro-links">
            <Link to="/courses" className="btn btn-seal">
              <span>{t("courses_title")}</span>
            </Link>
            <Link to="/university" className="btn btn-ink">
              <span>{t("china_home_title")}</span>
            </Link>
          </div>
        </Reveal>
      </header>

      {/* 2 · Numbers */}
      <div className="desk-only about-stats">
        <StatsStrip />
      </div>

      {/* 3 · Official partners */}
      <PartnersSection className="section tight about-section" />

      {/* 4 · Team */}
      <TeachersSection />

      {/* 5 · Why Hanz */}
      <section className="section tight about-section">
        <Reveal>
          <h2 className="h2 about-h">{t("why_title")}</h2>
        </Reveal>
        <Stagger className="why-grid">
          {whyHanzMeta.map((w) => (
            <StaggerItem key={w.id}>
              <article className="why-card">
                <span className={`why-icon${w.icon.length > 1 ? " is-wide" : ""}`} aria-hidden>
                  {w.icon}
                </span>
                <h3>{t(w.titleKey)}</h3>
                <p>{t(w.descKey)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 6 · Results */}
      <section className="section tight about-section">
        <Reveal>
          <h2 className="h2 about-h">{t("success_title")}</h2>
        </Reveal>
        <Stagger className="about-results">
          {(["success_1", "success_2", "success_3"] as const).map((key) => (
            <StaggerItem key={key}>
              <div className="about-result">
                <span aria-hidden>✓</span>
                <p>{t(key)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 7 · Branches */}
      <section className="section tight about-section">
        <Reveal>
          <div className="section-row">
            <h2 className="h2 about-h">{t("branches_title")}</h2>
            <Link to="/contact" className="text-link">
              {t("nav_contact")} <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="home-branch-grid">
          {branchesLive.map((b) => (
            <StaggerItem key={b.id}>
              <article className="home-branch-card">
                <h3>{loc(lang, t, b.title, b.titleKey)}</h3>
                <p>{loc(lang, t, b.address, b.addrKey)}</p>
                <div className="home-branch-phones">
                  {b.phoneDisplay.map((display, i) => (
                    <a key={display} href={`tel:${b.phones[i]}`}>
                      {display}
                    </a>
                  ))}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 8 · Translation */}
      <section className="section tight section-last about-section">
        <Reveal>
          <div className="home-service">
            <h2 className="h2 about-h">{t("service_title")}</h2>
            <p className="lead">{t("service_body")}</p>
            <div className="hero-cta-row" style={{ marginTop: "1rem" }}>
              <Link to="/translation" className="btn btn-seal">
                <span>{t("nav_translation")}</span>
              </Link>
              <a href={`mailto:${academy.email}`} className="btn btn-ink">
                <span>{academy.email}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
