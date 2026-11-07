import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  optionLabel,
  quizLevels,
  shuffleIndices,
  type QuizLevel,
  type QuizQuestion,
} from "../data/quiz";
import { quizPassages, quizTests, type QuizTestId } from "../data/quizTests";
import { PageShell, Reveal } from "../components/PageShell";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight, hapticMedium, hapticSuccess } from "../lib/native";
import { ease } from "../lib/motion";

type Phase = "pick" | "play" | "done";

const HEARTS_MAX = 3;
const XP_HIT = 10;
const XP_STREAK_BONUS = 5;

/** A word card, or a question from one of the 50-question tests. */
type PlayQuestion = QuizQuestion & { text?: boolean; part?: string; passage?: string };

type PlayState = {
  pool: PlayQuestion[];
  /** A 50-question test: fixed order, and mistakes don't end it. */
  test: boolean;
  order: number[];
  index: number;
  score: number;
  xp: number;
  hearts: number;
  streak: number;
  bestStreak: number;
  picked: number | null;
  locked: boolean;
  optionOrder: number[];
  endedByHearts: boolean;
};

const LEVEL_GLYPH: Record<QuizLevel, string> = {
  hsk1: "一",
  hsk2: "二",
  hsk3: "三",
};

const TESTS: { id: QuizTestId; badge: string; titleKey: string; glyph: string }[] = [
  { id: "hsk1", badge: "HSK1", titleKey: "quiz_test_hsk", glyph: "一" },
  { id: "hsk2", badge: "HSK2", titleKey: "quiz_test_hsk", glyph: "二" },
  { id: "hsk3", badge: "HSK3", titleKey: "quiz_test_hsk", glyph: "三" },
  { id: "hsk4", badge: "HSK4", titleKey: "quiz_test_hsk", glyph: "四" },
  { id: "hsk5", badge: "HSK5", titleKey: "quiz_test_hsk", glyph: "五" },
  { id: "hsk6", badge: "HSK6", titleKey: "quiz_test_hsk", glyph: "六" },
  { id: "applied", badge: "HSK", titleKey: "quiz_test_applied", glyph: "用" },
  { id: "business", badge: "HSK", titleKey: "quiz_test_business", glyph: "商" },
];

function testPool(id: QuizTestId): PlayQuestion[] {
  return quizTests[id].map((q, i) => ({
    id: `test-${id}-${i + 1}`,
    level: "hsk1",
    kind: "meaning",
    text: true,
    hanzi: q.prompt,
    pinyin: "",
    part: q.part,
    passage: q.passage === undefined ? undefined : quizPassages[q.passage],
    options: q.options.map((o) => ({ mn: o, en: o, zh: o })),
    correct: q.correct,
  }));
}

function buildPlay(pool: PlayQuestion[], test: boolean): PlayState {
  const order = test ? pool.map((_, i) => i) : shuffleIndices(pool.length);
  const first = pool[order[0]];
  return {
    pool,
    test,
    order,
    index: 0,
    score: 0,
    xp: 0,
    hearts: HEARTS_MAX,
    streak: 0,
    bestStreak: 0,
    picked: null,
    locked: false,
    optionOrder: shuffleIndices(first?.options.length ?? 0),
    endedByHearts: false,
  };
}

export function Quiz() {
  const { t, lang } = useI18n();
  const { quizQuestionsLive } = useSiteContent();
  const [phase, setPhase] = useState<Phase>("pick");
  const [level, setLevel] = useState<QuizLevel | null>(null);
  const [testId, setTestId] = useState<QuizTestId | null>(null);
  const [play, setPlay] = useState<PlayState | null>(null);

  const question: PlayQuestion | null = useMemo(() => {
    if (phase !== "play" || !play) return null;
    return play.pool[play.order[play.index]] ?? null;
  }, [phase, play]);

  const total = play?.pool.length ?? 0;
  const progress =
    phase === "play" && play
      ? ((play.index + (play.locked ? 1 : 0)) / Math.max(total, 1)) * 100
      : phase === "done"
        ? 100
        : 0;

  const isCorrect =
    play && play.picked !== null && question
      ? play.optionOrder[play.picked] === question.correct
      : false;

  function startLevel(next: QuizLevel) {
    const pool = quizQuestionsLive as QuizQuestion[];
    if (!pool.some((q) => q.level === next)) return;
    setLevel(next);
    setTestId(null);
    setPlay(buildPlay(pool.filter((q) => q.level === next), false));
    setPhase("play");
    void hapticLight();
  }

  function startTest(id: QuizTestId) {
    setTestId(id);
    setLevel(null);
    setPlay(buildPlay(testPool(id), true));
    setPhase("play");
    void hapticLight();
  }

  function pick(optionIdx: number) {
    if (!question || !play || play.locked) return;
    const real = play.optionOrder[optionIdx];
    const ok = real === question.correct;
    const streak = ok ? play.streak + 1 : 0;
    const bonus = ok && streak >= 3 ? XP_STREAK_BONUS : 0;
    const xpGain = ok ? XP_HIT + bonus : 0;
    const hearts = ok || play.test ? play.hearts : Math.max(0, play.hearts - 1);

    setPlay({
      ...play,
      picked: optionIdx,
      locked: true,
      score: ok ? play.score + 1 : play.score,
      xp: play.xp + xpGain,
      hearts,
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
    });

    if (ok) void hapticSuccess();
    else void hapticMedium();
  }

  function next() {
    if (!play) return;

    if (play.hearts <= 0) {
      setPlay({ ...play, endedByHearts: true });
      setPhase("done");
      return;
    }

    if (play.index + 1 >= total) {
      setPhase("done");
      return;
    }

    const nextIndex = play.index + 1;
    const nextQ = play.pool[play.order[nextIndex]];
    setPlay({
      ...play,
      index: nextIndex,
      picked: null,
      locked: false,
      optionOrder: shuffleIndices(nextQ.options.length),
    });
    void hapticLight();
  }

  function backToLevels() {
    setPhase("pick");
    setLevel(null);
    setTestId(null);
    setPlay(null);
  }

  const score = play?.score ?? 0;
  const resultKey = play?.endedByHearts
    ? "quiz_out_hearts"
    : score >= Math.ceil(total * 0.85)
      ? "quiz_level_great"
      : score >= Math.ceil(total * 0.6)
        ? "quiz_level_good"
        : "quiz_level_start";

  const testMeta = TESTS.find((x) => x.id === testId);
  const levelMeta = testMeta
    ? { badge: testMeta.id === "applied" || testMeta.id === "business" ? t(testMeta.titleKey) : testMeta.badge }
    : quizLevels.find((l) => l.id === level);
  const lastXpGain =
    play && isCorrect
      ? XP_HIT + (play.streak >= 3 ? XP_STREAK_BONUS : 0)
      : 0;

  return (
    <PageShell
      className={`page-quiz is-app ios-app quiz-game${phase !== "pick" ? " is-playing" : ""}`}
    >
      {phase === "pick" && (
        <header className="page-head app-head quiz-game-head">
          <Reveal>
            <p className="eyebrow desk-only">{t("nav_quiz")}</p>
            <h1 className="h1">{t("quiz_title")}</h1>
            <p className="lead desk-only">{t("quiz_lead")}</p>
          </Reveal>
        </header>
      )}

      <div className="quiz-shell">
        {(phase === "play" || phase === "done") && play && (
          <div className="quiz-hud">
            <button
              type="button"
              className="quiz-hud-close"
              onClick={backToLevels}
              aria-label={t("quiz_close")}
            >
              ×
            </button>

            <div className="quiz-progress" aria-hidden>
              <motion.span
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease }}
              />
            </div>

            <div className="quiz-hud-stats">
              {!play.test && <div className="quiz-hearts" aria-label={t("quiz_out_hearts")}>
                {Array.from({ length: HEARTS_MAX }, (_, i) => (
                  <motion.span
                    key={i}
                    className={i < play.hearts ? "is-on" : "is-off"}
                    animate={
                      i < play.hearts
                        ? { scale: 1 }
                        : { scale: 0.85, opacity: 0.35 }
                    }
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  >
                    ♥
                  </motion.span>
                ))}
              </div>}
              <div className="quiz-xp-pill">
                <em>{play.xp}</em>
                <span>{t("quiz_xp")}</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.div
              key="pick"
              className="quiz-pick"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease }}
            >
              <div className="quiz-pick-hero">
                <div className="quiz-brand" aria-hidden>
                  <span>汉</span>
                </div>
                <div className="quiz-pick-meta">
                  <span>{t("quiz_xp")} +10</span>
                  <span>♥ ×{HEARTS_MAX}</span>
                  <span>{t("quiz_streak")}</span>
                </div>
              </div>

              <section className="quiz-pick-group">
                <header className="quiz-pick-group-head">
                  <h2>{t("quiz_pick_t")}</h2>
                  <p>{t("quiz_pick_d")}</p>
                </header>

                <div className="quiz-levels">
                  {quizLevels.map((lvl, i) => (
                    <motion.button
                      key={lvl.id}
                      type="button"
                      className={`quiz-level-card quiz-level-${lvl.id}`}
                      onClick={() => startLevel(lvl.id)}
                      whileTap={{ scale: 0.985 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.26, ease }}
                    >
                      <span className="quiz-level-glyph" aria-hidden>
                        {LEVEL_GLYPH[lvl.id]}
                      </span>
                      <span className="quiz-level-body">
                        <span className="quiz-level-badge">{lvl.badge}</span>
                        <strong>{t(lvl.titleKey)}</strong>
                        <em>{t(lvl.descKey)}</em>
                      </span>
                      <span className="quiz-level-trail">
                        <span className="quiz-level-play">{t("quiz_start")}</span>
                        <span className="quiz-level-chevron" aria-hidden>
                          ›
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>

              <section className="quiz-pick-group">
                <header className="quiz-pick-group-head">
                  <h2>{t("quiz_tests_t")}</h2>
                  <p>{t("quiz_tests_d")}</p>
                </header>

                <div className="quiz-levels">
                  {TESTS.map((x, i) => (
                    <motion.button
                      key={x.id}
                      type="button"
                      className={`quiz-level-card quiz-test-card quiz-test-${x.id}`}
                      onClick={() => startTest(x.id)}
                      whileTap={{ scale: 0.985 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.26, ease }}
                    >
                      <span className="quiz-level-glyph" aria-hidden>
                        {x.glyph}
                      </span>
                      <span className="quiz-level-body">
                        <span className="quiz-level-badge">{x.badge}</span>
                        <strong>{t(x.titleKey)}</strong>
                        <em>{t("quiz_test_count")}</em>
                      </span>
                      <span className="quiz-level-trail">
                        <span className="quiz-level-play">{t("quiz_start")}</span>
                        <span className="quiz-level-chevron" aria-hidden>
                          ›
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {phase === "play" && question && play && (
            <motion.div
              key={question.id}
              className="quiz-panel quiz-play"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="quiz-meta">
                <span>
                  {play.index + 1}/{total}
                </span>
                {play.streak >= 2 ? (
                  <motion.em
                    className="quiz-streak-chip"
                    key={play.streak}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 16 }}
                  >
                    🔥 {play.streak} {t("quiz_combo")}
                  </motion.em>
                ) : (
                  <em>
                    {question.text
                      ? t("quiz_test_label")
                      : question.kind === "pinyin"
                        ? t("quiz_ask_pinyin")
                        : t("quiz_ask_meaning")}
                  </em>
                )}
              </div>

              {question.passage && <p className="quiz-passage">{question.passage}</p>}

              <motion.div
                className={`quiz-prompt${question.text ? " is-text" : ""}`}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                {question.text && question.part && <small>{question.part}</small>}
                <strong>{question.hanzi}</strong>
                {!question.text && question.kind === "meaning" && <span>{question.pinyin}</span>}
              </motion.div>

              <div className={`quiz-options${question.text ? " is-text" : ""}`} role="group">
                {play.optionOrder.map((realIdx, i) => {
                  const opt = question.options[realIdx];
                  let state = "";
                  if (play.locked) {
                    if (realIdx === question.correct) state = " is-correct";
                    else if (i === play.picked) state = " is-wrong";
                    else state = " is-dim";
                  }
                  return (
                    <motion.button
                      key={`${question.id}-${realIdx}`}
                      type="button"
                      className={`quiz-option${state}`}
                      disabled={play.locked}
                      onClick={() => pick(i)}
                      whileTap={play.locked ? undefined : { scale: 0.96 }}
                      animate={
                        state === " is-wrong"
                          ? { x: [0, -8, 8, -6, 6, 0] }
                          : state === " is-correct"
                            ? { scale: [1, 1.04, 1] }
                            : { x: 0, scale: 1 }
                      }
                      transition={{ duration: 0.38 }}
                    >
                      <i aria-hidden>{String.fromCharCode(65 + i)}</i>
                      <span>{optionLabel(opt, lang)}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {play.locked && (
                  <motion.div
                    className={`quiz-dock${isCorrect ? " is-ok" : " is-bad"}`}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  >
                    <div className="quiz-dock-copy">
                      <strong>
                        {isCorrect ? t("quiz_correct") : t("quiz_wrong")}
                        {isCorrect && lastXpGain > 0 ? ` +${lastXpGain} ${t("quiz_xp")}` : ""}
                      </strong>
                      {!isCorrect && (
                        <p>
                          {t("quiz_answer_was")}:{" "}
                          {optionLabel(question.options[question.correct], lang)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="quiz-primary"
                      onClick={next}
                    >
                      {play.hearts <= 0 || play.index + 1 >= total
                        ? t("quiz_finish")
                        : t("quiz_continue")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "done" && play && (
            <motion.div
              key="done"
              className="quiz-panel quiz-done"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease }}
            >
              <motion.div
                className="quiz-done-burst"
                aria-hidden
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
              >
                {play.endedByHearts ? "💔" : "🎉"}
              </motion.div>

              <div
                className="quiz-score-ring"
                style={
                  {
                    "--quiz-pct": `${total ? Math.round((score / total) * 100) : 0}%`,
                  } as CSSProperties
                }
                aria-hidden
              >
                <strong>
                  {score}/{total}
                </strong>
              </div>

              <h2>{t(resultKey)}</h2>
              <p>
                {play.endedByHearts
                  ? t("quiz_out_hearts_d")
                  : levelMeta
                    ? `${levelMeta.badge} · ${t("quiz_done_d")}`
                    : t("quiz_done_d")}
              </p>

              <div className="quiz-done-stats">
                <div>
                  <strong>{play.xp}</strong>
                  <span>{t("quiz_earned")}</span>
                </div>
                <div>
                  <strong>{play.bestStreak}</strong>
                  <span>{t("quiz_best_streak")}</span>
                </div>
              </div>

              <div className="quiz-done-actions">
                {(level || testId) && (
                  <button
                    type="button"
                    className="quiz-primary"
                    onClick={() => (testId ? startTest(testId) : level && startLevel(level))}
                  >
                    {t("quiz_retry")}
                  </button>
                )}
                <button
                  type="button"
                  className="quiz-secondary"
                  onClick={backToLevels}
                >
                  {t("quiz_change_level")}
                </button>
                <Link to="/enroll" className="quiz-secondary">
                  {t("register_cta")}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
