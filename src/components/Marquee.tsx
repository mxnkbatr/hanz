import { useI18n } from "../i18n/I18nContext";

/** Endless word strip. The slide is a CSS animation (.marquee-track), off the main thread. */
export function Marquee() {
  const { t } = useI18n();
  const items = [
    t("marquee_1"),
    t("marquee_2"),
    t("marquee_3"),
    t("marquee_4"),
    t("marquee_5"),
    t("marquee_6"),
  ];
  const row = [...items, ...items];

  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            {item}
            <em>·</em>
          </span>
        ))}
      </div>
    </div>
  );
}
