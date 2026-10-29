import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCourseById } from "../data/content";
import {
  addCourseComment,
  getCourseComments,
  type CourseComment,
} from "../lib/courseComments";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { StickyCta } from "../components/StickyCta";
import { SuccessBurst } from "../components/SuccessBurst";
import { TeamCard } from "../components/TeachersSection";
import { useI18n } from "../i18n/I18nContext";
import { useSiteContent } from "../lib/SiteContentContext";
import type { CourseLive } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { getSupabase } from "../lib/supabase";
import { hapticLight } from "../lib/native";
import { PhotoGlow } from "../components/PhotoGlow";

export function CourseDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const {
    coursesLive,
    kidsLevelsLive,
    kidsSchedulesLive,
    kidsTeachersLive,
    teamLive,
  } = useSiteContent();
  const course = (coursesLive.find((c) => c.id === id) ??
    getCourseById(id)) as CourseLive | undefined;

  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [level, setLevel] = useState(
    () => kidsLevelsLive[0]?.id || "beginner",
  );
  const [schedule, setSchedule] = useState(
    () => kidsSchedulesLive[0]?.id || "wd_afternoon",
  );
  const [comments, setComments] = useState<CourseComment[]>(() =>
    id ? getCourseComments(id) : [],
  );
  const [commentStatus, setCommentStatus] = useState<"idle" | "ok">("idle");

  const isKids = course?.id === "kids";
  const levelMeta = kidsLevelsLive.find((l) => l.id === level);
  const teachers = useMemo(() => {
    if (!levelMeta) return [];
    return kidsTeachersLive.filter((teacher) =>
      levelMeta.teacherIds.includes(teacher.id),
    );
  }, [levelMeta, kidsTeachersLive]);

  if (!course) {
    // legacy slot urls → kids program
    if (id.includes("__")) return <Navigate to="/courses/kids" replace />;
    return <Navigate to="/courses" replace />;
  }

  const title = loc(lang, t, course.title, course.titleKey);
  const tag = loc(lang, t, course.tag, course.tagKey);
  const unit = course.unitKey ? t(course.unitKey) : "";
  const bodyText = loc(lang, t, course.body, course.descKey);
  const paragraphs = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const highlights = course.highlights ?? [];
  const courseTeachers = (course.teacherIds ?? [])
    .map((tid) => teamLive.find((m) => m.id === tid))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  async function onEnroll(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!course) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const childName = String(data.get("child_name") || "").trim();
    const childAge = String(data.get("child_age") || "").trim();
    const note = String(data.get("msg") || "").trim();
    if (!name || !phone) return;
    if (isKids && (!childName || !level || !schedule)) return;

    setStatus("sending");
    const schMeta = kidsSchedulesLive.find((s) => s.id === schedule);
    const courseTitle = loc(lang, t, course.title, course.titleKey);
    const message = isKids
      ? [
          `${t("kids_form_child")}: ${childName}`,
          `${t("kids_form_level")}: ${
            levelMeta
              ? loc(lang, t, levelMeta.label, levelMeta.labelKey)
              : level
          }`,
          `${t("kids_form_schedule")}: ${
            schMeta ? loc(lang, t, schMeta.meta, schMeta.metaKey) : schedule
          }`,
          note,
        ]
          .filter(Boolean)
          .join("\n")
      : [note, `${t("nav_courses")}: ${courseTitle}`]
          .filter(Boolean)
          .join("\n");

    const supabase = await getSupabase();
    const { error } = await supabase.from("enrollments").insert({
      name,
      phone,
      kind: "course",
      interest: course.id,
      child_age: isKids ? childAge || null : null,
      message,
    });

    if (error) {
      console.error("[course-enroll]", error);
      setStatus("err");
      return;
    }
    setStatus("ok");
    e.currentTarget.reset();
    void hapticLight();
  }

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

  const dateFmt = new Intl.DateTimeFormat(
    lang === "zh" ? "zh-CN" : lang === "en" ? "en" : "mn",
    { month: "short", day: "numeric" },
  );

  if (status === "ok") {
    return (
      <PageShell className="page-courses page-course-detail is-app ios-app">
        <Reveal>
          <div className="kids-enroll-success">
            <SuccessBurst
              title={t("form_success_title")}
              message={t("kids_enroll_ok")}
              doneLabel={t("kids_enroll_again")}
              onDone={() => setStatus("idle")}
            />
          </div>
        </Reveal>
      </PageShell>
    );
  }

  return (
    <PageShell className="page-courses page-course-detail is-app ios-app">
      <Reveal>
        <Link to="/courses" className="text-link back-link">
          ← {t("back")}
        </Link>
      </Reveal>

      <PhotoGlow src={course.image} />
      <article className="course-detail">
        <Reveal>
          {/* The course poster when there is one (shown whole), else the photo. */}
          <div className={`course-detail-hero-media${course.poster ? " is-poster" : ""}`}>
            <SafeImage
              src={course.poster || course.image}
              alt={title}
              loading="eager"
            />
          </div>
        </Reveal>

        <Reveal>
          <header className="course-detail-hero">
            <div className="course-detail-hero-top">
              <span className="course-detail-pill">{tag}</span>
              {isKids && (
                <span className="course-card-age">{t("kids_detail_online")}</span>
              )}
            </div>
            <h1 className="h1">{title}</h1>
            {unit && <p className="course-detail-lead">{unit}</p>}
            {course.id === "hsk" && (
              <Link to="/hsk" className="text-link">
                {t("hsk_levels_link")} <i aria-hidden>→</i>
              </Link>
            )}
          </header>
        </Reveal>

        <Reveal>
          <section className="course-detail-block">
            <h2 className="ios-label">{t("kids_detail_about")}</h2>
            <div className="course-detail-copy">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </section>
        </Reveal>

        {highlights.length > 0 && (
          <Reveal>
            <section className="course-detail-block">
              <h2 className="ios-label">{t("course_advantages")}</h2>
              <ol className="course-advantages">
                {highlights.map((key, i) => (
                  <li key={key}>
                    <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    <p>{t(key)}</p>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>
        )}

        {courseTeachers.length > 0 && (
          <Reveal>
            <section className="course-detail-block">
              <h2 className="ios-label">{t("course_teachers")}</h2>
              <div className="course-teachers">
                {courseTeachers.map((member) => (
                  <TeamCard key={member.id} member={member} showBio />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {isKids && (
          <>
            <Reveal>
              <section className="course-detail-block">
                <h2 className="ios-label">{t("kids_form_level")}</h2>
                <div className="course-detail-slots">
                  {kidsLevelsLive.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`course-detail-slot${
                        level === l.id ? " is-active" : ""
                      }`}
                      onClick={() => {
                        setLevel(l.id);
                        void hapticLight();
                      }}
                    >
                      <strong>{loc(lang, t, l.label, l.labelKey)}</strong>
                      <em>{loc(lang, t, l.age, l.ageKey)}</em>
                    </button>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="course-detail-block">
                <h2 className="ios-label">{t("kids_teachers_label")}</h2>
                <ul className="course-detail-teachers">
                  {teachers.map((teacher) => {
                    const name = loc(lang, t, teacher.name, teacher.nameKey);
                    return (
                      <li key={teacher.id}>
                        <SafeImage
                          src={teacher.photo}
                          alt={name}
                          className="course-detail-teacher-photo"
                        />
                        <span>{name}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section className="course-detail-block">
                <h2 className="ios-label">{t("kids_pick_schedule")}</h2>
                <div className="course-detail-slots">
                  {kidsSchedulesLive.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`course-detail-slot${
                        schedule === s.id ? " is-active" : ""
                      }`}
                      onClick={() => {
                        setSchedule(s.id);
                        void hapticLight();
                      }}
                    >
                      <strong>{s.time}</strong>
                      <em>{loc(lang, t, s.days, s.daysKey)}</em>
                    </button>
                  ))}
                </div>
              </section>
            </Reveal>
          </>
        )}

        <Reveal>
          <section className="course-detail-block" id="enroll">
            <h2 className="ios-label">{t("kids_detail_enroll")}</h2>
            <form className="kids-ios-form course-detail-form" onSubmit={onEnroll}>
              <div className="ios-list kids-ios-form-list">
                <label className="kids-ios-field">
                  <span>
                    {isKids ? t("kids_form_parent") : t("form_name")}
                  </span>
                  <input name="name" required autoComplete="name" />
                </label>
                <label className="kids-ios-field">
                  <span>{t("form_phone")}</span>
                  <input name="phone" type="tel" required autoComplete="tel" />
                </label>
                {isKids && (
                  <>
                    <label className="kids-ios-field">
                      <span>{t("kids_form_child")}</span>
                      <input name="child_name" required autoComplete="off" />
                    </label>
                    <label className="kids-ios-field">
                      <span>{t("form_child_age")}</span>
                      <input
                        name="child_age"
                        inputMode="numeric"
                        placeholder="7–14"
                        required
                      />
                    </label>
                  </>
                )}
                <label className="kids-ios-field kids-ios-field-area">
                  <span>{t("form_msg")}</span>
                  <textarea
                    name="msg"
                    rows={3}
                    placeholder={t("kids_form_msg_ph")}
                  />
                </label>
              </div>
              {status === "err" && <p className="form-err">{t("form_err")}</p>}
              <button
                type="submit"
                className="btn btn-seal kids-enroll-submit"
                disabled={status === "sending"}
              >
                <span>
                  {status === "sending"
                    ? t("form_sending")
                    : t("kids_detail_enroll")}
                </span>
              </button>
              <p className="kids-enroll-note">{t("kids_enroll_note")}</p>
            </form>
          </section>
        </Reveal>

        <Reveal>
          <section className="course-detail-block section-last">
            <h2 className="ios-label">{t("kids_comments_title")}</h2>
            <form className="course-comment-form" onSubmit={onComment}>
              <label>
                <span>{t("kids_comments_name")}</span>
                <input name="cname" required autoComplete="name" />
              </label>
              <label>
                <span>{t("kids_comments_text")}</span>
                <textarea
                  name="ctext"
                  rows={3}
                  required
                  placeholder={t("kids_comments_ph")}
                />
              </label>
              {commentStatus === "ok" && (
                <p className="course-comment-ok">{t("kids_comments_ok")}</p>
              )}
              <button type="submit" className="btn btn-ink">
                <span>{t("kids_comments_send")}</span>
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="ios-empty">{t("kids_comments_empty")}</p>
            ) : (
              <ul className="course-comment-list">
                {comments.map((c) => (
                  <li key={c.id} className="course-comment-item">
                    <div className="course-comment-meta">
                      <strong>{c.name}</strong>
                      <em>{dateFmt.format(new Date(c.createdAt))}</em>
                    </div>
                    <p>{c.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </article>

      <StickyCta className="course-detail-sticky app-mobile">
        <a
          href="#enroll"
          className="btn btn-seal"
          onClick={() => void hapticLight()}
        >
          <span>{t("kids_detail_enroll")}</span>
        </a>
      </StickyCta>
    </PageShell>
  );
}
