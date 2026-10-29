import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatPrice, getCourseById } from "../data/content";
import { programFromInterest, programs } from "../data/enroll";
import {
  addCourseComment,
  getCourseComments,
  type CourseComment,
} from "../lib/courseComments";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { MemberAvatar } from "../components/TeachersSection";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import type { CourseLive, TeamMemberCms } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { hapticLight } from "../lib/native";

/**
 * Course page, iOS 26 style: a big media header, quick facts as glass chips,
 * grouped inset sections (about, advantages, teachers, fees, reviews) and one
 * floating "Enrol" bar that opens the step-by-step enrollment (/enroll).
 */
export function CourseDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const { coursesLive, kidsLevelsLive, teamLive } = useSiteContent();
  const course = (coursesLive.find((c) => c.id === id) ?? getCourseById(id)) as CourseLive | undefined;

  const [comments, setComments] = useState<CourseComment[]>(() => (id ? getCourseComments(id) : []));
  const [commentStatus, setCommentStatus] = useState<"idle" | "ok">("idle");

  if (!course) {
    // legacy slot urls → kids program
    if (id.includes("__")) return <Navigate to="/courses/kids" replace />;
    return <Navigate to="/courses" replace />;
  }

  const program = programs.find((p) => p.id === programFromInterest(course.id));
  const title = loc(lang, t, course.title, course.titleKey);
  const tag = loc(lang, t, course.tag, course.tagKey);
  const unit = course.unitKey ? t(course.unitKey) : "";
  const paragraphs = loc(lang, t, course.body, course.descKey)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const highlights = course.highlights ?? [];
  const teachers = (course.teacherIds ?? [])
    .map((tid) => teamLive.find((m) => m.id === tid))
    .filter((m): m is TeamMemberCms => Boolean(m));
  const plans = program?.plans ?? [];
  const fromPrice = plans.length ? Math.min(...plans.map((p) => p.amount)) : 0;
  const levelText =
    program?.levels === "hsk"
      ? "HSK 1–6"
      : program?.levels === "kids"
        ? kidsLevelsLive.map((l) => loc(lang, t, l.label, l.labelKey)).join(" · ")
        : "";
  const enrollTo = `/enroll?interest=${course.id}`;

  function onComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("cname") || "").trim();
    const text = String(data.get("ctext") || "").trim();
    if (!name || !text || !course) return;
    const next = addCourseComment(course.id, { name, text });
    setComments((prev) => [next, ...prev]);
    setCommentStatus("ok");
    e.currentTarget.reset();
    void hapticLight();
  }

  const dateFmt = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : lang === "en" ? "en" : "mn", {
    month: "short",
    day: "numeric",
  });

  return (
    <PageShell className="page-courses page-course-detail cd">
      <div className="cd-layout">
        {/* Media header: poster shown whole when there is one, else the photo */}
        <Reveal className="cd-media-wrap">
          <div className={`cd-media${course.poster ? " is-poster" : ""}`}>
            <SafeImage src={course.poster || course.image} alt={title} loading="eager" />
            <Link to="/courses" className="cd-back" aria-label={t("back")}>
              ←
            </Link>
          </div>
        </Reveal>

        <div className="cd-body">
          <Reveal>
            <header className="cd-head">
              {tag && <span className="cd-tag">{tag}</span>}
              <h1 className="cd-title">{title}</h1>
              {unit && <p className="cd-unit">{unit}</p>}
              {course.id === "hsk" && (
                <Link to="/hsk" className="text-link">
                  {t("hsk_levels_link")} <i aria-hidden>→</i>
                </Link>
              )}
            </header>
          </Reveal>

          {/* Quick facts */}
          {(program?.schedules.length || levelText || fromPrice) && (
            <Reveal>
              <ul className="cd-facts">
                {program?.schedules.length ? (
                  <li>
                    <span>{t("enroll_schedule")}</span>
                    <strong>
                      {program.schedules.length === 1
                        ? t(program.schedules[0].labelKey)
                        : t("cd_schedule_options").replace("{n}", String(program.schedules.length))}
                    </strong>
                  </li>
                ) : null}
                {levelText && (
                  <li>
                    <span>{t("enroll_level")}</span>
                    <strong>{levelText}</strong>
                  </li>
                )}
                {fromPrice > 0 && (
                  <li>
                    <span>{t("enroll_plan")}</span>
                    <strong>
                      {plans.length > 1 ? t("wz_from").replace("{p}", formatPrice(fromPrice)) : formatPrice(fromPrice)}
                    </strong>
                  </li>
                )}
              </ul>
            </Reveal>
          )}

          {paragraphs.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("kids_detail_about")}</h2>
                <div className="cd-card cd-copy">
                  {paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {highlights.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("course_advantages")}</h2>
                <ul className="cd-card cd-list">
                  {highlights.map((h) => (
                    <li key={h}>
                      <span className="cd-check" aria-hidden>
                        ✓
                      </span>
                      <span>{t(h)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {teachers.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("course_teachers")}</h2>
                <ul className="cd-teachers">
                  {teachers.map((m) => (
                    <TeacherTile key={m.id} member={m} />
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {plans.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("enroll_plan")}</h2>
                <ul className="cd-card cd-list">
                  {plans.map((p) => (
                    <li key={p.id} className="cd-row">
                      <span>{t(p.labelKey)}</span>
                      <strong>{formatPrice(p.amount)}</strong>
                    </li>
                  ))}
                  {program && program.schedules.length > 1 &&
                    program.schedules.map((s) => (
                      <li key={s.id} className="cd-row is-muted">
                        <span>{t(s.labelKey)}</span>
                      </li>
                    ))}
                </ul>
              </section>
            </Reveal>
          )}

          <Reveal>
            <section className="cd-group">
              <h2 className="cd-label">{t("kids_comments_title")}</h2>
              {comments.length > 0 && (
                <ul className="cd-card cd-comments">
                  {comments.map((c) => (
                    <li key={c.id}>
                      <div>
                        <strong>{c.name}</strong>
                        <em>{dateFmt.format(new Date(c.createdAt))}</em>
                      </div>
                      <p>{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              <form className="cd-card course-comment-form" onSubmit={onComment}>
                <label>
                  <span>{t("kids_comments_name")}</span>
                  <input name="cname" required autoComplete="name" maxLength={80} />
                </label>
                <label>
                  <span>{t("kids_comments_text")}</span>
                  <textarea name="ctext" rows={3} required placeholder={t("kids_comments_ph")} maxLength={1000} />
                </label>
                {commentStatus === "ok" && <p className="course-comment-ok">{t("kids_comments_ok")}</p>}
                <button type="submit" className="btn btn-ink">
                  <span>{t("kids_comments_send")}</span>
                </button>
              </form>
            </section>
          </Reveal>
        </div>
      </div>

      {/* One clear action, always in reach. Portaled: PageShell transforms would trap position: fixed. */}
      {createPortal(
      <div className="cd-bar">
        <div className="cd-bar-price">
          {fromPrice > 0 ? (
            <>
              <strong>
                {plans.length > 1 ? t("wz_from").replace("{p}", formatPrice(fromPrice)) : formatPrice(fromPrice)}
              </strong>
            </>
          ) : (
            <strong>{title}</strong>
          )}
        </div>
        <Link to={enrollTo} className="btn btn-seal" onClick={() => void hapticLight()}>
          <span>{t("wz_submit")}</span>
        </Link>
      </div>,
        document.body,
      )}
    </PageShell>
  );
}

function TeacherTile({ member }: { member: TeamMemberCms }) {
  const { t, lang } = useI18n();
  const name = loc(lang, t, member.name, member.nameKey);
  const bio = loc(lang, t, member.bio);
  return (
    <li className="cd-teacher">
      <MemberAvatar photo={member.photo} name={name} className="cd-teacher-photo" />
      <strong>{name}</strong>
      <small>{loc(lang, t, member.role, member.roleKey)}</small>
      {member.hsk.length > 0 && <em>HSK {member.hsk.join(" · ")}</em>}
      {bio && <p>{bio}</p>}
    </li>
  );
}
