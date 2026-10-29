import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { navKeys } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { loc } from "../lib/i18nText";
import { ease, navSpring } from "../lib/motion";
import { SafeImage } from "./SafeImage";

const COURSES = "/courses";

/**
 * Desktop header links: a glass highlight slides under whichever link the pointer
 * is on, the current page gets a small red dot, and "Courses" opens a mega panel
 * with every program plus the course-match quiz.
 */
export function DesktopNav() {
  const { t, lang } = useI18n();
  const { coursesLive } = useSiteContent();
  const { pathname } = useLocation();
  const [hover, setHover] = useState<string | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef(0);

  const items = navKeys.filter((item) => item.top);

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  // A short grace period so moving the pointer down into the panel doesn't close it.
  const closeMega = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };

  // Close everything when the route changes (reset during render, not in an effect).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setMegaOpen(false);
    setHover(null);
  }

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <LayoutGroup id="topnav">
      <nav
        className="topnav"
        aria-label={t("nav_main")}
        onMouseLeave={() => setHover(null)}
      >
        {items.map((item) => {
          const isCourses = item.to === COURSES;
          const link = (
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `topnav-link${isActive ? " is-active" : ""}${isCourses && megaOpen ? " is-open" : ""}`
              }
              onMouseEnter={() => setHover(item.to)}
              onFocus={() => setHover(item.to)}
              aria-haspopup={isCourses ? "true" : undefined}
              aria-expanded={isCourses ? megaOpen : undefined}
            >
              {({ isActive }) => (
                <>
                  {hover === item.to && (
                    <motion.span
                      className="topnav-hover"
                      layoutId="nav-hover"
                      transition={navSpring}
                    />
                  )}
                  <span className="topnav-text">
                    {t(item.key)}
                    {isCourses && (
                      <svg className="topnav-chevron" viewBox="0 0 12 12" aria-hidden>
                        <path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {isActive && (
                    <motion.span
                      className="topnav-dot"
                      layoutId="nav-dot"
                      transition={navSpring}
                    />
                  )}
                </>
              )}
            </NavLink>
          );

          if (!isCourses) return <span key={item.to}>{link}</span>;

          return (
            <span
              key={item.to}
              className="topnav-mega-anchor"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              onFocus={openMega}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeMega();
              }}
            >
              {link}
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    className="mega"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.28, ease }}
                  >
                    <div className="mega-list">
                      <Link to="/hsk" className="mega-item">
                        <span className="mega-thumb">
                          <SafeImage src="/courses/image8.webp" alt="" />
                        </span>
                        <span className="mega-copy">
                          <strong>{t("nav_hsk")}</strong>
                          <small>HSK 1–6</small>
                        </span>
                      </Link>
                      {coursesLive.slice(0, 5).map((c) => {
                        const title = loc(lang, t, c.title, c.titleKey);
                        return (
                          <Link key={c.id} to={`/courses/${c.id}`} className="mega-item">
                            <span className="mega-thumb">
                              <SafeImage src={c.image} alt="" />
                            </span>
                            <span className="mega-copy">
                              <strong>{title}</strong>
                              <small>{t(c.unitKey)}</small>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <Link to={COURSES} className="mega-feature">
                      <span className="mega-feature-glyph" aria-hidden>
                        测
                      </span>
                      <strong>{t("hd_match_t")}</strong>
                      <span>{t("hd_match_d")}</span>
                      <em>
                        {t("hd_match_cta")} <i aria-hidden>→</i>
                      </em>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
