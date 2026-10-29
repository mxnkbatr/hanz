import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

/**
 * One university from the academy's list: a monogram, the name, and a link to
 * the consultation form with that school filled in.
 */
export function UniversityCard({ name }: { name: string }) {
  const { t } = useI18n();
  const initial = name.replace(/^(The|University of)\s+/i, "").charAt(0);

  return (
    <Link
      to={`/enroll?interest=consult&uni=china&school=${encodeURIComponent(name)}`}
      className="uni-tile"
    >
      <span className="uni-tile-mark" aria-hidden>
        {initial}
      </span>
      <strong>{name}</strong>
      <em>
        {t("uni_tile_cta")} <i aria-hidden>→</i>
      </em>
    </Link>
  );
}
