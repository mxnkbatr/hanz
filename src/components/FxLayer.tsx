import { useEffect } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Cards that get the pointer-follow glow on desktop. */
const GLOW_SELECTOR =
  ".news-card, .shop-card, .uni-card, .course-card, .news-featured, .promo-panel, .home-course-card, .home-prog-card, .home-branch-card, .step-card, .stats-strip-inner";

/**
 * Site-wide effects: scroll progress line, pointer spotlight on cards,
 * and paper grain. Pure decoration — everything is aria-hidden.
 */
export function FxLayer() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = (e.target as Element | null)?.closest?.(GLOW_SELECTOR);
        if (!(el instanceof HTMLElement)) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  return (
    <>
      <motion.div
        className="fx-progress"
        style={{ scaleX: reduce ? scrollYProgress : progress }}
        aria-hidden
      />
      <div className="fx-grain" aria-hidden />
    </>
  );
}
