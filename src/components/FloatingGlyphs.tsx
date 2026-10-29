import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";

/** Big faint characters drifting behind the page: [glyph, left %, top %, size rem]. */
const GLYPHS: [string, number, number, number][] = [
  ["汉", 6, 14, 9],
  ["字", 84, 22, 7],
  ["学", 72, 62, 10],
  ["中", 12, 70, 6],
  ["文", 46, 38, 5],
  ["语", 92, 84, 6],
];

/**
 * Site-wide background layer: each glyph floats and slowly turns on its own
 * loop, and the whole set drifts at different depths as the page scrolls.
 */
export function FloatingGlyphs() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".fglyph", el).forEach((g, i) => {
        // Inner span floats on its own loop; the outer one carries the scroll parallax.
        gsap.to(g.firstElementChild, {
          x: gsap.utils.random(-40, 40),
          y: gsap.utils.random(-50, 50),
          rotation: gsap.utils.random(-25, 25),
          duration: gsap.utils.random(7, 12),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        });
        // Parallax: deeper glyphs (smaller) move less.
        gsap.to(g, {
          yPercent: -60 - i * 25,
          rotation: `+=${i % 2 ? 40 : -40}`,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="fglyphs" ref={root} aria-hidden>
      {GLYPHS.map(([ch, left, top, size], i) => (
        <span
          key={i}
          className="fglyph"
          style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}rem` }}
        >
          <span className="fglyph-inner">{ch}</span>
        </span>
      ))}
    </div>
  );
}
