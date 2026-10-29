import { useEffect, useId, useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "../lib/gsap";

const RING = "ХАНЗ АКАДЕМИ • HANZ ACADEMY • SINCE 2014 • 汉字 • ";

/**
 * Round "stamp" badge: a ring of text spinning around the 汉 seal.
 * Spins slowly on its own and speeds up with scroll velocity.
 */
export function RotatingSeal({ className = "" }: { className?: string }) {
  const ring = useRef<SVGSVGElement>(null);
  const pathId = useId();

  useEffect(() => {
    const el = ring.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const spin = gsap.to(el, {
        rotation: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 8);
          gsap.to(spin, {
            timeScale: boost * (self.direction < 0 ? -1 : 1),
            duration: 0.2,
            overwrite: true,
          });
          gsap.to(spin, { timeScale: 1, duration: 1.2, delay: 0.25, ease: "power2.out" });
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className={`rseal ${className}`} aria-hidden>
      <svg ref={ring} className="rseal-ring" viewBox="0 0 200 200">
        <defs>
          <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href={`#${pathId}`} textLength="490">
            {RING}
          </textPath>
        </text>
      </svg>
      <span className="rseal-core">汉</span>
    </div>
  );
}
