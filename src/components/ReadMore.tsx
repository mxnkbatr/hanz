import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useDesktop } from "../hooks/useDesktop";
import { useI18n } from "../i18n/I18nContext";
import { hapticLight } from "../lib/native";

/**
 * Phones: long copy shows its first few lines with "Read more", like App Store
 * descriptions; desktop shows it all. The button only appears when the text is
 * actually cut off.
 */
export function ReadMore({
  lines = 3,
  className = "",
  children,
}: {
  lines?: number;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const desktop = useDesktop();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || desktop || open) return;
    const measure = () => setCut(el.scrollHeight > el.clientHeight + 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desktop, open, children]);

  if (desktop) return <div className={className}>{children}</div>;

  return (
    <div className={`read-more${open ? " is-open" : ""} ${className}`}>
      <div ref={ref} className="read-more-body" style={open ? undefined : { WebkitLineClamp: lines }}>
        {children}
      </div>
      {(cut || open) && (
        <button
          type="button"
          className="read-more-toggle"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
            void hapticLight();
          }}
        >
          {open ? t("read_less") : t("read_more")}
        </button>
      )}
    </div>
  );
}
