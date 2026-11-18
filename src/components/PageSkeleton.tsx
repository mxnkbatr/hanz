import { useLocation } from "react-router-dom";

/**
 * Placeholder while a page's code is loading: grey shapes in the page's own
 * layout (title, search, list rows / a detail photo / home tiles) with a soft
 * shimmer, so a tap always shows the next screen at once instead of a blank.
 */
export function PageSkeleton({ variant }: { variant?: "home" | "list" | "detail" | "admin" }) {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const kind =
    variant ??
    (parts[0] === "admin"
      ? "admin"
      : parts.length === 0
        ? "home"
        : parts.length >= 2
          ? "detail"
          : "list");

  return (
    <div className={`sk sk-${kind}`} aria-busy="true" aria-label="…">
      {kind === "detail" ? (
        <>
          <div className="sk-block sk-hero" />
          <div className="sk-line sk-title" />
          <div className="sk-line sk-w60" />
          <div className="sk-card">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sk-row">
                <div className="sk-dot" />
                <div className="sk-line sk-w40" />
                <div className="sk-line sk-w25 sk-end" />
              </div>
            ))}
          </div>
          <div className="sk-card sk-text">
            <div className="sk-line" />
            <div className="sk-line" />
            <div className="sk-line sk-w70" />
          </div>
        </>
      ) : kind === "home" ? (
        <>
          <div className="sk-line sk-w30" />
          <div className="sk-line sk-title sk-w70" />
          <div className="sk-pill" />
          <div className="sk-block sk-banner" />
          <div className="sk-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sk-tile" />
            ))}
          </div>
          <ListRows n={3} />
        </>
      ) : kind === "admin" ? (
        <>
          <div className="sk-line sk-title sk-w40" />
          <div className="sk-line sk-w60" />
          <div className="sk-grid sk-stats">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sk-tile" />
            ))}
          </div>
          <ListRows n={4} />
        </>
      ) : (
        <>
          <div className="sk-line sk-title sk-w50" />
          <div className="sk-pill" />
          <div className="sk-chips">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sk-chip" />
            ))}
          </div>
          <ListRows n={6} />
        </>
      )}
    </div>
  );
}

/** Skeleton rows for a list whose data is still loading. */
export function SkeletonList({ n = 5 }: { n?: number }) {
  return (
    <div className="sk sk-inline">
      <ListRows n={n} />
    </div>
  );
}

function ListRows({ n }: { n: number }) {
  return (
    <div className="sk-card">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="sk-row">
          <div className="sk-thumb" />
          <div className="sk-col">
            <div className="sk-line sk-w70" />
            <div className="sk-line sk-w40 sk-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
