import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { useAuth } from "../lib/AuthContext";
import { hapticLight } from "../lib/native";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import { sheetEase } from "../lib/motion";
import { IconClose, IconPhone, IconProfile, NavIcon } from "./Icons";
import { DarkModeRow, Group, LanguageRow, Row } from "./SettingsList";

type Props = { open: boolean; onClose: () => void };

/** Pages the tab bar doesn't already cover, grouped like iOS Settings. */
const EXPLORE = [
  { to: "/medee", key: "nav_news", icon: <NavIcon name="news" /> },
  { to: "/shop", key: "nav_shop", icon: <NavIcon name="bag" /> },
  { to: "/translation", key: "nav_translation", icon: <span className="sl-glyph">译</span> },
] as const;

const ACADEMY = [
  { to: "/about", key: "nav_about", icon: <NavIcon name="about" /> },
  { to: "/contact", key: "nav_contact", icon: <IconPhone /> },
] as const;

/**
 * Phone menu: an iOS-style bottom sheet. Quick actions on top, grouped rows with
 * coloured icon tiles, then language + appearance. Drag the handle down to close.
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
              <strong>{t("menu_title")}</strong>
              <button type="button" className="mm-close" aria-label={t("mm_close")} onClick={onClose}>
                <IconClose />
              </button>
            </div>

            <div className="mm-body">
              <div className="mm-quick">
                <a href={`tel:${academy.phoneRaw[0]}`} className="mm-quick-btn" onClick={() => void hapticLight()}>
                  <IconPhone />
                  <span>{t("call")}</span>
                </a>
                <a
                  href={academy.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mm-quick-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 3C6.9 3 3 6.7 3 11.4c0 2.6 1.2 4.9 3.2 6.4V21l2.9-1.6c.9.3 1.9.4 2.9.4 5.1 0 9-3.7 9-8.4S17.1 3 12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Messenger</span>
                </a>
                <NavLink to="/enroll" className="mm-quick-btn is-seal" onClick={go}>
                  <span className="mm-quick-arrow" aria-hidden>
                    →
                  </span>
                  <span>{t("register_cta")}</span>
                </NavLink>
              </div>

              <Group title={t("mm_explore")}>
                {EXPLORE.map((row) => (
                  <Row key={row.to} to={row.to} icon={row.icon} label={t(row.key)} onGo={go} />
                ))}
              </Group>

              <Group title={t("mm_academy")}>
                {ACADEMY.map((row) => (
                  <Row key={row.to} to={row.to} icon={row.icon} label={t(row.key)} onGo={go} />
                ))}
                <Row
                  to={user ? "/profile" : "/auth?mode=login"}
                 
                  icon={<IconProfile />}
                  label={user ? t("nav_profile") : t("auth_login")}
                  onGo={go}
                />
              </Group>

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
