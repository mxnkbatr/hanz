import { useState } from "react";
import { classDay, teachersMeta } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { Reveal, Stagger, StaggerItem } from "./PageShell";

type Teacher = (typeof teachersMeta)[number];

/** Portrait when the file exists, otherwise the first letter of the given name. */
function TeacherAvatar({ teacher, name }: { teacher: Teacher; name: string }) {
  const [failed, setFailed] = useState(false);
  const initial = name.split(" ").pop()?.charAt(0) ?? "";

  if (teacher.photo && !failed) {
    return (
      <span className="teacher-avatar has-photo">
        <img
          className="photo"
          src={teacher.photo}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <span className="teacher-avatar" aria-hidden>
      {initial}
    </span>
  );
}

/** The team (director, teachers by level, manager) plus the daily class hours. About page, phone and desktop. */
export function TeachersSection() {
  const { t } = useI18n();

  return (
    <section className="section teachers-section">
      <Reveal>
        <p className="eyebrow">{t("teachers_title")}</p>
        <h2 className="h2">{t("teachers_title")}</h2>
        <p className="lead">{t("teachers_lead")}</p>
      </Reveal>

      <Stagger className="teachers-grid">
        {teachersMeta.map((teacher) => {
          const name = t(teacher.nameKey);
          return (
            <StaggerItem key={teacher.id}>
              <article className="teacher-card">
                <TeacherAvatar teacher={teacher} name={name} />
                <div className="teacher-body">
                  <h3>{name}</h3>
                  <p className="teacher-role">{t(teacher.roleKey ?? "teacher_role")}</p>
                  {teacher.levelKey && <p className="teacher-level">{t(teacher.levelKey)}</p>}
                  {teacher.hsk && (
                    <ul className="teacher-hsk" aria-label="HSK">
                      {teacher.hsk.map((n) => (
                        <li key={n}>HSK {n}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </StaggerItem>
          );
        })}
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
