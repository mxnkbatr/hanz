import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { navKeys } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { AnimatedOutlet } from "./AnimatedOutlet";
import { DesktopNav } from "./DesktopNav";
import { MobileMenuSheet } from "./MobileMenuSheet";
import { useDesktop } from "../hooks/useDesktop";
import {
  IconClose,
  IconMenu,
  IconMoon,
  IconProfile,
  IconSun,
  NavIcon,
} from "./Icons";
import { Logo } from "./Logo";
import { Onboard } from "./Onboard";
import { FloatingGlyphs } from "./FloatingGlyphs";
import { useAuth } from "../lib/AuthContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";
import { ThemeContext, useSiteTheme } from "../lib/theme";
import { ease, navSpring } from "../lib/motion";

const YEAR = new Date().getFullYear();

export function Layout() {
  const location = useLocation();
  const { t, lang, setLang, langs } = useI18n();
  const { user } = useAuth();
  const { academyLive: academy } = useSiteContent();
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const desktop = useDesktop();
  const [scrolled, setScrolled] = useState(false);
  const [tabCompact, setTabCompact] = useState(false);
  const [onFilm, setOnFilm] = useState(true);
  const [routeTick, setRouteTick] = useState(0);
  const isHome = location.pathname === "/";
  const isAuth = location.pathname.startsWith("/auth");

  useDocumentMeta();

  // Light/dark site theme for the public site only; the admin keeps its own.
  const themeState = useSiteTheme();
  const { theme, toggle: toggleTheme } = themeState;

  // Every route starts at the top (below); stop the browser restoring an old offset on Back.
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setRouteTick((n) => n + 1);
    setTabCompact(false);
    // Re-measure header state (film behind it?) once the new page has painted.
    const raf = requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastY = window.scrollY;
    let queued = 0;
    // At most once per frame: scroll events can fire several times between paints.
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(measure);
    };
    const measure = () => {
      queued = 0;
      const y = window.scrollY;
      // Hysteresis: a gap between on/off so momentum scrolling near the top can't flicker it.
      setScrolled((was) => (was ? y > 6 : y > 24));
      // Clear glass + white type only while the home film is actually behind the
      // header (measured, so it holds while the film shrinks into its frame).
      // The film only exists on the desktop home page; skip the layout read elsewhere.
      const film = filmEl?.isConnected ? filmEl : (filmEl = document.querySelector(".cine-frame"));
      const box = film?.getBoundingClientRect();
      setOnFilm(!!box && box.top < 40 && box.bottom > 96);
      // iOS 26-style: the tab bar shrinks while reading down, returns on the way up.
      if (Math.abs(y - lastY) > 6) {
        setTabCompact(y > lastY && y > 160);
        lastY = y;
      }
    };
    let filmEl: Element | null = null;
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <ThemeContext.Provider value={themeState}>
    <div
      className={`app-shell liquid-shell${isHome ? " is-home" : ""}${
        isAuth ? " is-auth" : ""
      }`}
    >
      <a className="skip-link" href="#main">
        {t("skip_content")}
      </a>

      <div className="ambient" aria-hidden>
        <span className="ambient-wash" />
      </div>
      <FloatingGlyphs />

      <header
        className={`topbar${isHome ? " is-over-hero" : ""}${scrolled ? " is-scrolled" : ""}${
          isHome && onFilm ? " is-on-film" : ""
        }${tabCompact && !menuOpen ? " is-tucked" : ""}`}
      >
        <div className="topbar-stack">
          <div className="topbar-capsule">
            {!reduceMotion && (
              <motion.span
                key={routeTick}
                className="topbar-route-line"
                aria-hidden
                initial={{ scaleX: 0, opacity: 0.9 }}
                animate={{ scaleX: 1, opacity: 0 }}
                transition={{ duration: 0.55, ease }}
              />
            )}

            <NavLink
              to="/"
              className="topbar-brand"
              aria-label={t("nav_home")}
              onClick={() => void hapticLight()}
            >
              <Logo size="sm" />
            </NavLink>

            <DesktopNav />

            <div className="topbar-actions">
              <div className="topbar-tools">
              {desktop && (
                <div className="topbar-lang" role="group" aria-label={t("profile_lang")}>
                  {langs.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      aria-pressed={lang === l.code}
                      className={lang === l.code ? "is-active" : ""}
                      onClick={() => setLang(l.code)}
                    >
                      {l.short}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="topbar-icon-btn theme-toggle"
                aria-label={t(theme === "dark" ? "theme_light" : "theme_dark")}
                title={t(theme === "dark" ? "theme_light" : "theme_dark")}
                onClick={() => {
                  toggleTheme();
                  void hapticLight();
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    style={{ display: "grid" }}
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    {theme === "dark" ? <IconSun /> : <IconMoon />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <NavLink
                to={user ? "/profile" : "/auth?mode=login"}
                className={({ isActive }) =>
                  `topbar-icon-btn${isActive ? " is-active" : ""}`
                }
                aria-label={user ? t("nav_profile") : t("auth_login")}
                onClick={() => void hapticLight()}
              >
                <IconProfile />
              </NavLink>

              {/* Phones only: on desktop every page is in the header or footer. */}
              {!desktop && (
                <button
                  type="button"
                  className={`topbar-icon-btn topbar-menu-btn${menuOpen ? " is-active" : ""}`}
                  aria-label={t("nav_menu")}
                  aria-expanded={menuOpen}
                  aria-controls="site-menu"
                  onClick={() => {
                    setMenuOpen((v) => !v);
                    void hapticLight();
                  }}
                >
                  {menuOpen ? <IconClose /> : <IconMenu />}
                </button>
              )}
              </div>

              <a
                className="topbar-cta"
                href={academy.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t("register_cta")}</span>
                <i aria-hidden>→</i>
              </a>
            </div>
          </div>
        </div>
      </header>

      {!desktop && <MobileMenuSheet open={menuOpen} onClose={closeMenu} />}

      <main id="main" className="main">
        <LayoutGroup id="shared-routes">
          <AnimatedOutlet />
        </LayoutGroup>
      </main>

      <footer className="site-footer">
        <span className="site-footer-mark" aria-hidden>
          汉字
        </span>
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <Logo size="sm" />
            <p>{t("footer_tag")}</p>
            <div className="footer-social">
              <a
                className="footer-social-btn"
                href={academy.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8c0-.6.4-1 1-1z"
                  />
                </svg>
              </a>
              <a
                className="footer-social-btn"
                href={academy.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.2 7.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="site-footer-cols">
            <div>
              <h3>{t("footer_contact")}</h3>
              <a href={`tel:${academy.phoneRaw[0]}`}>{academy.phone[0]}</a>
              <a href={`tel:${academy.phoneRaw[1]}`}>{academy.phone[1]}</a>
              <a href={`mailto:${academy.email}`}>{academy.email}</a>
            </div>
            <div>
              <h3>{t("footer_links")}</h3>
              <NavLink to="/about">{t("nav_about")}</NavLink>
              <NavLink to="/courses">{t("nav_courses")}</NavLink>
              <NavLink to="/travel">{t("nav_travel")}</NavLink>
              <NavLink to="/translation">{t("nav_translation")}</NavLink>
              <NavLink to="/contact">{t("nav_contact")}</NavLink>
              <NavLink to="/enroll">{t("register_cta")}</NavLink>
              <a href={academy.shopUrl} target="_blank" rel="noopener noreferrer">
                bumtankhanz.mn
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>
            © {YEAR} {t("brand")}
          </span>
          <span lang="zh">学而时习之</span>
        </div>
      </footer>

      <LayoutGroup id="tabnav">
        <nav
          className={`tabbar glass-dock${tabCompact ? " is-compact" : ""}`}
          aria-label={t("nav_mobile")}
        >
          {navKeys
            .filter((item) => item.tab)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `tabbar-item${isActive ? " is-active" : ""}`
                }
                onClick={() => void hapticLight()}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        className="tabbar-pill"
                        layoutId="tab-pill"
                        transition={navSpring}
                      />
                    )}
                    <span className="tabbar-icon">
                      <NavIcon name={item.icon} />
                    </span>
                    <span className="tabbar-label">
                      {t(
                        "tabKey" in item && item.tabKey
                          ? item.tabKey
                          : item.key,
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
        </nav>
      </LayoutGroup>

      <Onboard />
    </div>
    </ThemeContext.Provider>
  );
}
