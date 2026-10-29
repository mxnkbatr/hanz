import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { cloudPoster, cloudVideo } from "../lib/cloudinary";
import { ease } from "../lib/motion";
import { MagneticButton } from "./MagneticButton";
import { RotatingSeal } from "./RotatingSeal";

// Served from Cloudinary (≈1.5 MB vs 4 MB local); the bundled file stays as a fallback.
const HERO_ID = "hanz/hero-banner";
const HERO_LOCAL = "/videos/hero-banner.mp4";
const HERO_CDN = cloudVideo(HERO_ID);
const HERO_POSTER = cloudPoster(HERO_ID) ?? undefined;

/**
 * Desktop hero, shot like a film opening: letterbox bars pull back, the footage
 * fills the screen under a dark grade, and a serif headline rises line by line.
 * The section is taller than the screen and its stage is sticky, so while you
 * scroll the full-bleed film settles into a rounded frame and the copy lifts away
 * (scroll-linked motion values). Only transform/opacity animate — no layout work.
 */
export function DesktopHero({ ready }: { ready: boolean }) {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Film → frame on scroll, smoothed a little like a scrubbed timeline.
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const frameScale = useTransform(progress, [0, 1], [1, 0.86]);
  const copyY = useTransform(progress, [0, 1], ["0%", "-28%"]);
  const copyOpacity = useTransform(progress, [0, 1], [1, 0]);
  const metaY = useTransform(progress, [0, 1], [0, 30]);
  // The stats fade in after the intro and fade out on scroll; both drive one opacity.
  const metaIntro = useMotionValue(0);
  const metaOpacity = useTransform(
    [metaIntro, progress],
    ([intro, p]: number[]) => intro * (1 - p),
  );

  useEffect(() => {
    if (!ready) return;
    const fade = animate(metaIntro, 1, { delay: 2.2, duration: 1 });
    return () => fade.stop();
  }, [ready, metaIntro]);

  // Keep the film playing only while the tab is visible.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    v.muted = true;
    const play = () => void v.play().catch(() => {});
    const onVis = () => (document.hidden ? v.pause() : play());
    play();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [reduce]);

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
    <section className="cine" ref={root}>
      <div className="cine-stage">
        <motion.div className="cine-frame" style={reduce ? undefined : { scale: frameScale }}>
          <video
            ref={videoRef}
            className="cine-video"
            poster={HERO_POSTER}
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          >
            {HERO_CDN && <source src={HERO_CDN} />}
            <source src={HERO_LOCAL} type="video/mp4" />
          </video>
          <div className="cine-grade" aria-hidden />
        </motion.div>

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

        <motion.div
          className="cine-copy"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
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

        <motion.div
          className="cine-meta"
          style={reduce ? { opacity: metaIntro } : { y: metaY, opacity: metaOpacity }}
        >
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
