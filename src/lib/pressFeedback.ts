const TAPPABLE = 'a[href], button:not(:disabled), [role="button"], label[for], summary';
const DELAY = 45; // ms: a finger that starts scrolling never presses anything
const SLOP = 10; // px of travel that turns a press into a scroll

/**
 * Native-feeling press on touch screens: whatever you tap sinks slightly and springs
 * back on release, like a UIButton. Uses the `scale` property through the Web
 * Animations API, so it never fights a component's own transform or transition.
 */
export function installPressFeedback() {
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let el: HTMLElement | null = null;
  let anim: Animation | null = null;
  let timer = 0;
  let x = 0;
  let y = 0;

  const release = () => {
    window.clearTimeout(timer);
    if (el && anim) {
      const pressed = anim;
      const target = el;
      const back = target.animate([{ scale: getComputedStyle(target).scale }, { scale: "1" }], {
        duration: 380,
        easing: "cubic-bezier(0.2, 1.4, 0.4, 1)",
      });
      back.onfinish = () => back.cancel();
      pressed.cancel();
    }
    el = null;
    anim = null;
  };

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "mouse" || !e.isPrimary) return;
      release();
      const hit = (e.target as Element | null)?.closest<HTMLElement>(TAPPABLE);
      if (!hit || hit.closest("[data-no-press]")) return;
      el = hit;
      x = e.clientX;
      y = e.clientY;
      timer = window.setTimeout(() => {
        if (!el) return;
        const { width, height } = el.getBoundingClientRect();
        // Cards dip a little, small buttons a little more.
        const s = width * height > 24000 ? 0.97 : 0.92;
        anim = el.animate([{ scale: "1" }, { scale: String(s) }], {
          duration: 140,
          easing: "cubic-bezier(0.3, 0, 0.2, 1)",
          fill: "forwards",
        });
      }, DELAY);
    },
    { passive: true },
  );

  document.addEventListener(
    "pointermove",
    (e) => {
      if (el && Math.hypot(e.clientX - x, e.clientY - y) > SLOP) release();
    },
    { passive: true },
  );

  // A tap quicker than the delay still gets a brief dip, so every tap answers.
  window.addEventListener(
    "pointerup",
    () => {
      if (!el || anim) return;
      const tap = el.animate([{ scale: "1" }, { scale: "0.95" }, { scale: "1" }], {
        duration: 260,
        easing: "cubic-bezier(0.3, 0, 0.2, 1)",
      });
      tap.onfinish = () => tap.cancel();
    },
    { passive: true, capture: true },
  );

  for (const type of ["pointerup", "pointercancel", "scroll", "blur"] as const) {
    window.addEventListener(type, release, { passive: true, capture: true });
  }
}
