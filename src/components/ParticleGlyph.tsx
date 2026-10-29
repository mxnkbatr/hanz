import { useEffect, useRef } from "react";

type Props = {
  /** The character the particles form; changing it re-forms them. */
  glyph: string;
  /** Glyph centre and size as fractions of the canvas (0–1). */
  centerX?: number;
  centerY?: number;
  /** Glyph height as a fraction of the canvas height. */
  size?: number;
  /** Still frame instead of motion (prefers-reduced-motion). */
  still?: boolean;
};

const FONT = '700 100px "Noto Serif SC", "Songti SC", serif';
const GAP = 6; // px between sampled points (CSS px) → ~2–3k particles on a laptop
const MAX = 4200;

type Pt = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; red: boolean; s: number };

/** Points inside the glyph, sampled from an offscreen render (CSS px, canvas space). */
function sampleGlyph(glyph: string, w: number, h: number, cx: number, cy: number, size: number) {
  const px = Math.round(h * size);
  const off = document.createElement("canvas");
  off.width = px;
  off.height = px;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.font = FONT.replace("100px", `${Math.round(px * 0.92)}px`);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(glyph, px / 2, px / 2 + px * 0.04);
  const data = ctx.getImageData(0, 0, px, px).data;
  const ox = w * cx - px / 2;
  const oy = h * cy - px / 2;
  const pts: { x: number; y: number }[] = [];
  const step = Math.max(GAP, Math.round(px / 95));
  for (let y = 0; y < px; y += step) {
    for (let x = 0; x < px; x += step) {
      if (data[(y * px + x) * 4 + 3] > 140) pts.push({ x: ox + x, y: oy + y });
    }
  }
  // Keep the count bounded on very large screens.
  if (pts.length > MAX) {
    const keep = MAX / pts.length;
    return pts.filter(() => Math.random() < keep);
  }
  return pts;
}

/**
 * Thousands of small points that gather into a Chinese character, scatter away
 * from the pointer, and re-form when `glyph` changes. Plain 2D canvas (no
 * WebGL); pauses off-screen and when the tab is hidden.
 */
export function ParticleGlyph({ glyph, centerX = 0.72, centerY = 0.48, size = 0.66, still = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{ pts: Pt[]; w: number; h: number; ready: boolean }>({ pts: [], w: 0, h: 0, ready: false });
  const glyphRef = useRef(glyph);

  // Re-target existing particles to the new glyph.
  useEffect(() => {
    glyphRef.current = glyph;
    const st = stateRef.current;
    if (!st.ready) return;
    const targets = sampleGlyph(glyph, st.w, st.h, centerX, centerY, size);
    if (!targets.length) return;
    // Shuffle so particles cross the screen instead of sliding in rows.
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    st.pts.forEach((p, i) => {
      const t = targets[i % targets.length];
      p.tx = t.x + (Math.random() - 0.5) * 1.2;
      p.ty = t.y + (Math.random() - 0.5) * 1.2;
      // A small kick so the morph reads as a burst, not a crawl.
      p.vx += (Math.random() - 0.5) * 6;
      p.vy += (Math.random() - 0.5) * 6;
    });
  }, [glyph, centerX, centerY, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = stateRef.current;
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let visible = true;
    let alive = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = rect.width;
      st.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const targets = sampleGlyph(glyphRef.current, st.w, st.h, centerX, centerY, size);
      const prev = st.pts;
      st.pts = targets.map((t, i) => {
        const old = prev[i];
        return {
          // First build: start scattered across the whole stage, then gather.
          x: old ? old.x : Math.random() * st.w,
          y: old ? old.y : Math.random() * st.h,
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
          red: old ? old.red : Math.random() < 0.13,
          s: old ? old.s : Math.random() < 0.18 ? 2.4 : 1.6,
        };
      });
      st.ready = true;
      if (still) {
        for (const p of st.pts) {
          p.x = p.tx;
          p.y = p.ty;
        }
        draw();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, st.w, st.h);
      ctx.fillStyle = "rgba(246, 239, 230, 0.86)";
      for (const p of st.pts) if (!p.red) ctx.fillRect(p.x, p.y, p.s, p.s);
      ctx.fillStyle = "rgba(255, 92, 92, 0.95)";
      for (const p of st.pts) if (p.red) ctx.fillRect(p.x, p.y, p.s, p.s);
    };

    const R = 110;
    const tick = () => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      for (const p of st.pts) {
        let ax = (p.tx - p.x) * 0.055;
        let ay = (p.ty - p.y) * 0.055;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R) * 9;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
        p.vx = (p.vx + ax) * 0.8;
        p.vy = (p.vy + ay) * 0.8;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!still && !raf) raf = requestAnimationFrame(tick);
    };

    let cancelled = false;
    // The glyph must be drawn with the real font, so wait for it.
    void (document.fonts?.load?.(FONT, "汉字学") ?? Promise.resolve()).finally(() => {
      if (cancelled) return;
      build();
      start();
    });

    const ro = new ResizeObserver(() => {
      if (st.ready) build();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);

    // Window-level: the hero copy sits above the canvas. Scale back from the
    // on-screen size (the frame is CSS-scaled while scrolling) to canvas space.
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mouse.x = ((e.clientX - r.left) * st.w) / r.width;
      mouse.y = ((e.clientY - r.top) * st.h) / r.height;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [centerX, centerY, size, still]);

  return <canvas ref={canvasRef} className="pglyph-canvas" aria-hidden />;
}
