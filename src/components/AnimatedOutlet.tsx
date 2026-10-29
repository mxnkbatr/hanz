import {
  cloneElement,
  isValidElement,
  Suspense,
  useState,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { useDesktop } from "../hooks/useDesktop";
import { RouteStackContext } from "../lib/routeStack";

type Dir = "push" | "pop" | "fade";
type Custom = { dir: Dir; fromY: number };

const depth = (path: string) => path.split("/").filter(Boolean).length;

/**
 * Like UINavigationController: deeper or forward → push from the right,
 * browser back or going up a level → pop, switching top-level tabs → cross-fade.
 */
function directionFor(prev: string, next: string, navType: string): Dir {
  if (navType === "POP") return "pop";
  const a = depth(prev);
  const b = depth(next);
  if (b > a) return "push";
  if (b < a) return "pop";
  return b <= 1 ? "fade" : "push";
}

const iosSpring = { type: "spring" as const, stiffness: 380, damping: 40, mass: 0.9 };
const instant = { duration: 0 };

const stackVariants = {
  enter: ({ dir }: Custom) =>
    dir === "fade"
      ? { opacity: 0, x: 0, y: 0, zIndex: 2, boxShadow: "none" }
      : dir === "push"
        ? { x: "100%", opacity: 1, y: 0, zIndex: 2, boxShadow: "-24px 0 48px rgba(0,0,0,0.6)" }
        : { x: "-28%", opacity: 0.6, y: 0, zIndex: 1, boxShadow: "none" },
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    transition: { x: iosSpring, opacity: { duration: 0.28 }, boxShadow: { duration: 0.4 }, zIndex: instant },
    transitionEnd: { zIndex: 0, boxShadow: "none" },
  },
  exit: ({ dir, fromY }: Custom) => ({
    // Keep the old page where the reader was while the window jumps to the top.
    y: -fromY,
    ...(dir === "fade"
      ? { opacity: 0, x: 0, zIndex: 1 }
      : dir === "push"
        ? { x: "-28%", opacity: 0.6, zIndex: 1 }
        : { x: "100%", opacity: 1, zIndex: 2, boxShadow: "-24px 0 48px rgba(0,0,0,0.6)" }),
    transition: { x: iosSpring, y: instant, zIndex: instant, opacity: { duration: dir === "fade" ? 0.18 : 0.3 } },
  }),
};

/**
 * AnimatePresence needs a keyed direct child. Putting `key` on `<Outlet />`
 * does not work — every page remounted/flickered the same way.
 *
 * Desktop: `wait` keeps exit → enter sequential for a clean web feel.
 * Phone: both pages share one grid cell so they can slide over each other.
 */
export function AnimatedOutlet() {
  const location = useLocation();
  const navType = useNavigationType();
  const outlet = useOutlet();
  const desktop = useDesktop();
  const reduce = useReducedMotion();

  // Previous route and how to leave it, updated during render ("storing information
  // from previous renders") so the exiting page receives it too. Layout scrolls to the
  // top in an effect, so scrollY here is still the offset the reader left at.
  const [nav, setNav] = useState<{ path: string; custom: Custom }>(() => ({
    path: location.pathname,
    custom: { dir: "fade", fromY: 0 },
  }));
  if (nav.path !== location.pathname) {
    setNav({
      path: location.pathname,
      custom: {
        dir: directionFor(nav.path, location.pathname, navType),
        fromY: window.scrollY,
      },
    });
  }

  if (!outlet || !isValidElement(outlet)) return null;

  // Pages are lazy chunks; keep the layout (header, tab bar) mounted while one loads.
  const page = (
    <Suspense fallback={<div className="page-loading" />}>
      {cloneElement(outlet as ReactElement)}
    </Suspense>
  );

  if (desktop || reduce) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <Suspense key={location.pathname} fallback={<div className="page-loading" />}>
          {cloneElement(outlet as ReactElement)}
        </Suspense>
      </AnimatePresence>
    );
  }

  return (
    <RouteStackContext.Provider value>
      <div className="route-stack">
        <AnimatePresence initial={false} custom={nav.custom}>
          <motion.div
            key={location.pathname}
            className="route-layer"
            custom={nav.custom}
            variants={stackVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {page}
          </motion.div>
        </AnimatePresence>
      </div>
    </RouteStackContext.Provider>
  );
}
