import { useEffect, useState } from "react";

const cache = new Map<string, string>();

/**
 * A deep, readable colour taken from a photo: the average of a 24×24 sample,
 * weighted toward vivid pixels, then set to a dark lightness so white text on
 * it always reads. Null if the image can't be read (e.g. a server without CORS).
 */
export function sampleTint(src: string): Promise<string | null> {
  const hit = cache.get(src);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let w = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          // Vivid, mid-tone pixels count most; skies and shadows count little.
          const sat = max === 0 ? 0 : (max - min) / max;
          const mid = 1 - Math.abs(max / 255 - 0.55);
          const weight = 0.05 + sat * sat * mid;
          r += pr * weight;
          g += pg * weight;
          b += pb * weight;
          w += weight;
        }
        const tint = deepen(r / w, g / w, b / w);
        cache.set(src, tint);
        resolve(tint);
      } catch {
        resolve(null); // tainted canvas
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Keep the hue, cap saturation, fix lightness low enough for white text. */
function deepen(r: number, g: number, b: number): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return `hsl(${Math.round(h)} ${Math.round(Math.min(s, 0.6) * 100)}% 24%)`;
}

/** Tints for a set of images, filled in as each one is sampled. */
export function useImageTints(srcs: string[]): Record<string, string> {
  const [tints, setTints] = useState<Record<string, string>>({});
  const key = srcs.join("|");

  useEffect(() => {
    let alive = true;
    for (const src of key ? key.split("|") : []) {
      void sampleTint(src).then((tint) => {
        if (alive && tint) setTints((prev) => (prev[src] === tint ? prev : { ...prev, [src]: tint }));
      });
    }
    return () => {
      alive = false;
    };
  }, [key]);

  return tints;
}
