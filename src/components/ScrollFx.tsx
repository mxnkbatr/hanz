import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap, prefersReducedMotion, ScrollTrigger } from "../lib/gsap";

/**
 * Images that tilt and settle as they scroll in. Text is left alone, and it is
 * desktop only: on phones the fade-in left cards looking half-loaded while flicking.
 */
const MEDIA = "main :is(.news-card-media, .promo-panel img, .course-card img, .hx-uni)";

/**
 * Page-level GSAP scroll effects. Pages are lazy and swap on every route, so this
 * watches <main> for new content and wires anything it hasn't seen yet. Only whole
 * elements are animated, so React keeps owning the DOM.
 */
export function ScrollFx() {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main || prefersReducedMotion() || !window.matchMedia("(min-width: 900px)").matches) return;
    const ctx = gsap.context(() => {});

    const wire = () =>
      ctx.add(() => {
        let added = 0;
        gsap.utils.toArray<HTMLElement>(MEDIA).forEach((m) => {
          if (m.dataset.fx) return;
          m.dataset.fx = "1";
          added++;
          gsap.from(m, {
            scale: 0.92,
            rotation: gsap.utils.random([-3, 3]),
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: m, start: "top 95%", once: true },
          });
        });
        if (added) ScrollTrigger.refresh();
      });

    let queued = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(wire);
    });
    observer.observe(main, { childList: true, subtree: true });
    wire();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(queued);
      ctx.revert();
      main.querySelectorAll<HTMLElement>("[data-fx]").forEach((n) => delete n.dataset.fx);
    };
  }, [pathname]);

  return null;
}
