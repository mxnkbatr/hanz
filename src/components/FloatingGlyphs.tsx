/** Big faint characters drifting behind a section: [glyph, left %, top %, size rem]. */
const GLYPHS: [string, number, number, number][] = [
  ["汉", 6, 14, 9],
  ["字", 84, 22, 7],
  ["学", 72, 62, 10],
  ["中", 12, 70, 6],
  ["文", 46, 38, 5],
  ["语", 92, 84, 6],
];

/**
 * Background layer for a single section (the home finale): each glyph slowly
 * floats and turns on its own loop. It fills its nearest positioned parent, so it
 * stays out of the way of the reading sections. Pure CSS transform animations (see
 * .fglyph-inner) so the compositor runs them.
 */
export function FloatingGlyphs() {
  return (
    <div className="fglyphs" aria-hidden>
      {GLYPHS.map(([ch, left, top, size], i) => (
        <span
          key={i}
          className="fglyph"
          style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}rem` }}
        >
          <span className="fglyph-inner">{ch}</span>
        </span>
      ))}
    </div>
  );
}
