/** Blurred wash of a page's hero photo behind the top of the page — the page takes the photo's color. */
export function PhotoGlow({ src }: { src: string }) {
  if (!src) return null;
  return (
    <span className="photo-glow" aria-hidden>
      <img src={src} alt="" decoding="async" />
    </span>
  );
}
