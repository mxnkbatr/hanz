import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { ease } from "../lib/motion";
import { MagneticButton } from "./MagneticButton";
import { ParticleGlyph } from "./ParticleGlyph";
import { RotatingSeal } from "./RotatingSeal";

/** The three characters the particles form while you scroll, with pinyin and meaning. */
const GLYPHS = [
  { ch: "汉", pinyin: "hàn", key: "hero_glyph_han" },
  { ch: "字", pinyin: "zì", key: "hero_glyph_zi" },
  { ch: "学", pinyin: "xué", key: "hero_glyph_xue" },
] as const;

/**
 * Desktop hero: a dark stage where thousands of points gather into 汉, scatter
 * from the pointer, and re-form into 字 and 学 as you scroll (ParticleGlyph).
 * The section is taller than the screen with a sticky stage; in the last part of
 * the scroll the stage settles into a rounded frame and the copy lifts away.
 * Only transform/opacity animate on the page; the particles are one canvas.
 */
export function DesktopHero({ ready }: { ready: boolean }) {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [glyphIndex, setGlyphIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // 汉 for the first third of the scroll, then 字, then 学.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = p < 0.28 ? 0 : p < 0.56 ? 1 : 2;
    setGlyphIndex((cur) => (cur === next ? cur : next));
  });

  const frameScale = useTransform(progress, [0.72, 1], [1, 0.86]);
  const copyY = useTransform(progress, [0.72, 1], ["0%", "-28%"]);
  const copyOpacity = useTransform(progress, [0.72, 1], [1, 0]);
  const metaY = useTransform(progress, [0.72, 1], [0, 30]);

  // The stats fade in after the intro and fade out at the end; both drive one opacity.
  const metaIntro = useMotionValue(0);
  const metaOpacity = useTransform([metaIntro, progress], ([intro, p]: number[]) =>
    intro * (p < 0.72 ? 1 : Math.max(0, 1 - (p - 0.72) / 0.28)),
  );

  useEffect(() => {
    if (!ready) return;
    const fade = animate(metaIntro, 1, { delay: 2.2, duration: 1 });
    return () => fade.stop();
  }, [ready, metaIntro]);

  const glyph = GLYPHS[glyphIndex];
  const lines = [
    { text: t("hd_line1") },
    { text: t("hd_line2"), accent: true },
    { text: t("hd_line3") },
  ];
  const beat = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    transition: { delay, duration: 1, ease },
  });

  return (
    <section className="cine cine-particles" ref={root}>
      <div className="cine-stage">
        <motion.div className="cine-frame" style={reduce ? undefined : { scale: frameScale }}>
          <div className="pglyph-bg" aria-hidden />
          {/* Reduced motion draws one still frame, so a new glyph remounts it. */}
          <ParticleGlyph key={reduce ? glyph.ch : "live"} glyph={glyph.ch} still={Boolean(reduce)} />
        </motion.div>

        {/* Pinyin + meaning of the character on screen */}
        <div className="pglyph-caption" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={glyph.ch}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease }}
            >
              <span lang="zh">{glyph.ch}</span>
              <em>{glyph.pinyin}</em>
              <i aria-hidden />
              <strong>{t(glyph.key)}</strong>
            </motion.p>
          </AnimatePresence>
          <ol className="pglyph-steps" aria-hidden>
            {GLYPHS.map((g, i) => (
              <li key={g.ch} className={i === glyphIndex ? "is-on" : undefined} />
            ))}
          </ol>
        </div>

        {/* Letterbox: two bars that pull away once the intro is done. */}
        <motion.span
          className="cine-bar is-top"
          aria-hidden
          initial={{ scaleY: 1 }}
          animate={ready ? { scaleY: 0 } : { scaleY: 1 }}
          transition={{ delay: 0.15, duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.span
          className="cine-bar is-bottom"
          aria-hidden
          initial={{ scaleY: 1 }}
          animate={ready ? { scaleY: 0 } : { scaleY: 1 }}
          transition={{ delay: 0.15, duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
        />

        <motion.div className="cine-copy" style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
          <motion.p className="cine-eyebrow" {...beat(0.9)}>
            <span>{t("hero_eyebrow")}</span>
            <i aria-hidden />
            <span>2014</span>
          </motion.p>

          <h1 className="cine-title" aria-label={lines.map((l) => l.text).join(" ")}>
            {lines.map((line, i) => (
              <span key={i} className="cine-line" aria-hidden>
                <motion.span
                  className={line.accent ? "cine-accent" : undefined}
                  initial={{ y: "110%" }}
                  animate={ready ? { y: "0%" } : { y: "110%" }}
                  transition={{ delay: 1 + i * 0.16, duration: 1.3, ease }}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="cine-lead" {...beat(1.6)}>
            {t("hero_kicker")}
          </motion.p>

          <motion.div className="cine-cta" {...beat(1.8)}>
            <MagneticButton
              href={academy.registerUrl}
              className="btn btn-seal cine-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <i aria-hidden>→</i>
            </MagneticButton>
            <Link to="/courses" className="cine-ghost">
              <span>{t("hd_programs")}</span>
              <i aria-hidden>↓</i>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="cine-meta" style={reduce ? { opacity: metaIntro } : { y: metaY, opacity: metaOpacity }}>
          <dl>
            <div>
              <dt>{academy.graduates || "7300+"}</dt>
              <dd>{t("stat_students")}</dd>
            </div>
            <div>
              <dt>{academy.partnerUniversities || "300+"}</dt>
              <dd>{t("stat_unis")}</dd>
            </div>
          </dl>
          <RotatingSeal className="cine-seal" />
        </motion.div>

        <motion.div
          className="cine-scroll"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ delay: 2.6, duration: 0.8 }}
        >
          <i />
        </motion.div>
      </div>
    </section>
  );
}
