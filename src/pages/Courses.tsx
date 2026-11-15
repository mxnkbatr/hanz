import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  matchLevels,
  resolveMatch,
  type MatchLevel,
  type MatchResult,
} from "../data/courseMatch";
import { courseFacts, isEnrolling, shortDate } from "../data/courseFacts";
import type { CourseLive } from "../lib/cms";
import { PageShell, Reveal, Stagger, StaggerItem } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type MatchPhase = "intro" | "ask" | "done";

export function Courses() {
  const { t, lang } = useI18n();
  const { coursesLive } = useSiteContent();

  const [q, setQ] = useState("");
  // Filters: language (also from ?lang= on the home shortcuts), level, format, time.
  const [params, setParams] = useSearchParams();
  const langFilter = params.get("lang") || "all";
  const [level, setLevel] = useState("all");
  const [format, setFormat] = useState("all");
  const [time, setTime] = useState("all");

  const [matchPhase, setMatchPhase] = useState<MatchPhase>("intro");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const rows = useMemo(
    () => coursesLive.map((c) => ({ course: c, facts: courseFacts(c, t) })),
    [coursesLive, t],
  );

  // A filter row only appears when it has more than one real choice.
  const dims = useMemo(() => {
    const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];
    const levelOrder = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true });
    return {
      lang: uniq(rows.map((r) => r.facts.language)),
      level: uniq(
        rows
          .filter((r) => langFilter === "all" || r.facts.language === langFilter)
          .map((r) => r.facts.levelLabel),
      ).sort(levelOrder),
      format: uniq(rows.map((r) => r.facts.format)),
      time: uniq(rows.map((r) => r.facts.timeOfDay)),
    };
  }, [rows, langFilter]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows
      .filter(({ course: c, facts: f }) => {
        if (langFilter !== "all" && f.language !== langFilter) return false;
        if (level !== "all" && f.levelLabel !== level) return false;
        if (format !== "all" && f.format !== format) return false;
        if (time !== "all" && f.timeOfDay !== time) return false;
        if (!query) return true;
        const hay =
          `${loc(lang, t, c.title, c.titleKey)} ${loc(lang, t, c.body, c.descKey)} ${loc(lang, t, c.tag, c.tagKey)} ${f.levelLabel}`.toLowerCase();
        return hay.includes(query);
      })
      .map((r) => r.course);
  }, [rows, langFilter, level, format, time, q, t, lang]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = langFilter !== "all" || level !== "all" || format !== "all" || time !== "all" || hasQuery;

  function setLang(v: string) {
    const next = new URLSearchParams(params);
    if (v === "all") next.delete("lang");
    else next.set("lang", v);
    setParams(next, { replace: true });
    setLevel("all");
  }

  function clearAll() {
    setLang("all");
    setLevel("all");
    setFormat("all");
    setTime("all");
    setQ("");
  }

  function startMatch() {
    setMatchPhase("ask");
    setMatchResult(null);
    void hapticLight();
  }

  function resetMatch() {
    setMatchPhase("intro");
    setMatchResult(null);
    void hapticLight();
  }

  function answerMatch(done: MatchLevel) {
    setMatchResult(resolveMatch(done));
    setMatchPhase("done");
    void hapticLight();
  }

  return (
    <PageShell className="page-courses is-app ios-app">
      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("courses_title")}</h1>
          <p className="lead">{t("levels_lead")}</p>
          <Link to="/pricing" className="text-link">
            {t("nav_pricing")} <i aria-hidden>→</i>
          </Link>
        </Reveal>
      </header>

      <Reveal>
        <section
          className={`course-match glass-panel course-match-compact${
            matchPhase === "intro" ? " is-intro" : ""
          }`}
        >
          {matchPhase === "intro" ? (
            <div className="course-match-compact-row">
              <span className="course-match-mark" aria-hidden>
                测
              </span>
              <div className="course-match-compact-copy">
                <strong>{t("cmatch_title")}</strong>
                <em>{t("cmatch_lead_short")}</em>
              </div>
              <button
                type="button"
                className="btn btn-seal course-match-start-mini"
                onClick={startMatch}
              >
                <span>{t("cmatch_start")}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="course-match-head">
                <span className="course-match-mark" aria-hidden>
                  测
                </span>
                <div>
                  <strong>{t("cmatch_title")}</strong>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {matchPhase === "ask" && (
                  <motion.div
                    key="ask"
                    className="course-match-ask"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <p className="course-match-q">{t("cmatch_q_level")}</p>
                    <div className="course-match-options">
                      {matchLevels.map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="course-match-opt"
                          onClick={() => answerMatch(n)}
                        >
                          {n === 0 ? t("cmatch_lvl_0") : t("cmatch_lvl_n").replace("{n}", String(n))}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="course-match-reset"
                      onClick={resetMatch}
                    >
                      {t("cmatch_restart")}
                    </button>
                  </motion.div>
                )}

                {matchPhase === "done" && matchResult && (
                  <motion.div
                    key="done"
                    className="course-match-result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <p className="course-match-reason">
                      {t(matchResult.reasonKey)}
                    </p>
                    <div className="course-match-pick">
                      <strong>{t(matchResult.titleKey)}</strong>
                      <em>{t(matchResult.descKey)}</em>
                    </div>
                    <div className="course-match-actions">
                      <Link
                        to={`/courses/${matchResult.courseId}`}
                        className="btn btn-seal"
                        onClick={() => void hapticLight()}
                      >
                        <span>{t("view_detail")}</span>
                      </Link>
                      <button
                        type="button"
                        className="course-match-reset"
                        onClick={resetMatch}
                      >
                        {t("cmatch_restart")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </section>
      </Reveal>

      <Reveal>
        <div className="ios-toolbar course-toolbar">
          <label className="ios-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("cmatch_search")}
              autoComplete="off"
            />
            {hasQuery && (
              <button
                type="button"
                className="ios-search-clear"
                onClick={() => setQ("")}
                aria-label={t("news_clear")}
              >
                ×
              </button>
            )}
          </label>

          <div className="cf">
            {dims.lang.length > 1 && (
              <FilterRow
                label={t("f_lang")}
                value={langFilter}
                onChange={setLang}
                options={dims.lang.map((x) => ({ id: x, label: t(`lang_${x}`) }))}
              />
            )}
            {dims.level.length > 1 && (
              <FilterRow
                label={t("f_level")}
                value={level}
                onChange={setLevel}
                options={dims.level.map((x) => ({ id: x, label: x }))}
              />
            )}
            {dims.format.length > 1 && (
              <FilterRow
                label={t("f_format")}
                value={format}
                onChange={setFormat}
                options={dims.format.map((x) => ({ id: x, label: t(`fmt_${x}`) }))}
              />
            )}
            {dims.time.length > 1 && (
              <FilterRow
                label={t("f_time")}
                value={time}
                onChange={setTime}
                options={dims.time.map((x) => ({ id: x, label: t(`tod_${x}`) }))}
              />
            )}
            {isFiltered && (
              <button type="button" className="cf-clear" onClick={clearAll}>
                {t("news_clear")}
              </button>
            )}
          </div>
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          langFilter === "pl" && !rows.some((r) => r.facts.language === "pl") ? (
            <div className="cf-empty">
              <span className="cf-empty-mark" aria-hidden>
                Ą
              </span>
              <p>{t("courses_pl_empty")}</p>
              <Link to="/contact" className="btn btn-seal">
                <span>{t("courses_contact")}</span>
              </Link>
              <button type="button" className="cf-clear" onClick={clearAll}>
                {t("mh_quick_zh")} →
              </button>
            </div>
          ) : (
            <p className="ios-empty">{isFiltered ? t("courses_empty_filter") : t("cmatch_empty")}</p>
          )
        ) : (
          <Stagger className="course-product-grid">
            {list.map((c) => (
              <StaggerItem key={c.id}>
                <Link
                  to={`/courses/${c.id}`}
                  className="course-product-card"
                  onClick={() => void hapticLight()}
                >
                  <div className="course-product-media">
                    <SafeImage
                      src={c.image}
                      alt={loc(lang, t, c.title, c.titleKey)}
                      loading="lazy"
                    />
                  </div>
                  <div className="course-product-body">
                    <h3>{loc(lang, t, c.title, c.titleKey)}</h3>
                    <p>{c.sumKey ? t(c.sumKey) : loc(lang, t, c.body, c.descKey)}</p>
                    <CourseFactsLine course={c} />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </PageShell>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  const { t } = useI18n();
  return (
    <div className="cf-row" role="group" aria-label={label}>
      <span className="cf-label">{label}</span>
      <div className="cf-chips">
        {[{ id: "all", label: t("f_all") }, ...options].map((o) => (
          <button
            key={o.id}
            type="button"
            className={`cf-chip${value === o.id ? " is-on" : ""}`}
            aria-pressed={value === o.id}
            onClick={() => {
              onChange(o.id);
              void hapticLight();
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Start date · length · price, plus seats left — the facts people choose by. */
function CourseFactsLine({ course }: { course: CourseLive }) {
  const { t, lang } = useI18n();
  const f = courseFacts(course, t);
  const start = course.startDate && isEnrolling(course) ? t("mh_starts").replace("{d}", shortDate(course.startDate, lang)) : "";
  const chips = [f.levelLabel, f.format === "online" ? t("fmt_online") : "", f.timeOfDay ? t(`tod_${f.timeOfDay}`) : ""].filter(Boolean);
  const line = [start, f.duration, f.priceText].filter(Boolean).join(" · ");
  return (
    <span className="cp-facts">
      {chips.length > 0 && (
        <span className="cp-chips">
          {chips.map((c) => (
            <i key={c}>{c}</i>
          ))}
          {course.seatsLeft != null && (
            <i className={`cp-seats${course.seatsLeft <= 3 ? " is-low" : ""}`}>
              {course.seatsLeft <= 0 ? t("mh_full") : t("mh_seats_left").replace("{n}", String(course.seatsLeft))}
            </i>
          )}
        </span>
      )}
      {line && <strong className="cp-line">{line}</strong>}
    </span>
  );
}
