import { Link } from "react-router-dom";
import {
  coursesMeta,
  featuredUniversities,
  partnerUniversities,
  whyHanzMeta,
} from "../data/content";
import { UniversityCard } from "../components/UniversityCard";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { TeachersSection } from "../components/TeachersSection";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";

export function About() {
  const { t, lang } = useI18n();
  const { academyLive: academy, branchesLive } = useSiteContent();

  return (
    <PageShell className="page-about is-app">
      <header className="page-head app-head">
        <Reveal>
          <p className="eyebrow">{t("about_title")}</p>
          <h1 className="h1">{t("about_title")}</h1>
          <p className="lead home-about-copy">{t("about_body")}</p>
        </Reveal>
      </header>

      <TeachersSection />

      {/* Mobile */}
      <section className="section tight app-mobile">
        <Reveal>
          <div className="section-row app-section-row">
            <h2 className="app-section-title">{t("courses_title")}</h2>
            <Link to="/courses" className="text-link">
              {t("see_all")} <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="app-list">
          {coursesMeta.slice(0, 4).map((c) => (
            <StaggerItem key={c.id}>
              <Link to={`/courses/${c.id}`} className="app-row">
                <span className="app-row-icon" aria-hidden>
                  {c.icon}
                </span>
                <span className="app-row-body">
                  <strong>{t(c.titleKey)}</strong>
                  <em>{t(c.tagKey)}</em>
                </span>
                <span className="app-row-chevron" aria-hidden>
                  ›
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section tight app-mobile">
        <Reveal>
          <h2 className="app-section-title">{t("why_title")}</h2>
        </Reveal>
        <Stagger className="app-list">
          {whyHanzMeta.map((w) => (
            <StaggerItem key={w.id}>
              <div className="app-row app-row-static">
                <span className="app-row-icon" aria-hidden>
                  {w.icon}
                </span>
                <span className="app-row-body">
                  <strong>{t(w.titleKey)}</strong>
                  <em>{t(w.descKey)}</em>
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section tight app-mobile">
        <Reveal>
          <div className="section-row app-section-row">
            <h2 className="app-section-title">{t("branches_title")}</h2>
            <Link to="/contact" className="text-link">
              {t("nav_contact")} <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="app-list">
          {branchesLive.map((b) => (
            <StaggerItem key={b.id}>
              <a href={`tel:${b.phones[0]}`} className="app-row">
                <span className="app-row-icon" aria-hidden>
                  地
                </span>
                <span className="app-row-body">
                  <strong>{loc(lang, t, b.title, b.titleKey)}</strong>
                  <em>{b.phoneDisplay.join(" · ")}</em>
                </span>
                <span className="app-row-chevron" aria-hidden>
                  ›
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section tight app-mobile">
        <Reveal>
          <div className="section-row app-section-row">
            <h2 className="app-section-title">{t("china_home_title")}</h2>
            <Link to="/university" className="text-link">
              {t("see_all")} <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="uni-tiles">
          {featuredUniversities.slice(0, 4).map((name) => (
            <StaggerItem key={name}>
              <UniversityCard name={name} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section tight app-mobile">
        <Reveal>
          <h2 className="app-section-title">{t("success_title")}</h2>
        </Reveal>
        <Stagger className="app-list">
          {(["success_1", "success_2", "success_3"] as const).map((key) => (
            <StaggerItem key={key}>
              <div className="app-row app-row-static">
                <span className="app-row-icon" aria-hidden>
                  ✓
                </span>
                <span className="app-row-body">
                  <strong>{t(key)}</strong>
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section tight section-last app-mobile">
        <Reveal>
          <Link to="/translation" className="app-row app-related">
            <span className="app-row-icon" aria-hidden>
              译
            </span>
            <span className="app-row-body">
              <strong>{t("service_title")}</strong>
              <em>{t("nav_translation")}</em>
            </span>
            <span className="app-row-chevron" aria-hidden>
              ›
            </span>
          </Link>
        </Reveal>
      </section>

      {/* Desktop classic */}
      <section className="section desk-only">
        <Reveal>
          <div className="section-row">
            <div>
              <p className="eyebrow">{t("courses_title")}</p>
              <h2 className="h2">{t("courses_title")}</h2>
              <p className="lead">{t("courses_lead")}</p>
            </div>
            <Link to="/courses" className="text-link">
              {t("register_cta")}
              <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="home-course-grid">
          {coursesMeta.map((c) => (
            <StaggerItem key={c.id}>
              <Link to={`/courses/${c.id}`} className="home-course-card">
                <span className="home-course-icon" aria-hidden>
                  {c.icon}
                </span>
                <span className="home-course-tag">{t(c.tagKey)}</span>
                <h3>{t(c.titleKey)}</h3>
                <p>{t(c.descKey)}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section desk-only">
        <Reveal>
          <p className="eyebrow">{t("why_title")}</p>
          <h2 className="h2">{t("why_title")}</h2>
        </Reveal>
        <Stagger className="why-grid">
          {whyHanzMeta.map((w) => (
            <StaggerItem key={w.id}>
              <article className="why-card">
                <span className="why-icon" aria-hidden>
                  {w.icon}
                </span>
                <h3>{t(w.titleKey)}</h3>
                <p>{t(w.descKey)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section desk-only">
        <Reveal>
          <div className="section-row">
            <div>
              <p className="eyebrow">{t("branches_title")}</p>
              <h2 className="h2">{t("branches_title")}</h2>
            </div>
            <Link to="/contact" className="text-link">
              {t("nav_contact")}
              <i aria-hidden>→</i>
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

      <section className="section desk-only">
        <Reveal>
          <div className="section-row">
            <div>
              <p className="eyebrow">{t("nav_uni")}</p>
              <h2 className="h2">{t("china_home_title")}</h2>
              <p className="lead">{t("china_home_lead")}</p>
            </div>
            <Link to="/university" className="text-link">
              {t("uni_all_link")} ({partnerUniversities.length})
              <i aria-hidden>→</i>
            </Link>
          </div>
        </Reveal>
        <Stagger className="uni-tiles">
          {featuredUniversities.map((name) => (
            <StaggerItem key={name}>
              <UniversityCard name={name} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section desk-only">
        <Reveal>
          <p className="eyebrow">{t("partners_title")}</p>
          <h2 className="h2">{t("success_title")}</h2>
        </Reveal>
        <Stagger className="why-grid">
          {(["success_1", "success_2", "success_3"] as const).map((key) => (
            <StaggerItem key={key}>
              <article className="why-card">
                <span className="why-icon" aria-hidden>
                  ✓
                </span>
                <h3>{t(key)}</h3>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section section-last desk-only">
        <Reveal>
          <div className="home-service">
            <p className="eyebrow">{t("nav_translation")}</p>
            <h2 className="h2">{t("service_title")}</h2>
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
