import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** The one image that is the first thing on screen (LCP): fetched first, not lazily. */
  priority?: boolean;
};

export function SafeImage({ src, alt, className, loading, priority = false }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`img-fallback img-fallback-han${className ? ` ${className}` : ""}`}
        aria-hidden
      >
        <span>汉</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={`photo${className ? ` ${className}` : ""}`}
      onError={() => setFailed(true)}
    />
  );
}
