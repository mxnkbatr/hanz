import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { liveAbroadPrograms, liveBanners, liveStories, type CourseLive, type HomeBannerCms } from "../lib/cms";
import { SafeImage } from "./SafeImage";
import { cityLabel, universities, type University } from "../data/universities";
import { courseFacts, isEnrolling, shortDate } from "../data/courseFacts";
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

/**
 * Phone home, top to bottom: greeting + search, promo banners, four big
 * shortcuts, featured courses, study-abroad programmes, success stories, CTA.
 * Banners, programmes and stories come from the admin and only show once added.
 */
export function MobileHome() {
  const { t, lang } = useI18n();
  const { coursesLive, travelLive, newsLive, academyLive, bundle } = useSiteContent();
  const [q, setQ] = useState("");
  const [hour] = useState(() => new Date().getHours());
  const hello = t(helloKey(hour));

  // Banners: the admin's own once added; until then three built from the
  // academy's existing copy and photos (enrolment, scholarships, Poland).
  const adminBanners = liveBanners(bundle);
  const banners: HomeBannerCms[] = adminBanners.length
    ? adminBanners
    : [
        {
          id: "d-enroll",
          image: "/images/hero-hanz.webp",
          title: { [lang]: t("mh_bn_enroll") },
          subtitle: { [lang]: `${t("sched_days")} · 10:00–18:00` },
          href: "/courses",
        },
        {
          id: "d-scholar",
          image: "/images/news-scholarship.webp",
          title: { [lang]: t("mh_bn_scholar") },
          subtitle: { [lang]: `${academyLive.scholarshipStudents} ${t("stat_scholarship")}` },
          href: "/university/china",
        },
        {
          id: "d-poland",
          image: "/images/poland/warsaw.webp",
          title: { [lang]: t("mh_quick_pl_study") },
          subtitle: { [lang]: `${t("cmp_p1")} · ${t("cmp_p2")}` },
          href: "/university/poland",
        },
      ];
  const programs = liveAbroadPrograms(bundle);
  const stories = liveStories(bundle);

  // The four programme types, each opening where that programme lives.
  const programKinds = [
    { kind: "language", to: "/courses", sub: `HSK 1–6 · ${t("course_unit")}`, glyph: "语" },
    { kind: "bachelor", to: "/university", sub: `${t("country_cn")} · ${t("country_pl")}`, glyph: "本" },
    { kind: "master", to: "/university", sub: `${t("country_cn")} · ${t("country_pl")}`, glyph: "硕" },
    { kind: "scholarship", to: "/university/china", sub: t("cmp_c2"), glyph: "奖" },
  ] as const;

  // The academy's own numbers (Settings in the admin).
  const stats = [
    { value: academyLive.graduates, label: t("stat_students") },
    { value: academyLive.scholarshipStudents, label: t("stat_scholarship") },
    { value: academyLive.founded, label: t("mh_since") },
  ].filter((x) => x.value);

  // Enrolling classes (with a start date) first, soonest first; then the rest.
  const featured = useMemo(() => {
    const open = coursesLive
      .filter((c) => isEnrolling(c))
      .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));
    const rest = coursesLive.filter((c) => !isEnrolling(c));
    return [...open, ...rest].slice(0, 4);
  }, [coursesLive]);

  const searchable: Entry[] = useMemo(
    () => [
      ...coursesLive.map((c) => ({
        id: c.id,
        kind: "course" as const,
        to: `/courses/${c.id}`,
        title: loc(lang, t, c.title, c.titleKey),
        meta: loc(lang, t, c.tag, c.tagKey),
        image: c.image,
      })),
      ...universities.map((u) => uniEntry(u, lang)),
      ...travelLive.map((tr) => ({
        id: tr.id,
        kind: "travel" as const,
        to: `/travel/${tr.id}`,
        title: loc(lang, t, tr.title, tr.titleKey),
        meta: loc(lang, t, tr.tag, tr.tagKey),
        image: tr.image,
      })),
      ...newsLive.map((n) => ({
        id: n.id,
        kind: "news" as const,
        to: `/medee/${n.id}`,
        title: loc(lang, t, n.title, n.titleKey),
        meta: `${loc(lang, t, n.tag, n.tagKey)} · ${n.date}`,
        image: n.image,
      })),
    ],
    [coursesLive, travelLive, newsLive, lang, t],
  );

  const query = q.trim().toLowerCase();
  const results = query
    ? searchable.filter((e) => `${e.title} ${e.meta}`.toLowerCase().includes(query))
    : [];

  // Hanzi marks instead of emoji: 汉 language, 留 (留学) study abroad.
  const tiles = [
    { to: "/courses?lang=zh", label: t("mh_quick_zh"), sub: "HSK 1–6", glyph: "汉", tone: "is-cn" },
    { to: "/courses?lang=pl", label: t("mh_quick_pl"), sub: "A1–B2", glyph: "Ą", tone: "is-pl" },
    { to: "/university", label: t("mh_quick_cn_study"), sub: t("country_cn"), glyph: "留", tone: "is-cn-soft" },
    { to: "/university/poland", label: t("mh_quick_pl_study"), sub: t("country_pl"), glyph: "PL", tone: "is-pl-soft" },
  ];

  return (
    <div className="m-home">
      <motion.header className="m-head" {...rise} transition={{ duration: 0.5, ease }}>
        <p className="m-hello">{hello}</p>
        <h1 className="m-title">
          {t("mh_title_a")} <em>{t("mh_title_em")}</em> {t("mh_title_b")}
        </h1>
      </motion.header>

      <motion.div className="m-search" {...rise} transition={{ delay: 0.06, duration: 0.5, ease }}>
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
            className="m-group"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {results.length ? (
              results.slice(0, 12).map((e) => (
                <li key={`${e.kind}-${e.id}`}>
                  <Link to={e.to} className="m-group-row">
                    <span className="m-group-thumb">
                      <SafeImage src={e.image} alt="" />
                    </span>
                    <span className="m-group-body">
                      <strong>{e.title}</strong>
                      <em>{t(`mh_kind_${e.kind}`)}</em>
                    </span>
                    <span className="m-group-chev" aria-hidden>
                      ›
                    </span>
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
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {banners.length > 0 && <BannerSlider banners={banners} />}

            {/* Four big shortcuts */}
            <div className="m-section-head m-section-head-first">
              <h2>{t("mh_browse")}</h2>
            </div>
            <nav className="m-tiles" aria-label={t("mh_browse")}>
              {tiles.map((x) => (
                <Link key={x.to} to={x.to} className={`m-tile ${x.tone}`}>
                  <span className="m-tile-glyph" aria-hidden>
                    {x.glyph}
                  </span>
                  <span className="m-tile-text">
                    <strong>{x.label}</strong>
                    <em>{x.sub}</em>
                  </span>
                </Link>
              ))}
            </nav>

            <section className="m-section">
              <div className="m-section-head">
                <h2>{t("mh_featured")}</h2>
                <Link to="/courses">{t("see_all")}</Link>
              </div>
              <ul className="m-group">
                {featured.map((c, i) => (
                  <FeaturedRow key={c.id} course={c} priority={i === 0} />
                ))}
              </ul>
            </section>

            <section className="m-section">
              <div className="m-section-head">
                <h2>{t("mh_programs")}</h2>
                <Link to="/university">{t("see_all")}</Link>
              </div>
              {/* The four programme types, always; the academy's own programme cards below once added. */}
              <div className="m-kinds">
                {programKinds.map((k) => (
                  <Link key={k.kind} to={k.to} className={`m-kind is-${k.kind}`}>
                    <span className="m-kind-glyph" aria-hidden lang="zh">
                      {k.glyph}
                    </span>
                    <strong>{t(`abroad_${k.kind}`)}</strong>
                    <em>{k.sub}</em>
                  </Link>
                ))}
              </div>
              {programs.length > 0 && (
                <div className="m-programs">
                  {programs.map((p) => (
                    <Link key={p.id} to={p.href || "/university"} className="m-program">
                      {p.image ? (
                        <span className="m-program-media">
                          <SafeImage src={p.image} alt="" />
                        </span>
                      ) : null}
                      <span className="m-program-body">
                        <span className="m-program-tags">
                          <em className={`m-badge is-${p.kind}`}>{t(`abroad_${p.kind}`)}</em>
                          <em className="m-badge is-country">{t(`country_${p.country}`)}</em>
                        </span>
                        <strong>{loc(lang, t, p.title)}</strong>
                        {loc(lang, t, p.body) ? <span className="m-program-text">{loc(lang, t, p.body)}</span> : null}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="m-section">
              <div className="m-section-head">
                <h2>{t("mh_stories")}</h2>
              </div>
              {/* The academy's numbers always; student stories once added in the admin. */}
              <ul className="m-stats">
                {stats.map((x) => (
                  <li key={x.label}>
                    <strong>{x.value}</strong>
                    <span>{x.label}</span>
                  </li>
                ))}
              </ul>
              {stories.length > 0 && (
                <ul className="m-stories">
                  {stories.map((s) => (
                    <li key={s.id} className="m-story">
                      <blockquote>“{loc(lang, t, s.quote)}”</blockquote>
                      <div className="m-story-who">
                        <span className="m-story-photo">
                          {s.photo ? <SafeImage src={s.photo} alt="" /> : <span>{s.name.slice(0, 1)}</span>}
                        </span>
                        <span>
                          <strong>{s.name}</strong>
                          <em>
                            {t(`country_${s.country}`)}
                            {loc(lang, t, s.school) ? ` · ${loc(lang, t, s.school)}` : ""}
                          </em>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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

function FeaturedRow({ course, priority }: { course: CourseLive; priority: boolean }) {
  const { t, lang } = useI18n();
  const f = courseFacts(course, t);
  const enrolling = isEnrolling(course);
  const line = [
    course.startDate && enrolling ? t("mh_starts").replace("{d}", shortDate(course.startDate, lang)) : "",
    f.duration,
    f.priceText,
  ]
    .filter(Boolean)
    .join(" · ");
  const seats =
    course.seatsLeft != null
      ? course.seatsLeft <= 0
        ? t("mh_full")
        : t("mh_seats_left").replace("{n}", String(course.seatsLeft))
      : "";
  return (
    <li>
      <Link to={`/courses/${course.id}`} className="m-group-row">
        <span className="m-group-thumb">
          <SafeImage src={course.image} alt="" priority={priority} />
        </span>
        <span className="m-group-body">
          {enrolling ? <span className="m-live">{t("mh_enrolling")}</span> : null}
          <strong>{loc(lang, t, course.title, course.titleKey)}</strong>
          <em>{line || loc(lang, t, course.tag, course.tagKey)}</em>
          {seats ? <span className={`m-seats${course.seatsLeft! <= 3 ? " is-low" : ""}`}>{seats}</span> : null}
        </span>
        <span className="m-group-chev" aria-hidden>
          ›
        </span>
      </Link>
    </li>
  );
}

/** Swipeable promo cards with dots; moves on by itself every 5 s until touched. */
function BannerSlider({ banners }: { banners: HomeBannerCms[] }) {
  const { t, lang } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (touched || banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const el = track.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => window.clearInterval(id);
  }, [touched, banners.length]);

  return (
    <section className="m-banners" aria-roledescription="carousel">
      <div className="m-banner-track" ref={track} onPointerDown={() => setTouched(true)}>
        {banners.map((b, i) => {
          const title = loc(lang, t, b.title);
          const sub = loc(lang, t, b.subtitle);
          const inner = (
            <>
              <SafeImage src={b.image} alt={title} priority={i === 0} />
              {(title || sub) && (
                <span className="m-banner-copy">
                  {title ? <strong>{title}</strong> : null}
                  {sub ? <em>{sub}</em> : null}
                </span>
              )}
            </>
          );
          return b.href ? (
            <Link key={b.id} to={b.href} className="m-banner">
              {inner}
            </Link>
          ) : (
            <div key={b.id} className="m-banner">
              {inner}
            </div>
          );
        })}
      </div>
      {banners.length > 1 && (
        <div className="m-banner-dots" aria-hidden>
          {banners.map((b, i) => (
            <span key={b.id} className={i === index ? "is-on" : ""} />
          ))}
        </div>
      )}
    </section>
  );
}
