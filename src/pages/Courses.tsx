import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  courseFilters,
  filterKeyLabel,
  matchLevels,
  resolveMatch,
  type CourseFilter,
  type MatchLevel,
  type MatchResult,
} from "../data/courseMatch";
import { IosFilterBar } from "../components/IosFilterBar";
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
  const [filter, setFilter] = useState<CourseFilter>("all");

  const [matchPhase, setMatchPhase] = useState<MatchPhase>("intro");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: coursesLive.length };
    for (const c of coursesLive) {
      map[c.filter] = (map[c.filter] || 0) + 1;
    }
    return map;
  }, [coursesLive]);

  const list = useMemo(() => {
    const base =
      filter === "all"
        ? coursesLive
        : coursesLive.filter((c) => c.filter === filter);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((c) => {
      const hay =
        `${loc(lang, t, c.title, c.titleKey)} ${loc(lang, t, c.body, c.descKey)} ${loc(lang, t, c.tag, c.tagKey)} ${c.unitKey ? t(c.unitKey) : ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [coursesLive, filter, q, t, lang]);

  const hasQuery = q.trim().length > 0;
  const isFiltered = filter !== "all" || hasQuery;

  const filterOptions = useMemo(
    () =>
      courseFilters.map((f) => ({
        id: f,
        label: t(filterKeyLabel(f)),
        count: counts[f] ?? 0,
      })),
    [counts, t],
  );

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

          <IosFilterBar
            options={filterOptions}
            value={filter}
            onChange={(id) => setFilter(id as CourseFilter)}
            ariaLabel={t("cmatch_filter_label")}
            layoutId="course-filter-pill"
            showClear={isFiltered}
            clearLabel={t("news_clear")}
            onClear={() => {
              setFilter("all");
              setQ("");
            }}
          />
        </div>
      </Reveal>

      <section className="section tight section-last">
        {list.length === 0 ? (
          <p className="ios-empty">{t("cmatch_empty")}</p>
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
                    <em>
                      {t("view_detail")} <i aria-hidden>→</i>
                    </em>
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
