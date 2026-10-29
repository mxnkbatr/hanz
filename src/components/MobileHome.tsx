import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { courseFilters, filterKeyLabel, type CourseFilter } from "../data/courseMatch";
import { SafeImage } from "./SafeImage";
import { useImageTints } from "../lib/imageTint";
import { ease, navSpring } from "../lib/motion";

const FEATURE_MS = 5200;

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

/** Phone home: app-style start screen instead of the long desktop landing. */
export function MobileHome() {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const { coursesLive, universitiesLive, travelLive, newsLive, academyLive } =
    useSiteContent();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("all");
  const [slide, setSlide] = useState(0);
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
  const unis: Entry[] = useMemo(
    () =>
      universitiesLive.map((u) => ({
        id: u.id,
        kind: "uni",
        to: `/university/${u.id}`,
        title: loc(lang, t, u.title, u.nameMnKey || u.titleKey),
        meta: loc(lang, t, u.city, u.cityKey),
        image: u.image,
      })),
    [universitiesLive, lang, t],
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

  const featured = useMemo(
    () => [...travel.slice(0, 2), ...courses.slice(0, 3)].slice(0, 5),
    [travel, courses],
  );

  useEffect(() => {
    if (reduce || featured.length < 2) return;
    const id = window.setTimeout(
      () => setSlide((s) => (s + 1) % featured.length),
      FEATURE_MS,
    );
    return () => window.clearTimeout(id);
  }, [slide, featured.length, reduce]);

  const query = q.trim().toLowerCase();
  const results = query
    ? [...courses, ...unis, ...travel, ...news].filter((e) =>
        `${e.title} ${e.meta}`.toLowerCase().includes(query),
      )
    : [];

  const filtered =
    filter === "all"
      ? courses
      : courses.filter(
          (e) => coursesLive.find((c) => c.id === e.id)?.filter === filter,
        );
  const usedFilters = courseFilters.filter(
    (f) => f === "all" || coursesLive.some((c) => c.filter === f),
  );
  const current = featured[slide % Math.max(featured.length, 1)];
  const tints = useImageTints(featured.map((f) => f.image));

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
            {current ? (
              <section
                className={`m-feature${tints[current.image] ? " is-tinted" : ""}`}
                aria-label={t("mh_featured")}
                style={{ "--tint": tints[current.image] } as CSSProperties}
              >
                {/* Frame colour = the photo's own colour (lib/imageTint), fading per slide.
                    Until it is sampled (or if it can't be), a blurred copy of the photo stands in. */}
                <AnimatePresence initial={false}>
                  {!tints[current.image] && (
                    <motion.span
                      key={current.id + current.kind}
                      className="m-feature-glow"
                      aria-hidden
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease }}
                    >
                      <SafeImage src={current.image} alt="" loading="eager" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={current.id + current.kind}
                    className="m-feature-card"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5, ease }}
                    drag={featured.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) < 50) return;
                      const dir = info.offset.x < 0 ? 1 : -1;
                      setSlide((s) => (s + dir + featured.length) % featured.length);
                    }}
                  >
                    <Link to={current.to} className="m-feature-link" draggable={false}>
                      <span className="m-feature-media">
                        <SafeImage src={current.image} alt={current.title} loading="eager" />
                        <span className="m-chip-light">{t(`mh_kind_${current.kind}`)}</span>
                      </span>
                      <span className="m-feature-body">
                        <em>{current.meta || t("mh_featured")}</em>
                        <strong>{current.title}</strong>
                      </span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
                <div className="m-feature-bars" role="tablist">
                  {featured.map((f, i) => (
                    <button
                      key={f.id + f.kind}
                      type="button"
                      role="tab"
                      aria-selected={i === slide}
                      aria-label={f.title}
                      className={i === slide ? "is-active" : i < slide ? "is-done" : ""}
                      onClick={() => setSlide(i)}
                    >
                      <span
                        style={{ animationDuration: `${FEATURE_MS}ms` }}
                        key={i === slide ? `run-${slide}` : "idle"}
                      />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="m-chips">
              {usedFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={filter === f ? "is-active" : ""}
                  onClick={() => setFilter(f)}
                >
                  {filter === f ? (
                    <motion.span className="m-chip-pill" layoutId="m-chip" transition={navSpring} />
                  ) : null}
                  <span>{t(filterKeyLabel(f))}</span>
                </button>
              ))}
            </div>

            <section className="m-section">
              <div className="m-section-head">
                <h2>{t("mh_courses")}</h2>
                <Link to="/courses">{t("see_all")}</Link>
              </div>
              <div className="m-rail">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((e, i) => (
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

            <Link to="/university" className="m-promo">
              <span>
                <em>{t("mh_promo_eyebrow")}</em>
                <strong>{t("mh_promo_title")}</strong>
              </span>
              <i aria-hidden>→</i>
            </Link>

            {unis.length ? (
              <section className="m-section">
                <div className="m-section-head">
                  <h2>{t("mh_unis")}</h2>
                  <Link to="/university">{t("see_all")}</Link>
                </div>
                <div className="m-rail">
                  {unis.slice(0, 8).map((e) => (
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
                {news.slice(0, 4).map((e) => (
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
                <a
                  href={academyLive.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="is-seal"
                >
                  {t("register_cta")} →
                </a>
                <a href={`tel:${academyLive.phoneRaw[0]}`}>☏ {t("call")}</a>
              </div>
              <a
                className="m-cta-chat"
                href={academyLive.messenger}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("mh_chat")} — {t("mh_call")}
              </a>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
