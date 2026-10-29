import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { ease } from "../lib/motion";
import { MagneticButton } from "./MagneticButton";
import { SafeImage } from "./SafeImage";
import { RotatingSeal } from "./RotatingSeal";

const HERO_VIDEO = "/videos/hero-banner.mp4";
const SLIDE_MS = 5600;

/**
 * Desktop hero: full-bleed film behind a three-line serif headline,
 * with a glass "featured" card cycling through courses and trips.
 */
export function DesktopHero({ ready }: { ready: boolean }) {
  const { t, lang } = useI18n();
  const { academyLive: academy, coursesLive, travelLive } = useSiteContent();
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const copyY = useTransform(scrollYProgress, [0, 0.7], ["0%", "-12%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const slides = useMemo(
    () => [
      ...coursesLive.slice(0, 3).map((c) => ({
        id: `c-${c.id}`,
        to: `/courses/${c.id}`,
        image: c.image,
        chip: loc(lang, t, c.tag, c.tagKey),
        kind: t("mh_kind_course"),
        title: loc(lang, t, c.title, c.titleKey),
        meta: t(c.unitKey),
      })),
      ...travelLive.slice(0, 2).map((tr) => ({
        id: `t-${tr.id}`,
        to: `/travel/${tr.id}`,
        image: tr.image,
        chip: loc(lang, t, tr.tag, tr.tagKey),
        kind: t("mh_kind_travel"),
        title: loc(lang, t, tr.title, tr.titleKey),
        meta: tr.duration ? loc(lang, t, tr.duration) : t("mh_kind_travel"),
      })),
    ],
    [coursesLive, travelLive, lang, t],
  );

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

  useEffect(() => {
    if (paused || reduce || slides.length < 2) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      SLIDE_MS,
    );
    return () => window.clearTimeout(id);
  }, [paused, reduce, index, slides.length]);

  const slide = slides[index % Math.max(slides.length, 1)];
  const lines = [
    { text: t("hd_line1") },
    { text: t("hd_line2"), accent: true },
    { text: t("hd_line3") },
  ];
  const beat = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { delay, duration: 0.9, ease },
  });

  return (
    <section className="dhero" ref={root}>
      <motion.div
        className="dhero-media"
        style={{ y: mediaY }}
        initial={{ scale: 1.14, opacity: 0.35 }}
        animate={ready ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 2.6, ease: [0.25, 1, 0.5, 1] }}
      >
        <video
          ref={videoRef}
          src={HERO_VIDEO}
          autoPlay={!reduce}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
      </motion.div>
      <div className="dhero-shade" aria-hidden />
      <div className="dhero-grain" aria-hidden />

      <motion.div
        className="dhero-copy"
        style={{ y: copyY, opacity: copyOpacity }}
      >
        <div className="dhero-left">
          <motion.p className="dhero-eyebrow" {...beat(0.3)}>
            <span className="dhero-dot" />
            {t("hero_eyebrow")}
          </motion.p>

          <h1 className="dhero-title" aria-label={lines.map((l) => l.text).join(" ")}>
            {lines.map((line, i) => (
              <span key={i} className="dhero-line" aria-hidden>
                <motion.span
                  className={line.accent ? "dhero-accent" : undefined}
                  initial={{ y: "110%" }}
                  animate={ready ? { y: "0%" } : { y: "110%" }}
                  transition={{ delay: 0.45 + i * 0.18, duration: 1.25, ease }}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="dhero-lead" {...beat(1.1)}>
            {t("hero_kicker")}
          </motion.p>

          <motion.div className="dhero-cta" {...beat(1.3)}>
            <MagneticButton
              href={academy.registerUrl}
              className="btn btn-seal dhero-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("register_cta")}</span>
              <i aria-hidden>→</i>
            </MagneticButton>
            <a className="btn dhero-ghost" href={`tel:${academy.phoneRaw[0]}`}>
              <span>{academy.phone[0]}</span>
            </a>
          </motion.div>
        </div>

        {slide ? (
          <motion.aside
            className="dhero-card"
            aria-label={t("hd_featured")}
            initial={{ opacity: 0, x: 70, rotate: 2 }}
            animate={ready ? { opacity: 1, x: 0, rotate: 0 } : undefined}
            transition={{ delay: 1.7, duration: 1.2, ease }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <RotatingSeal className="dhero-seal" />
            <Link to={slide.to} className="dhero-card-link">
              <span className="dhero-card-media">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={slide.id}
                    className="dhero-card-img"
                    initial={{ opacity: 0, scale: 1.18 }}
                    animate={{ opacity: 1, scale: 1 }}
                    // Old photo stays underneath until the new one has faded in.
                    exit={{ opacity: 0, transition: { delay: 0.9, duration: 0.3 } }}
                    transition={{ duration: 1.2, ease }}
                  >
                    <SafeImage src={slide.image} alt={slide.title} loading="eager" />
                  </motion.span>
                </AnimatePresence>
                <span className="dhero-chips">
                  <em>{slide.chip}</em>
                  <em className="is-seal">{slide.kind}</em>
                </span>
                <span className="dhero-card-meta">{slide.meta}</span>
              </span>

              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={slide.id}
                  className="dhero-card-body"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <small>{t("hd_featured")}</small>
                  <strong>{slide.title}</strong>
                  <span className="dhero-card-go">
                    {t("view")} <i aria-hidden>→</i>
                  </span>
                </motion.span>
              </AnimatePresence>
            </Link>

            <div className="dhero-bars" role="tablist">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={s.title}
                  className={i === index ? "is-active" : i < index ? "is-done" : ""}
                  onClick={() => setIndex(i)}
                >
                  <span
                    key={i === index ? `run-${index}` : "idle"}
                    style={{
                      animationDuration: `${SLIDE_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                </button>
              ))}
            </div>
          </motion.aside>
        ) : null}
      </motion.div>

      <motion.div
        className="dhero-scroll"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 2.6, duration: 0.8 }}
      >
        <span>SCROLL</span>
        <i />
      </motion.div>
    </section>
  );
}
