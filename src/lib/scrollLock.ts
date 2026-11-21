let locks = 0;
let savedY = 0;

/** iOS-safe body scroll lock (avoids jump / “scroll in” on open/close). */
export function lockBodyScroll() {
  if (locks === 0) {
    savedY = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${savedY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }
  locks += 1;
}

export function unlockBodyScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  const body = document.body;
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  window.scrollTo({ top: savedY, left: 0, behavior: "instant" });
}
