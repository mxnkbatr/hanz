import { useRef, type MouseEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/** Primary CTA that leans a little toward the pointer on desktop. No idle loop. */
export function MagneticButton({
  children,
  className = "",
  href,
  target,
  rel,
}: {
  children: ReactNode;
  className?: string;
  /** A site path ("/enroll") navigates in the app; anything else is a normal link. */
  href: string;
  target?: string;
  rel?: string;
}) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22 });
  const sy = useSpring(y, { stiffness: 260, damping: 22 });

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("/") || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
  };

  if (reduce) {
    return (
      <a className={className} href={href} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`magnetic-btn ${className}`}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el || window.matchMedia("(pointer: fine)").matches === false)
          return;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        x.set(dx * 0.14);
        y.set(dy * 0.14);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.a>
  );
}
