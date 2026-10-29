import { useState } from "react";
import { MultiLangField } from "../../components/admin/MultiLangField";
import { ImageUpload } from "../../components/admin/ImageUpload";
import { mergeTeam, type TeamMemberCms } from "../../lib/cms";
import { emptyI18nText, loc } from "../../lib/i18nText";
import { useSiteContent } from "../../lib/SiteContentContext";
import { useI18n } from "../../i18n/I18nContext";

function blankMember(): TeamMemberCms {
  return {
    id: `m-${Date.now().toString(36)}`,
    name: emptyI18nText(),
    role: emptyI18nText(),
    level: emptyI18nText(),
    bio: emptyI18nText(),
    hsk: [],
    photo: "",
  };
}

/** Edit the team shown on About and on course pages (stored in the site bundle). */
export function AdminTeam() {
  const { t } = useI18n();
  const { bundle, saveBundle } = useSiteContent();
  const [team, setTeam] = useState(() => mergeTeam(bundle));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await saveBundle({ ...bundle, team });
    setBusy(false);
    if (res.error) setErr(res.error);
    else setMsg(t("admin_saved"));
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>{t("admin_team")}</h1>
        <p>{t("admin_team_lead")}</p>
        <button
          type="button"
          className="admin-btn is-seal"
          disabled={busy}
          onClick={() => void save()}
        >
          {t("admin_save")}
        </button>
      </header>

      {err && <p className="admin-err">{err}</p>}
      {msg && <p className="admin-ok">{msg}</p>}

      {team.map((member, i) => (
        <MemberEditor
          key={member.id}
          value={member}
          onChange={(next) =>
            setTeam((prev) => prev.map((x, idx) => (idx === i ? next : x)))
          }
          onRemove={() => setTeam((prev) => prev.filter((_, idx) => idx !== i))}
        />
      ))}

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn"
          onClick={() => setTeam((prev) => [...prev, blankMember()])}
        >
          + {t("admin_team_add")}
        </button>
      </div>
    </div>
  );
}

function MemberEditor({
  value,
  onChange,
  onRemove,
}: {
  value: TeamMemberCms;
  onChange: (v: TeamMemberCms) => void;
  onRemove: () => void;
}) {
  const { t, lang } = useI18n();
  // Members that still come from the built-in list show their translated name as the heading.
  const heading = loc(lang, t, value.name, value.nameKey) || value.id;
  // Raw text so "4, " can be typed; the parsed numbers are what gets saved.
  const [hskText, setHskText] = useState(() => value.hsk.join(", "));

  return (
    <section className="admin-card admin-cms-form">
      <div className="admin-row-head">
        <h3>{heading}</h3>
        <button type="button" className="admin-btn is-danger" onClick={onRemove}>
          {t("admin_team_remove")}
        </button>
      </div>
      <div className="admin-form-grid">
        <MultiLangField
          label={t("admin_team_name")}
          value={value.name}
          placeholder={value.nameKey ? t(value.nameKey) : ""}
          onChange={(name) => onChange({ ...value, name, nameKey: undefined })}
        />
        <MultiLangField
          label={t("admin_team_role")}
          value={value.role}
          placeholder={value.roleKey ? t(value.roleKey) : ""}
          onChange={(role) => onChange({ ...value, role, roleKey: undefined })}
        />
        <MultiLangField
          label={t("admin_team_level")}
          value={value.level}
          placeholder={value.levelKey ? t(value.levelKey) : ""}
          onChange={(level) => onChange({ ...value, level, levelKey: undefined })}
        />
        <label className="admin-field">
          <span>{t("admin_team_hsk")}</span>
          <input
            value={hskText}
            inputMode="numeric"
            onChange={(e) => {
              setHskText(e.target.value);
              onChange({
                ...value,
                hsk: e.target.value
                  .split(/[,\s]+/)
                  .filter(Boolean)
                  .map(Number)
                  .filter((n) => Number.isInteger(n) && n >= 1 && n <= 9),
              });
            }}
          />
        </label>
        <MultiLangField
          label={t("admin_team_bio")}
          value={value.bio}
          multiline
          rows={3}
          onChange={(bio) => onChange({ ...value, bio })}
        />
        <div className="admin-field">
          <span>{t("admin_team_photo")}</span>
          <ImageUpload
            value={value.photo}
            onChange={(photo) => onChange({ ...value, photo })}
            folder="team"
          />
        </div>
      </div>
    </section>
  );
}
