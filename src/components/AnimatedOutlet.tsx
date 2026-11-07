import {
  cloneElement,
  isValidElement,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { useDesktop } from "../hooks/useDesktop";
import { isTabRoot, useGoBack } from "../hooks/useGoBack";
import { hapticLight, isNativeApp } from "../lib/native";
import { RouteStackContext } from "../lib/routeStack";
import { recalledScroll, rememberScroll } from "../lib/scrollMemory";

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

const softSpring = { type: "spring" as const, stiffness: 520, damping: 46, mass: 0.8 };

/**
 * Pages have see-through backgrounds, so two layers must never sit on top of each
 * other for long: the old page fades out fast while the new one glides a short way in
 * (from the right going deeper, from the left going back, straight up between tabs).
 */
const stackVariants = {
  enter: ({ dir }: Custom) => ({
    opacity: 0,
    x: dir === "push" ? 28 : dir === "pop" ? -28 : 0,
    y: dir === "fade" ? 8 : 0,
    zIndex: 2,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { x: softSpring, y: softSpring, opacity: { duration: 0.22 }, zIndex: instant },
    transitionEnd: { zIndex: 0 },
  },
  exit: ({ dir, fromY }: Custom) => ({
    // Keep the old page where the reader was while the window jumps to its new offset.
    y: -fromY,
    zIndex: 1,
    opacity: 0,
    // The app's swipe-back drags the page; let it carry on off the edge from the finger.
    ...(dir === "pop" && isNativeApp() ? { x: window.innerWidth, opacity: 1, zIndex: 2 } : {}),
    transition: {
      x: iosSpring,
      y: instant,
      zIndex: instant,
      opacity: { duration: dir === "pop" && isNativeApp() ? 0.3 : 0.1 },
    },
  }),
};

/** One page in the stack, with its own x so an edge swipe can drag it. */
function RouteLayer({
  path,
  custom,
  onActive,
  children,
}: {
  path: string;
  custom: Custom;
  onActive: (x: MotionValue<number>) => void;
  children: ReactNode;
}) {
  const x = useMotionValue(0);
  const present = useIsPresent();
  useEffect(() => {
    if (present) onActive(x);
  }, [present, x, onActive]);
  return (
    <motion.div
      className="route-layer"
      data-path={path}
      style={{ x }}
      custom={custom}
      variants={stackVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

/**
 * Drag in from the left edge to go back, as in an iOS app. Only inside the native
 * shell: Safari and Android browsers already own that gesture and would animate twice.
 */
function useEdgeSwipeBack(enabled: boolean, activeX: RefObject<MotionValue<number> | null>) {
  const goBack = useGoBack();
  useEffect(() => {
    if (!enabled) return;
    let tracking = false;
    let locked = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (e.touches.length !== 1 || t.clientX > 24) return;
      tracking = true;
      locked = false;
      startX = lastX = t.clientX;
      startY = t.clientY;
      lastT = e.timeStamp;
      velocity = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!locked) {
        // A mostly vertical start is a scroll, not a swipe.
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
          tracking = false;
          return;
        }
        if (dx < 8) return;
        locked = true;
      }
      e.preventDefault();
      velocity = (t.clientX - lastX) / Math.max(1, e.timeStamp - lastT);
      lastX = t.clientX;
      lastT = e.timeStamp;
      activeX.current?.set(Math.max(0, dx));
    };
    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!locked) return;
      const x = activeX.current;
      if (!x) return;
      if (x.get() > window.innerWidth * 0.35 || velocity > 0.45) {
        void hapticLight();
        goBack();
      } else {
        animate(x, 0, iosSpring);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled, activeX, goBack]);
}

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
  const activeX = useRef<MotionValue<number> | null>(null);
  const setActiveX = useCallback((x: MotionValue<number>) => {
    activeX.current = x;
  }, []);

  // Previous route and how to leave it, updated during render ("storing information
  // from previous renders") so the exiting page receives it too. Layout scrolls in an
  // effect, so scrollY here is still the offset the reader left at.
  const [nav, setNav] = useState<{ path: string; key: string; custom: Custom }>(() => ({
    path: location.pathname,
    key: location.key,
    custom: { dir: "fade", fromY: 0 },
  }));
  if (nav.path !== location.pathname) {
    rememberScroll(nav.key, window.scrollY);
    // Back returns to the old offset (Layout scrolls there); anything else starts at the top.
    const toY = navType === "POP" && !desktop ? recalledScroll(location.key) : 0;
    setNav({
      path: location.pathname,
      key: location.key,
      custom: {
        dir: directionFor(nav.path, location.pathname, navType),
        fromY: window.scrollY - toY,
      },
    });
  }

  useEdgeSwipeBack(
    !desktop && !reduce && isNativeApp() && !isTabRoot(location.pathname),
    activeX,
  );

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
          <RouteLayer
            key={location.pathname}
            path={location.pathname}
            custom={nav.custom}
            onActive={setActiveX}
          >
            {page}
          </RouteLayer>
        </AnimatePresence>
      </div>
    </RouteStackContext.Provider>
  );
}
