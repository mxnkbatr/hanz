import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { SafeImage } from "./SafeImage";
import { cityLabel, featuredUniversities, universities, type University } from "../data/universities";
import { ease } from "../lib/motion";

function helloKey(h: number) {
  if (h < 5) return "mh_hello_night";
  if (h < 12) return "mh_hello_morning";
  if (h < 18) return "mh_hello_day";
  return "mh_hello_evening";
}

const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

type Entry = {
  id: string;
  kind: "course" | "uni" | "travel" | "news";
  to: string;
  title: string;
  meta: string;
  image: string;
};

const uniEntry = (u: University, lang: "mn" | "en" | "zh"): Entry => ({
  id: u.slug,
  kind: "uni",
  to: `/university/${u.slug}`,
  title: u.name,
  meta: [u.zh, cityLabel(u, lang)].filter(Boolean).join(" · "),
  image: u.photo?.src ?? "",
});

/** Phone home: app-style start screen instead of the long desktop landing. */
export function MobileHome() {
  const { t, lang } = useI18n();
  const { coursesLive, travelLive, newsLive, academyLive } = useSiteContent();
  const [q, setQ] = useState("");
  const [hour] = useState(() => new Date().getHours());
  const hello = t(helloKey(hour));

  const courses: Entry[] = useMemo(
    () =>
      coursesLive.map((c) => ({
        id: c.id,
        kind: "course",
        to: `/courses/${c.id}`,
        title: loc(lang, t, c.title, c.titleKey),
        meta: loc(lang, t, c.tag, c.tagKey),
        image: c.image,
      })),
    [coursesLive, lang, t],
  );
  // The academy's full university list (search) and its featured schools (rail).
  const unis: Entry[] = useMemo(() => universities.map((u) => uniEntry(u, lang)), [lang]);
  const featuredUnis: Entry[] = useMemo(
    () => featuredUniversities.map((u) => uniEntry(u, lang)),
    [lang],
  );
  const travel: Entry[] = useMemo(
    () =>
      travelLive.map((tr) => ({
        id: tr.id,
        kind: "travel",
        to: `/travel/${tr.id}`,
        title: loc(lang, t, tr.title, tr.titleKey),
        meta: loc(lang, t, tr.tag, tr.tagKey),
        image: tr.image,
      })),
    [travelLive, lang, t],
  );
  const news: Entry[] = useMemo(
    () =>
      newsLive.map((n) => ({
        id: n.id,
        kind: "news",
        to: `/medee/${n.id}`,
        title: loc(lang, t, n.title, n.titleKey),
        meta: `${loc(lang, t, n.tag, n.tagKey)} · ${n.date}`,
        image: n.image,
      })),
    [newsLive, lang, t],
  );

  const query = q.trim().toLowerCase();
  const results = query
    ? [...courses, ...unis, ...travel, ...news].filter((e) =>
        `${e.title} ${e.meta}`.toLowerCase().includes(query),
      )
    : [];


  return (
    <div className="m-home">
      <motion.header className="m-head" {...rise} transition={{ duration: 0.5, ease }}>
        <p className="m-hello">{hello}</p>
        <h1 className="m-title">
          {t("mh_title_a")} <em>{t("mh_title_em")}</em> {t("mh_title_b")}
        </h1>
      </motion.header>

      <motion.div
        className="m-search"
        {...rise}
        transition={{ delay: 0.06, duration: 0.5, ease }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("mh_search")}
          enterKeyHint="search"
          aria-label={t("mh_search")}
        />
        {q ? (
          <button type="button" onClick={() => setQ("")} aria-label={t("mh_clear")}>
            ×
          </button>
        ) : null}
      </motion.div>

      <AnimatePresence mode="wait">
        {query ? (
          <motion.ul
            key="results"
            className="m-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {results.length ? (
              results.slice(0, 12).map((e) => (
                <li key={`${e.kind}-${e.id}`}>
                  <Link to={e.to} className="m-row">
                    <span className="m-row-thumb">
                      <SafeImage src={e.image} alt="" />
                    </span>
                    <span className="m-row-body">
                      <em>{t(`mh_kind_${e.kind}`)}</em>
                      <strong>{e.title}</strong>
                    </span>
                    <i aria-hidden>→</i>
                  </Link>
                </li>
              ))
            ) : (
              <li className="m-empty">
                “{q}” {t("mh_search_empty")}
              </li>
            )}
          </motion.ul>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <section className="m-section">
              <div className="m-section-head">
                <h2>{t("mh_courses")}</h2>
                <Link to="/courses">{t("see_all")}</Link>
              </div>
              <div className="m-rail">
                <AnimatePresence mode="popLayout" initial={false}>
                  {courses.map((e, i) => (
                    <motion.div
                      key={e.id}
                      layout
                      className="m-tall"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(i, 5) * 0.05, duration: 0.45, ease }}
                    >
                      <Link to={e.to}>
                        <SafeImage src={e.image} alt={e.title} />
                        <span className="m-tall-shade" />
                        <span className="m-chip-light">{e.meta}</span>
                        <span className="m-tall-body">
                          <strong>{e.title}</strong>
                          <i aria-hidden>→</i>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {featuredUnis.length ? (
              <section className="m-section">
                <div className="m-section-head">
                  <h2>{t("mh_unis")}</h2>
                  <Link to="/university">{t("see_all")}</Link>
                </div>
                <div className="m-rail">
                  {featuredUnis.map((e) => (
                    <Link key={e.id} to={e.to} className="m-square">
                      <span className="m-square-media">
                        <SafeImage src={e.image} alt={e.title} />
                      </span>
                      <strong>{e.title}</strong>
                      <em>{e.meta}</em>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="m-section">
              <div className="m-section-head">
                <h2>{t("mh_news")}</h2>
                <Link to="/medee">{t("see_all")}</Link>
              </div>
              <ul className="m-list">
                {news.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <Link to={e.to} className="m-row">
                      <span className="m-row-thumb is-lg">
                        <SafeImage src={e.image} alt="" />
                      </span>
                      <span className="m-row-body">
                        <em>{e.meta}</em>
                        <strong>{e.title}</strong>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="m-cta">
              <span className="m-cta-mark" aria-hidden>
                汉
              </span>
              <h2>
                {t("mh_cta_a")} <em>{t("mh_cta_em")}</em> {t("mh_cta_b")}
              </h2>
              <div className="m-cta-actions">
                <Link to="/enroll?interest=hsk" className="is-seal">
                  {t("register_cta")} →
                </Link>
                <a href={`tel:${academyLive.phoneRaw[0]}`}>☏ {t("call")}</a>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
