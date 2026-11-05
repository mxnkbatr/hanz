import { Link } from "react-router-dom";
import { cityLabel, getUniversityBySlug, universities, type University } from "../data/universities";
import { useI18n } from "../i18n/I18nContext";

/** Photo if we have a free one; otherwise a calm card with the Chinese name. */
export function UniversityMedia({
  u,
  className = "",
  eager = false,
}: {
  u: University;
  className?: string;
  /** The page header photo loads right away; card photos wait until they scroll near. */
  eager?: boolean;
}) {
  if (u.photo) {
    return (
      <span className={`uni-media ${className}`}>
        <img className="photo" src={u.photo.src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
      </span>
    );
  }
  return (
    <span className={`uni-media is-placeholder ${className}`} aria-hidden>
      <span>{u.zh ?? u.name.charAt(0)}</span>
    </span>
  );
}

const cityLine = (u: University, city: string) =>
  `${city}${city && u.founded ? " · " : ""}${u.founded ?? ""}`;

/** Phone: big photo card for the featured rail at the top of /university. */
export function UniversityFeature({ u }: { u: University }) {
  const { lang } = useI18n();
  return (
    <Link to={`/university/${u.slug}`} className="uni-feature">
      <UniversityMedia u={u} className="uni-feature-media" />
      <span className="uni-feature-shade" aria-hidden />
      <span className="uni-feature-body">
        {u.zh && (
          <small lang="zh" className="uni-feature-zh">
            {u.zh}
          </small>
        )}
        <strong>{u.name}</strong>
        <em>{cityLine(u, cityLabel(u, lang))}</em>
      </span>
    </Link>
  );
}

/** Phone: one row of the A–Z list, like a Contacts entry. */
export function UniversityRow({ u }: { u: University }) {
  const { lang } = useI18n();
  const line = [u.zh, cityLine(u, cityLabel(u, lang))].filter(Boolean).join(" · ");
  return (
    <Link to={`/university/${u.slug}`} className="uni-row">
      <span className="uni-row-thumb">
        {u.photo ? (
          <img className="photo" src={u.photo.src} alt="" loading="lazy" decoding="async" />
        ) : (
          <span aria-hidden lang="zh">
            {(u.zh ?? u.name).charAt(0)}
          </span>
        )}
      </span>
      <span className="uni-row-body">
        <strong>{u.name}</strong>
        {line && <small>{line}</small>}
      </span>
      <svg className="uni-row-chevron" viewBox="0 0 12 12" aria-hidden>
        <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

/** A university from the academy's list; opens its page. Takes the English name or the record. */
export function UniversityCard({ name, university }: { name?: string; university?: University }) {
  const { lang } = useI18n();
  const u = university ?? universities.find((x) => x.name === name) ?? getUniversityBySlug(name ?? "");
  if (!u) return null;
  const city = cityLabel(u, lang);

  return (
    <Link to={`/university/${u.slug}`} className="uni-tile">
      <UniversityMedia u={u} className="uni-tile-media" />
      <span className="uni-tile-body">
        <strong>{u.name}</strong>
        {u.zh && <small lang="zh">{u.zh}</small>}
        {(city || u.founded) && (
          <em>
            {city}
            {city && u.founded ? " · " : ""}
            {u.founded ?? ""}
          </em>
        )}
      </span>
    </Link>
  );
}
