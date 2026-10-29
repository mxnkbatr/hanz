import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

const STORAGE_KEY = "hanz-onboard-seen";
const MOBILE_MQ = "(max-width: 899px)";
const SWIPE_THRESHOLD = 56;

const slides = [
  {
    key: "welcome",
    title: "onboard_1_title",
    body: "onboard_1_body",
    image: "/images/hero-wall.webp",
  },
  {
    key: "learn",
    title: "onboard_2_title",
    body: "onboard_2_body",
    image: "/images/hero-palace.webp",
  },
  {
    key: "start",
    title: "onboard_3_title",
    body: "onboard_3_body",
    image: "/images/hero-hanz.webp",
  },
] as const;

const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

function isMobileViewport() {
  return window.matchMedia(MOBILE_MQ).matches;
}

export function shouldShowOnboard() {
  if (typeof window === "undefined") return false;
  if (!isMobileViewport()) return false;
  // Don't block auth / admin flows
  const path = window.location.pathname;
  if (path.startsWith("/auth") || path.startsWith("/admin")) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function markOnboardSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function Onboard() {
  const { t } = useI18n();
  const location = useLocation();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(() => shouldShowOnboard());
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(0);
  const last = step >= slides.length - 1;
  const slide = slides[step];

  useEffect(() => {
    if (
      location.pathname.startsWith("/auth") ||
      location.pathname.startsWith("/admin")
    ) {
      setOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      if (!mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  function close() {
    markOnboardSeen();
    setOpen(false);
  }

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    if (clamped === step) return;
    setDir(clamped > step ? 1 : -1);
    setStep(clamped);
  }

  function next() {
    void hapticLight();
    if (last) {
      close();
      return;
    }
    goTo(step + 1);
  }

  function skip() {
    void hapticLight();
    close();
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (reduce) return;
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -400) {
      void hapticLight();
      if (last) close();
      else goTo(step + 1);
      return;
    }
    if ((offset.x > SWIPE_THRESHOLD || velocity.x > 400) && step > 0) {
      void hapticLight();
      goTo(step - 1);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="onboard"
          role="dialog"
          aria-modal="true"
          aria-label={t("onboard_aria")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: 24 }}
          transition={reduce ? { duration: 0.15 } : spring}
        >
          <header className="onboard-bar">
            <span className="onboard-mark" aria-hidden>
              汉
            </span>
            <button type="button" className="onboard-skip" onClick={skip}>
              {t("onboard_skip")}
            </button>
          </header>

          <motion.div
            className="onboard-stage"
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={onDragEnd}
          >
            <div className="onboard-hero">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={slide.image}
                  className="onboard-hero-card"
                  custom={dir}
                  initial={
                    reduce ? false : { opacity: 0, x: dir >= 0 ? 40 : -40 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir >= 0 ? -36 : 36 }}
                  transition={spring}
                >
                  <img className="photo" src={slide.image} alt="" draggable={false} />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.key}
                className="onboard-copy"
                custom={dir}
                initial={
                  reduce ? false : { opacity: 0, y: 16, x: dir >= 0 ? 20 : -20 }
                }
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -10, x: dir >= 0 ? -16 : 16 }}
                transition={spring}
              >
                <p className="onboard-brand">
                  {t("brand")} {t("brand_sub")}
                </p>
                <h1>{t(slide.title)}</h1>
                <p>{t(slide.body)}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <footer className="onboard-foot">
            <div className="onboard-dots" aria-hidden>
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`onboard-dot${i === step ? " is-on" : ""}`}
                  aria-label={`${i + 1}`}
                  onClick={() => {
                    void hapticLight();
                    goTo(i);
                  }}
                />
              ))}
            </div>

            <motion.button
              type="button"
              className="onboard-btn"
              onClick={next}
              whileTap={{ scale: 0.97 }}
              transition={spring}
            >
              {last ? t("onboard_start") : t("onboard_next")}
            </motion.button>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
