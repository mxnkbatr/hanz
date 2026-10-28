import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function SafeImage({ src, alt, className, loading = "lazy" }: Props) {
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
      loading={loading}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
