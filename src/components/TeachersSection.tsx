import { useState } from "react";
import { classDay } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import type { TeamMemberCms } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { useSiteContent } from "../lib/SiteContentContext";
import { Reveal, Stagger, StaggerItem } from "./PageShell";

/**
 * Portrait when the file exists, otherwise the first letter of the given name.
 * `className` styles the frame (team card, course page tile, enroll strip).
 */
export function MemberAvatar({
  photo,
  name,
  className = "teacher-avatar",
}: {
  photo: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.split(" ").pop()?.charAt(0) ?? "";

  if (photo && !failed) {
    return (
      <span className={`${className} has-photo`}>
        <img
          className="photo"
          src={photo}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <span className={className} aria-hidden>
      {initial}
    </span>
  );
}

/** One team member: portrait, name, role, teaching level, HSK classes and an optional bio. */
export function TeamCard({ member, showBio = false }: { member: TeamMemberCms; showBio?: boolean }) {
  const { t, lang } = useI18n();
  const name = loc(lang, t, member.name, member.nameKey);
  const role = loc(lang, t, member.role, member.roleKey);
  const level = loc(lang, t, member.level, member.levelKey);
  const bio = showBio ? loc(lang, t, member.bio) : "";

  return (
    <article className="teacher-card">
      <MemberAvatar photo={member.photo} name={name} />
      <div className="teacher-body">
        <h3>{name}</h3>
        {role && <p className="teacher-role">{role}</p>}
        {level && <p className="teacher-level">{level}</p>}
        {member.hsk.length > 0 && (
          <ul className="teacher-hsk" aria-label="HSK">
            {member.hsk.map((n) => (
              <li key={n}>HSK {n}</li>
            ))}
          </ul>
        )}
        {bio && <p className="teacher-bio">{bio}</p>}
      </div>
    </article>
  );
}

/** The team (director, teachers by level, manager) plus the daily class hours. About page, phone and desktop. */
export function TeachersSection() {
  const { t } = useI18n();
  const { teamLive } = useSiteContent();

  return (
    <section className="section teachers-section">
      <Reveal>
        <p className="eyebrow">{t("teachers_title")}</p>
        <h2 className="h2">{t("teachers_title")}</h2>
        <p className="lead">{t("teachers_lead")}</p>
      </Reveal>

      <Stagger className="teachers-grid">
        {teamLive.map((member) => (
          <StaggerItem key={member.id}>
            <TeamCard member={member} />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <dl className="class-hours">
          <div>
            <dt>{t("class_hours_t")}</dt>
            <dd>
              {classDay.start}–{classDay.end}
            </dd>
          </div>
          <div>
            <dt>{t("lunch_break_t")}</dt>
            <dd>
              {classDay.lunchStart}–{classDay.lunchEnd}
            </dd>
          </div>
        </dl>
      </Reveal>
    </section>
  );
}
