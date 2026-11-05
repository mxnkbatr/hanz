import { useEffect, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import { hapticLight } from "../lib/native";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import { ease, sheetEase } from "../lib/motion";
import { IconClose, IconPhone, NavIcon } from "./Icons";
import { DarkModeRow, Group, LanguageRow, Row } from "./SettingsList";

type Props = { open: boolean; onClose: () => void };

const glyph = (g: string) => <span className="sl-glyph">{g}</span>;

/** Pages the tab bar doesn't already cover. */
const PAGES: { to: string; key: string; icon: ReactNode }[] = [
  { to: "/pricing", key: "nav_pricing", icon: glyph("₮") },
  { to: "/hsk", key: "nav_hsk", icon: glyph("考") },
  { to: "/university/poland", key: "poland_title", icon: <NavIcon name="uni" /> },
  { to: "/medee", key: "nav_news", icon: <NavIcon name="news" /> },
  { to: "/shop", key: "nav_shop", icon: <NavIcon name="bag" /> },
  { to: "/translation", key: "nav_translation", icon: glyph("译") },
  { to: "/about", key: "nav_about", icon: <NavIcon name="about" /> },
];

/**
 * Phone menu: an iOS Settings-style bottom sheet. The one main action
 * (with a call button), then grouped lists for pages and settings. Drag the grabber down (or tap
 * outside) to close.
 */
export function MobileMenuSheet({ open, onClose }: Props) {
  const { t } = useI18n();
  const { academyLive: academy } = useSiteContent();
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

  // Groups settle in one after another once the sheet has landed.
  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.12 + i * 0.05, duration: 0.4, ease },
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
            className="mm-sheet is-ios"
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
              <h2 className="mm-title">{t("menu_title")}</h2>
              <button type="button" className="mm-close" aria-label={t("mm_close")} onClick={onClose}>
                <IconClose />
              </button>
            </div>

            <div className="mm-body">
              <motion.div className="mm-actions" {...rise(0)}>
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
              </motion.div>

              <motion.div {...rise(2)}>
                <Group title={t("mm_explore")}>
                  {PAGES.map((p) => (
                    <Row key={p.to} to={p.to} icon={p.icon} label={t(p.key)} onGo={onClose} />
                  ))}
                </Group>
              </motion.div>

              <motion.div {...rise(3)}>
                <Group title={t("mm_settings")}>
                  <LanguageRow id="mm-lang" />
                  <DarkModeRow />
                </Group>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
