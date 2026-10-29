import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { hapticLight } from "../lib/native";

type Props = {
  title: string;
  status: string;
  to: string;
  cta: string;
};

/**
 * Fixed enroll CTA portaled to body so PageShell transform/filter
 * cannot trap `position: fixed` (breaks floating dock).
 */
export function EnrollDock({ title, status, to, cta }: Props) {
  const reduce = useReducedMotion();

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      className="app-enroll-dock"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="app-enroll-dock-copy">
        <strong>{title}</strong>
        <em>{status}</em>
      </div>
      <Link
        to={to}
        className="btn btn-seal app-enroll-dock-btn"
        onClick={() => void hapticLight()}
      >
        <span>{cta}</span>
      </Link>
    </motion.div>,
    document.body,
  );
}
