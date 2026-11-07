import { Link } from "react-router-dom";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { Marquee } from "../components/Marquee";
import { SafeImage } from "../components/SafeImage";
import { MobileHome } from "../components/MobileHome";
import { DesktopHero } from "../components/DesktopHero";
import { useDesktop } from "../hooks/useDesktop";
import { LearnScroll } from "../components/LearnScroll";
import { StatsStrip } from "../components/StatsStrip";
import { MagneticButton } from "../components/MagneticButton";
import { FloatingGlyphs } from "../components/FloatingGlyphs";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { toDateTime } from "../lib/date";
import {
  featuredUniversities,
  formatPrice,
  hskFees,
  partnerUniversities,
  servicesMeta,
} from "../data/content";
import { UniversityCard } from "../components/UniversityCard";

const STEPS = [
  ["step1", "step1_d"],
  ["step2", "step2_d"],
  ["step3", "step3_d"],
  ["step4", "step4_d"],
] as const;

const FAQS = [
  ["faq1_q", "faq1_a"],
  ["faq2_q", "faq2_a"],
  ["faq3_q", "faq3_a"],
  ["faq4_q", "faq4_a"],
] as const;

export function Home() {
  const desktop = useDesktop();
  if (!desktop) {
    return (
      <PageShell className="page-home page-home-mobile">
        <MobileHome />
      </PageShell>
    );
  }
  return <HomeDesktop />;
}

/**
 * Desktop home, in the order of the academy's page copy:
 * promise (hero) → about → numbers → services → levels and fees →
 * the study-in-China path → try it (hanzi) → news → questions → enrol.
 */
function HomeDesktop() {
  const { t, lang } = useI18n();
  const { academyLive: academy, newsLive, coursesLive } =
    useSiteContent();

  return (
    <PageShell className="page-home">
      {/* No separate intro screen: the hero's letterbox opening is the intro. */}
      <DesktopHero ready />

      <div className="home-below">
        {/* 1 · About */}
        <section className="section hx-section hx-about">
          <Reveal>
            <SectionIndex n={1} label={t("about_title")} />
            <h2 className="h2">{t("about_title")}</h2>
          </Reveal>
          <Reveal className="hx-about-copy">
            <p className="lead">{t("about_body")}</p>
          </Reveal>
        </section>

        {/* 2 · Numbers */}
        <StatsStrip />

        {/* 3 · Services: heading held on the left, four cards on the right */}
        <section className="section hx-section hx-why-wrap">
          <Reveal className="hx-why-head">
            <SectionIndex n={2} label={t("svc_title")} />
            <h2 className="hx-display">{t("svc_title")}</h2>
          </Reveal>
          <Stagger className="hx-why">
            {servicesMeta.map((s) => (
              <StaggerItem key={s.id} className="is-wide">
                <Link to={s.to} className="hx-why-card">
                  <span className="hx-why-icon" aria-hidden>
                    {s.icon}
                  </span>
                  <h3>{t(s.titleKey)}</h3>
                  <p>{t(s.descKey)}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 4 · Levels and fees */}
        <section className="section hx-section">
          <Reveal>
            <div className="section-row">
              <div>
                <SectionIndex n={3} label={t("courses_title")} />
                <h2 className="h2">{t("levels_title")}</h2>
                <p className="lead hx-lead">{t("levels_lead")}</p>
              </div>
              <Link to="/pricing" className="text-link">
                {t("nav_pricing")} <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="hx-levels">
            {coursesLive.map((c) => (
              <StaggerItem key={c.id}>
                <Link to={`/courses/${c.id}`} className="hx-level">
                  <span className="hx-level-glyph" aria-hidden>
                    {"一二三四五六"[(c.level ?? 1) - 1]}
                  </span>
                  <strong>{loc(lang, t, c.title, c.titleKey)}</strong>
                  {c.sumKey && <span className="hx-level-sum">{t(c.sumKey)}</span>}
                  <span className="hx-level-meta">
                    {t("course_unit")} · {formatPrice(hskFees.month)}
                  </span>
                </Link>
              </StaggerItem>
            ))}
            <StaggerItem className="hx-level-wide">
              <Link to="/pricing" className="hx-level is-long">
                <strong>{t("course_6m_t")}</strong>
                <span className="hx-level-meta">{formatPrice(hskFees.sixMonth)}</span>
              </Link>
            </StaggerItem>
          </Stagger>
        </section>

        {/* 5 · Study in China: the four steps + a few universities */}
        <section className="section hx-section hx-china">
          <div className="hx-china-copy">
            <Reveal>
              <SectionIndex n={4} label={t("hd_china_eyebrow")} />
              <h2 className="h2">{t("china_home_title")}</h2>
              <p className="lead hx-lead">{t("china_home_lead")}</p>
              <p className="lead hx-lead">{t("china_home_scholar")}</p>
            </Reveal>
            <ol className="hx-steps">
              {STEPS.map(([title, desc], i) => (
                <li key={title}>
                  <span className="hx-step-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{t(title)}</strong>
                    <span>{t(desc)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/university" className="btn btn-seal hx-china-cta">
              <span>{t("uni_more")}</span>
              <i aria-hidden>→</i>
            </Link>
          </div>
          <div className="hx-unis-wrap">
            <Stagger className="uni-tiles hx-uni-tiles">
              {featuredUniversities.map((name) => (
                <StaggerItem key={name}>
                  <UniversityCard name={name} />
                </StaggerItem>
              ))}
            </Stagger>
            <Link to="/university" className="text-link">
              {t("uni_all_link")} ({partnerUniversities.length}) <i aria-hidden>→</i>
            </Link>
          </div>
        </section>

        {/* 5 · Try a character */}
        <LearnScroll />

        <Reveal>
          <Marquee />
        </Reveal>

        {/* 6 · News */}
        <section className="section hx-section">
          <Reveal>
            <div className="section-row">
              <div>
                <SectionIndex n={5} label={t("nav_news")} />
                <h2 className="h2">{t("home_news")}</h2>
              </div>
              <Link to="/medee" className="text-link">
                {t("see_all")} <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>
          <Stagger className="news-grid home-news">
            {newsLive.slice(0, 3).map((item) => (
              <StaggerItem key={item.id}>
                <Link to={`/medee/${item.id}`} className="news-card">
                  <div className="news-card-media">
                    <SafeImage
                      src={item.image}
                      alt={loc(lang, t, item.title, item.titleKey)}
                    />
                  </div>
                  <div className="news-card-body">
                    <div className="news-meta">
                      <span>{loc(lang, t, item.tag, item.tagKey)}</span>
                      <time dateTime={toDateTime(item.date)}>{item.date}</time>
                    </div>
                    <h3>{loc(lang, t, item.title, item.titleKey)}</h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 7 · Questions, answered next to the way to ask more */}
        <section className="section section-last hx-section hx-faq">
          <Reveal>
            <div className="hx-faq-head">
              <SectionIndex n={6} label="FAQ" />
              <h2 className="h2">{t("faq_title")}</h2>
              <p className="lead hx-lead">{t("hd_faq_more")}</p>
              <a className="btn hero-film-ghost" href={`tel:${academy.phoneRaw[0]}`}>
                <span>
                  {t("call")} · {academy.phone[0]}
                </span>
              </a>
            </div>
          </Reveal>
          <div className="hx-faq-list">
            {FAQS.map(([q, a], i) => (
              <details key={q} className="hx-faq-item" open={i === 0}>
                <summary>
                  {t(q)}
                  <i aria-hidden>+</i>
                </summary>
                <p>{t(a)}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* 8 · Enrol */}
      <section className="home-finale">
        <FloatingGlyphs />
        <span className="home-finale-mark" aria-hidden>
          汉
        </span>
        <Reveal>
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h2 className="home-finale-title">
            {t("mh_cta_a")} <em>{t("mh_cta_em")}</em> {t("mh_cta_b")}
          </h2>
          <p className="home-finale-body">{t("cta_body")}</p>
          <div className="home-finale-ctas">
            <MagneticButton href="/enroll?interest=hsk" className="btn btn-seal">
              <span>{t("register_cta")}</span>
              <i aria-hidden>→</i>
            </MagneticButton>
            <a className="btn hero-film-ghost" href={`tel:${academy.phoneRaw[0]}`}>
              <span>
                {t("call")} · {academy.phone[0]}
              </span>
            </a>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

/** Numbered section label ("01 — Programs"), so the page reads as one sequence. */
function SectionIndex({ n, label }: { n: number; label: string }) {
  return (
    <p className="hx-index">
      <span className="hx-index-num">{String(n).padStart(2, "0")}</span>
      <i aria-hidden />
      <span>{label}</span>
    </p>
  );
}