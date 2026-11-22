import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";

const rise = (delay: number, reduce: boolean | null) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      };

/**
 * Desktop home banner (client, 2026-11-22): white and calm, in the same system as
 * the rest of the site. Promise, two actions and three trust points on the left;
 * one framed photo with a single number on the right.
 */
export function HomeBanner() {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const reduce = useReducedMotion();

  return (
    <section className="hb" aria-labelledby="hb-title">
      <div className="hb-copy">
        <motion.p className="hb-eyebrow" {...rise(0.05, reduce)}>
          <span className="hb-eyebrow-dot" aria-hidden />
          {t("hb_eyebrow")}
        </motion.p>
        <motion.h1 id="hb-title" className="hb-title" {...rise(0.12, reduce)}>
          {t("hd_line1")} <em>{t("hd_line2")}</em>
        </motion.h1>
        <motion.p className="hb-lead" {...rise(0.2, reduce)}>
          {t("hero_kicker")}
        </motion.p>
        <motion.div className="hb-actions" {...rise(0.28, reduce)}>
          <Link to="/enroll?interest=hsk" className="hb-btn is-primary">
            {t("register_cta")}
            <span aria-hidden>→</span>
          </Link>
          <Link to="/courses" className="hb-btn is-secondary">
            {t("hd_programs")}
          </Link>
        </motion.div>
        <motion.ul className="hb-points" {...rise(0.36, reduce)}>
          {(["hb_p1", "hb_p2", "hb_p3"] as const).map((k) => (
            <li key={k}>
              <span className="hb-check" aria-hidden>
                ✓
              </span>
              {t(k)}
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.figure
        className="hb-media"
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0, scale: 0.98 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            })}
      >
        <img src="/images/hero-wall.webp" alt="" width={1200} height={800} fetchPriority="high" />
        <span className="hb-tag">{t("hb_photo_tag")}</span>
        <figcaption className="hb-stat">
          <strong>{academy.graduates}</strong>
          <span>{t("stat_students")}</span>
        </figcaption>
      </motion.figure>
    </section>
  );
}
