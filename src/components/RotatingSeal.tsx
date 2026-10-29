import { useId } from "react";

const RING = "ХАНЗ АКАДЕМИ • HANZ ACADEMY • SINCE 2014 • 汉字 • ";

/**
 * Round "stamp" badge: a ring of text slowly turning around the 汉 seal.
 * The spin is a CSS animation (.rseal-ring), so the compositor runs it.
 */
export function RotatingSeal({ className = "" }: { className?: string }) {
  const pathId = useId();

  return (
    <div className={`rseal ${className}`} aria-hidden>
      <svg className="rseal-ring" viewBox="0 0 200 200">
        <defs>
          <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href={`#${pathId}`} textLength="490">
            {RING}
          </textPath>
        </text>
      </svg>
      <span className="rseal-core">汉</span>
    </div>
  );
}
