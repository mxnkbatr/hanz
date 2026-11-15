import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  matchLevels,
  resolveMatch,
  type MatchLevel,
  type MatchResult,
} from "../data/courseMatch";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type Phase = "ask" | "done";

/** Standalone “which course fits you” flow — linked from /courses, not embedded there. */
export function CourseMatch() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("ask");
  const [result, setResult] = useState<MatchResult | null>(null);

  function reset() {
    setPhase("ask");
    setResult(null);
    void hapticLight();
  }

  function answer(level: MatchLevel) {
    setResult(resolveMatch(level));
    setPhase("done");
    void hapticLight();
  }

  return (
    <PageShell className="page-courses page-course-match is-app ios-app">
      <Reveal>
        <Link to="/courses" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <header className="page-head app-head">
        <Reveal>
          <h1 className="h1">{t("cmatch_title")}</h1>
          <p className="lead">{t("cmatch_lead_short")}</p>
        </Reveal>
      </header>

      <Reveal>
        <section className="course-match glass-panel">
          <AnimatePresence mode="wait">
            {phase === "ask" && (
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
                      onClick={() => answer(n)}
                    >
                      {n === 0
                        ? t("cmatch_lvl_0")
                        : t("cmatch_lvl_n").replace("{n}", String(n))}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "done" && result && (
              <motion.div
                key="done"
                className="course-match-result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease }}
              >
                <p className="course-match-reason">{t(result.reasonKey)}</p>
                <div className="course-match-pick">
                  <strong>{t(result.titleKey)}</strong>
                  <em>{t(result.descKey)}</em>
                </div>
                <div className="course-match-actions">
                  <Link
                    to={`/courses/${result.courseId}`}
                    className="btn btn-seal"
                    onClick={() => void hapticLight()}
                  >
                    <span>{t("view_detail")}</span>
                  </Link>
                  <button type="button" className="course-match-reset" onClick={reset}>
                    {t("cmatch_restart")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </Reveal>
    </PageShell>
  );
}
