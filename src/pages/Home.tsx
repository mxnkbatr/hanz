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
import { whyHanzMeta } from "../data/content";

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
 * Desktop home, ordered the way people decide on a school:
 * promise (hero) → proof (numbers) → what we teach (programs) → why us →
 * the study-in-China path → try it (hanzi) → news → questions → enrol.
 */
function HomeDesktop() {
  const { t, lang } = useI18n();
  const { academyLive: academy, newsLive, coursesLive, universitiesLive } =
    useSiteContent();
  const [lead, ...restCourses] = coursesLive;

  return (
    <PageShell className="page-home">
      {/* No separate intro screen: the hero's letterbox opening is the intro. */}
      <DesktopHero ready />

      <div className="home-below">
        {/* 1 · Proof right under the promise */}
        <StatsStrip />

        {/* 2 · Programs: bento grid, first course large, quiz card last */}
        <section className="section hx-section">
          <Reveal>
            <div className="section-row">
              <div>
                <SectionIndex n={1} label={t("courses_title")} />
                <h2 className="h2">{t("hd_programs")}</h2>
                <p className="lead hx-lead">{t("hd_programs_lead")}</p>
              </div>
              <Link to="/courses" className="text-link">
                {t("see_all")} <i aria-hidden>→</i>
              </Link>
            </div>
          </Reveal>

          <Stagger className="hx-bento">
            {lead && (
              <StaggerItem className="hx-bento-lead">
                <CourseTile course={lead} large />
              </StaggerItem>
            )}
            {restCourses.slice(0, 3).map((c) => (
              <StaggerItem key={c.id}>
                <CourseTile course={c} />
              </StaggerItem>
            ))}
            <StaggerItem>
              <Link to="/courses" className="hx-match">
                <span className="hx-match-glyph" aria-hidden>
                  测
                </span>
                <strong>{t("hd_match_t")}</strong>
                <span>{t("hd_match_d")}</span>
                <em className="hx-match-cta">
                  {t("hd_match_cta")} <i aria-hidden>→</i>
                </em>
              </Link>
            </StaggerItem>
          </Stagger>
        </section>

        {/* 3 · Why Hanz: big serif heading held on the left, bento on the right */}
        <section className="section hx-section hx-why-wrap">
          <Reveal className="hx-why-head">
            <SectionIndex n={2} label={t("hd_why_eyebrow")} />
            <h2 className="hx-display">{t("why_title")}</h2>
            <p className="lead hx-lead">{t("hd_why_lead")}</p>
          </Reveal>
          <Stagger className="hx-why">
            {whyHanzMeta.map((w, i) => (
              <StaggerItem key={w.id} className={WHY_SIZES[i]}>
                <article className="hx-why-card">
                  <span className="hx-why-icon" aria-hidden>
                    {w.icon}
                  </span>
                  <h3>{t(w.titleKey)}</h3>
                  <p>{t(w.descKey)}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 4 · Study in China: the four steps + a few universities */}
        <section className="section hx-section hx-china">
          <div className="hx-china-copy">
            <Reveal>
              <SectionIndex n={3} label={t("hd_china_eyebrow")} />
              <h2 className="h2">{t("china_home_title")}</h2>
              <p className="lead hx-lead">{t("china_home_lead")}</p>
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
          <Stagger className="hx-unis">
            {universitiesLive.slice(0, 3).map((u) => (
              <StaggerItem key={u.id}>
                <Link to={`/university/${u.id}`} className="hx-uni">
                  <SafeImage
                    src={u.image}
                    alt={loc(lang, t, u.title, u.titleKey ?? u.nameMnKey)}
                  />
                  <span className="hx-uni-body">
                    <small>{loc(lang, t, u.city, u.cityKey)}</small>
                    <strong>{loc(lang, t, u.title, u.titleKey ?? u.nameMnKey)}</strong>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
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
                <SectionIndex n={4} label={t("nav_news")} />
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
              <SectionIndex n={5} label="FAQ" />
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
          <div className="home-finale-ctas">
            <MagneticButton
              href={academy.registerUrl}
              className="btn btn-seal"
              target="_blank"
              rel="noopener noreferrer"
            >
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

/** Bento sizes for the six "why" cards: one feature, two wide, three small. */
const WHY_SIZES = [
  "is-feature",
  "is-wide",
  "is-wide",
  "is-small",
  "is-small",
  "is-small",
] as const;

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

type Course = ReturnType<typeof useSiteContent>["coursesLive"][number];

function CourseTile({ course, large = false }: { course: Course; large?: boolean }) {
  const { t, lang } = useI18n();
  const title = loc(lang, t, course.title, course.titleKey);
  return (
    <Link to={`/courses/${course.id}`} className={`hx-course${large ? " is-large" : ""}`}>
      <span className="hx-course-media">
        <SafeImage src={course.image} alt={title} />
      </span>
      <span className="hx-course-body">
        <span className="hx-course-tag">{loc(lang, t, course.tag, course.tagKey)}</span>
        <strong>{title}</strong>
        {large && <span className="hx-course-desc">{loc(lang, t, course.body, course.descKey)}</span>}
        <span className="hx-course-meta">
          {t(course.unitKey)} <i aria-hidden>→</i>
        </span>
      </span>
    </Link>
  );
}
