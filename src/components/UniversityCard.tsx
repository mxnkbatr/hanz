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
