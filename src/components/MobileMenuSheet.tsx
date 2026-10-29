import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { useAuth } from "../lib/AuthContext";
import { hapticLight } from "../lib/native";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import { ease, sheetEase } from "../lib/motion";
import { IconClose, IconPhone } from "./Icons";
import { Logo } from "./Logo";
import { DarkModeRow, Group, LanguageRow } from "./SettingsList";

type Props = { open: boolean; onClose: () => void };

/** Pages the tab bar doesn't already cover, as photo tiles. */
const TILES = [
  { to: "/hsk", key: "nav_hsk", img: "/courses/image8.webp" },
  { to: "/medee", key: "nav_news", img: "/courses/image14.webp" },
  { to: "/shop", key: "nav_shop", img: "/images/shop-hero.webp" },
  { to: "/translation", key: "nav_translation", img: "/courses/image4.webp" },
  { to: "/about", key: "nav_about", img: "/courses/image15.webp" },
  { to: "/contact", key: "nav_contact", img: "/courses/image11.webp" },
] as const;

/**
 * Phone menu: a soft editorial bottom sheet. A glass brand card with the main
 * actions, photo tiles for the pages the tab bar doesn't cover, then language and
 * appearance. Drag the handle down (or tap outside) to close.
 */
export function MobileMenuSheet({ open, onClose }: Props) {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const go = () => {
    onClose();
    void hapticLight();
  };

  const tiles = [
    ...TILES,
    {
      to: user ? "/profile" : "/auth?mode=login",
      key: user ? "nav_profile" : "auth_login",
      img: "/images/hero-hanz.webp",
    },
  ];

  // Tiles rise in one after another once the sheet has landed.
  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.18 + i * 0.04, duration: 0.45, ease },
        };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="mm-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className="mm-sheet"
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("menu_title")}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: sheetEase }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="mm-head" onPointerDown={(e) => drag.start(e)}>
              <span className="mm-grabber" aria-hidden />
              <span className="mm-eyebrow">{t("menu_title")}</span>
              <button type="button" className="mm-close" aria-label={t("mm_close")} onClick={onClose}>
                <IconClose />
              </button>
            </div>

            <div className="mm-body">
              <motion.section className="mm-brand" {...rise(0)}>
                <span className="mm-brand-mark" aria-hidden>
                  汉
                </span>
                <Logo size="sm" />
                <h2 className="mm-brand-title">
                  {t("hd_line1")} <em>{t("hd_line2")}</em> {t("hd_line3")}
                </h2>
                <p className="mm-brand-tag">{t("footer_tag")}</p>
                <div className="mm-brand-actions">
                  <NavLink to="/enroll" className="mm-cta" onClick={go}>
                    <span>{t("register_cta")}</span>
                    <i aria-hidden>→</i>
                  </NavLink>
                  <a
                    href={`tel:${academy.phoneRaw[0]}`}
                    className="mm-round"
                    aria-label={`${t("call")} ${academy.phone[0]}`}
                    onClick={() => void hapticLight()}
                  >
                    <IconPhone />
                  </a>
                  <a
                    href={academy.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mm-round"
                    aria-label="Messenger"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M12 3C6.9 3 3 6.7 3 11.4c0 2.6 1.2 4.9 3.2 6.4V21l2.9-1.6c.9.3 1.9.4 2.9.4 5.1 0 9-3.7 9-8.4S17.1 3 12 3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </motion.section>

              <h3 className="mm-section">{t("mm_explore")}</h3>
              <div className="mm-tiles">
                {tiles.map((tile, i) => (
                  <motion.div key={tile.to} {...rise(i + 1)}>
                    <NavLink
                      to={tile.to}
                      className={({ isActive }) => `mm-tile${isActive ? " is-active" : ""}`}
                      onClick={go}
                    >
                      <img className="photo" src={tile.img} alt="" loading="lazy" decoding="async" />
                      <span className="mm-tile-label">{t(tile.key)}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              <Group title={t("mm_settings")}>
                <LanguageRow id="mm-lang" />
                <DarkModeRow />
              </Group>

              <div className="mm-social">
                <a href={academy.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                <a href={academy.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href={`mailto:${academy.email}`}>{academy.email}</a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
