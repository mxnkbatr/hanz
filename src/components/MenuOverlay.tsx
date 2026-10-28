import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { useAuth } from "../lib/AuthContext";
import { hapticLight } from "../lib/native";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import { ease, navSpring } from "../lib/motion";

/** Menu entries in reading order, each with a preview photo for the desktop panel. */
const LINKS = [
  { to: "/", key: "nav_home", img: "/images/hero-wall.webp" },
  { to: "/courses", key: "nav_courses", img: "/courses/image12.webp" },
  { to: "/university", key: "nav_uni", img: "/images/hero-palace.webp" },
  { to: "/travel", key: "nav_travel", img: "/courses/image16.webp" },
  { to: "/medee", key: "nav_news", img: "/courses/image14.webp" },
  { to: "/shop", key: "nav_shop", img: "/images/shop-hero.webp" },
  { to: "/quiz", key: "nav_quiz", img: "/images/hero-hanz.webp" },
  { to: "/about", key: "nav_about", img: "/courses/image15.webp" },
  { to: "/translation", key: "nav_translation", img: "/courses/image4.webp" },
  { to: "/contact", key: "nav_contact", img: "/courses/image11.webp" },
] as const;

type Props = { open: boolean; onClose: () => void };

/**
 * Full-screen menu: a paper curtain opens from the menu button,
 * big numbered links rise in, and (desktop) a photo previews each section.
 */
export function MenuOverlay({ open, onClose }: Props) {
  const { t, lang, setLang, langs } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const curtain = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { clipPath: "circle(0% at calc(100% - 3rem) 2.6rem)" },
        animate: { clipPath: "circle(150% at calc(100% - 3rem) 2.6rem)" },
        exit: { clipPath: "circle(0% at calc(100% - 3rem) 2.6rem)" },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu-overlay"
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu_title")}
          {...curtain}
          transition={{ duration: reduce ? 0.15 : 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="menu-overlay-mark" aria-hidden>
            汉
          </span>

          <div className="menu-overlay-inner">
            <nav className="menu-links" aria-label={t("menu_title")}>
              {LINKS.map((item, i) => (
                <div className="menu-link-row" key={item.to}>
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{
                      delay: reduce ? 0 : 0.25 + i * 0.045,
                      duration: 0.7,
                      ease,
                    }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        `menu-link${isActive ? " is-active" : ""}`
                      }
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onClick={() => {
                        onClose();
                        void hapticLight();
                      }}
                    >
                      <span className="menu-link-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="menu-link-label">{t(item.key)}</span>
                      <i aria-hidden>→</i>
                    </NavLink>
                  </motion.div>
                </div>
              ))}
            </nav>

            <motion.aside
              className="menu-side"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: reduce ? 0 : 0.45, duration: 0.6, ease }}
            >
              <div className="menu-preview" aria-hidden>
                <AnimatePresence initial={false}>
                  <motion.img
                    key={LINKS[hover].img}
                    src={LINKS[hover].img}
                    alt=""
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  />
                </AnimatePresence>
                <span className="menu-preview-label">{t(LINKS[hover].key)}</span>
              </div>

              <NavLink
                to="/enroll"
                className="btn btn-seal menu-cta"
                onClick={onClose}
              >
                <span>{t("register_cta")}</span>
                <i aria-hidden>→</i>
              </NavLink>

              <div className="menu-contact">
                <a href={`tel:${academy.phoneRaw[0]}`}>{academy.phone[0]}</a>
                <a href={`mailto:${academy.email}`}>{academy.email}</a>
                <div className="menu-social">
                  <a href={academy.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                  <a href={academy.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                  <a href={academy.messenger} target="_blank" rel="noopener noreferrer">
                    Messenger
                  </a>
                </div>
              </div>

              <div className="menu-foot">
                <LayoutGroup id="menu-lang">
                  <div className="menu-lang" role="tablist" aria-label={t("profile_lang")}>
                    {langs.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        role="tab"
                        aria-selected={lang === l.code}
                        className={lang === l.code ? "is-active" : ""}
                        onClick={() => setLang(l.code)}
                      >
                        {lang === l.code && (
                          <motion.span
                            className="menu-lang-pill"
                            layoutId="menu-lang-pill"
                            transition={navSpring}
                          />
                        )}
                        <span>{l.short}</span>
                      </button>
                    ))}
                  </div>
                </LayoutGroup>
                <NavLink
                  to={user ? "/profile" : "/auth?mode=login"}
                  className="menu-account"
                  onClick={onClose}
                >
                  {user ? t("nav_profile") : t("auth_login")}
                </NavLink>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
