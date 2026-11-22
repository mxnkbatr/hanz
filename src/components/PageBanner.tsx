import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useDesktop } from "../hooks/useDesktop";

const smooth = [0.16, 1, 0.3, 1] as [number, number, number, number];
const rise = (delay: number, reduce: boolean | null) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: smooth },
      };

/**
 * Desktop page banner in the same design as the home banner (client, 2026-11-22):
 * pill label with a red dot, serif title, muted lead, optional actions, and an
 * optional framed photo on the right. Phones keep their own compact heads.
 */
export function PageBanner({
  eyebrow,
  title,
  lead,
  image,
  tag,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  image?: string;
  tag?: string;
  actions?: ReactNode;
}) {
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  if (!desktop) return null;

  return (
    <section className={`hb pb${image ? "" : " is-text"}`}>
      <div className="hb-copy">
        <motion.p className="hb-eyebrow" {...rise(0.04, reduce)}>
          <span className="hb-eyebrow-dot" aria-hidden />
          {eyebrow}
        </motion.p>
        <motion.h1 className="hb-title" {...rise(0.1, reduce)}>
          {title}
        </motion.h1>
        {lead && (
          <motion.p className="hb-lead" {...rise(0.18, reduce)}>
            {lead}
          </motion.p>
        )}
        {actions && (
          <motion.div className="hb-actions" {...rise(0.26, reduce)}>
            {actions}
          </motion.div>
        )}
      </div>
      {image && (
        <motion.figure
          className="hb-media"
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.98 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.8, delay: 0.08, ease: smooth },
              })}
        >
          <img src={image} alt="" fetchPriority="high" />
          {tag && <span className="hb-tag">{tag}</span>}
        </motion.figure>
      )}
    </section>
  );
}
