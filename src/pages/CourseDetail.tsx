import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatPrice, getCourseById } from "../data/content";
import { courseFacts, shortDate } from "../data/courseFacts";
import { plansForLevel, programFromInterest, programs } from "../data/enroll";
import {
  addCourseComment,
  getCourseComments,
  type CourseComment,
} from "../lib/courseComments";
import { PageShell, Reveal } from "../components/PageShell";
import { SafeImage } from "../components/SafeImage";
import { MemberAvatar } from "../components/TeachersSection";
import { ReadMore } from "../components/ReadMore";
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
    // Retired course ids (classroom, online, kids…) land on the course list.
    return <Navigate to="/courses" replace />;
  }

  const program = programs.find((p) => p.id === programFromInterest(course.id));
  const title = loc(lang, t, course.title, course.titleKey);
  const unit = course.unitKey ? t(course.unitKey) : "";
  const paragraphs = loc(lang, t, course.body, course.descKey)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const highlights = course.highlights ?? [];
  const teachers = (course.teacherIds ?? [])
    .map((tid) => teamLive.find((m) => m.id === tid))
    .filter((m): m is TeamMemberCms => Boolean(m));
  // The one-level monthly price is not shown on course pages.
  const plans = (course.level ? plansForLevel(program, course.id) : (program?.plans ?? [])).filter(
    (p) => p.id !== "m1",
  );
  const fromPrice = plans.length ? Math.min(...plans.map((p) => p.amount)) : 0;
  const discount =
    course.discountPercent != null && course.discountPercent > 0 ? course.discountPercent : 0;
  const salePrice =
    fromPrice > 0 && discount > 0 ? Math.round(fromPrice * (1 - discount / 100)) : 0;
  const facts = courseFacts(course, t);
  const levelText = course.language === "pl"
    ? course.cefr ?? ""
    : course.level
    ? `HSK${course.level}`
    : program?.levels === "hsk"
      ? "HSK 1–6"
      : program?.levels === "kids"
        ? kidsLevelsLive.map((l) => loc(lang, t, l.label, l.labelKey)).join(" · ")
        : "";
  const seatsLabel =
    course.seatsLeft != null
      ? course.seatsLeft <= 0
        ? t("mh_full")
        : t("mh_seats_left").replace("{n}", String(course.seatsLeft))
      : "";
  const enrollTo = `/enroll?interest=${course.id}`;
  // The HSK intensive runs on one fixed timetable (Mon–Sat, 10:00–18:00).
  const isIntensive = program?.id === "intensive";
  const priceLabel = (amount: number) =>
    plans.length > 1 ? t("wz_from").replace("{p}", formatPrice(amount)) : formatPrice(amount);

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
            <div className="cd-media-badges">
              {levelText && <span className="cd-pill">{levelText}</span>}
              {discount > 0 && (
                <span className="cd-pill is-sale">
                  {t("course_discount").replace("{n}", String(discount))}
                </span>
              )}
            </div>
            {seatsLabel && (
              <span className={`cd-media-seats${course.seatsLeft != null && course.seatsLeft <= 3 ? " is-low" : ""}`}>
                {seatsLabel}
              </span>
            )}
          </div>
        </Reveal>

        <div className="cd-body">
          <Reveal>
            <header className="cd-head">
              <h1 className="cd-title">{title}</h1>
              {unit && <p className="cd-unit">{unit}</p>}
              {fromPrice > 0 && (
                <div className="cd-head-pills">
                  <span className="cd-pill is-price">
                    {salePrice > 0 ? (
                      <>
                        <s>{formatPrice(fromPrice)}</s> {formatPrice(salePrice)}
                      </>
                    ) : (
                      priceLabel(fromPrice)
                    )}
                  </span>
                  {discount > 0 && (
                    <span className="cd-pill is-sale">
                      {t("course_discount").replace("{n}", String(discount))}
                    </span>
                  )}
                </div>
              )}
            </header>
          </Reveal>

          {/* When, how long, which level, how much — the first thing under the title,
              one row each, so nobody has to hunt for the class times. */}
          {(isIntensive || levelText || fromPrice > 0) && (
            <Reveal>
              <section className="cd-group cd-when">
                <h2 className="cd-label">{t("cd_when")}</h2>
                <ul className="cd-card cd-sched">
                  {course.startDate && (
                    <SchedRow icon="start" label={t("cd_start")} value={shortDate(course.startDate, lang)} />
                  )}
                  {isIntensive ? (
                    <>
                      <SchedRow icon="cal" label={t("cd_days")} value={t("sched_days")} />
                      <SchedRow icon="clock" label={t("cd_time")} value={t("sched_hours")} />
                      <SchedRow icon="hourglass" label={t("course_duration")} value={t("course_unit")} />
                    </>
                  ) : (
                    <>
                      {facts.timeOfDay && (
                        <SchedRow icon="clock" label={t("cd_time")} value={t(`tod_${facts.timeOfDay}`)} />
                      )}
                      {facts.duration && (
                        <SchedRow icon="hourglass" label={t("course_duration")} value={facts.duration} />
                      )}
                    </>
                  )}
                  {(course.format || course.language === "pl") && (
                    <SchedRow icon="format" label={t("cd_format")} value={t(`fmt_${facts.format}`)} />
                  )}
                  {levelText && <SchedRow icon="level" label={t("cd_level")} value={levelText} />}
                  {course.seatsLeft != null && (
                    <li className="cd-sched-row is-seats">
                      <span className="cd-sched-icon" aria-hidden>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="8" r="3" />
                          <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M16 5.5a3 3 0 0 1 0 5.5M18 14.8c1.4.6 2.3 1.9 2.6 4.2" />
                        </svg>
                      </span>
                      <span className="cd-sched-label">{t("cd_seats")}</span>
                      <span className="cd-sched-value">
                        {course.seatsLeft <= 0
                          ? t("mh_full")
                          : course.seatsTotal
                            ? t("cd_seats_val")
                                .replace("{l}", String(course.seatsLeft))
                                .replace("{t}", String(course.seatsTotal))
                            : t("mh_seats_left").replace("{n}", String(course.seatsLeft))}
                      </span>
                      {course.seatsTotal ? (
                        <span className="cd-seats-bar" aria-hidden>
                          <i
                            className={course.seatsLeft <= 3 ? "is-low" : ""}
                            style={{
                              width: `${Math.min(100, Math.max(4, ((course.seatsTotal - Math.max(0, course.seatsLeft)) / course.seatsTotal) * 100))}%`,
                            }}
                          />
                        </span>
                      ) : null}
                    </li>
                  )}
                  {fromPrice > 0 && (
                    <li className="cd-sched-row is-price">
                      <span className="cd-sched-icon" aria-hidden>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          {SCHED_ICONS.price}
                        </svg>
                      </span>
                      <span className="cd-sched-label">{t("cd_price")}</span>
                      <strong className={`cd-sched-value${salePrice > 0 ? " cd-price-sale" : ""}`}>
                        {salePrice > 0 ? (
                          <>
                            <s>{formatPrice(fromPrice)}</s>
                            {formatPrice(salePrice)}
                          </>
                        ) : (
                          priceLabel(fromPrice)
                        )}
                      </strong>
                    </li>
                  )}
                </ul>
              </section>
            </Reveal>
          )}

          {paragraphs.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("kids_detail_about")}</h2>
                <ReadMore className="cd-card cd-copy" lines={4}>
                  {paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </ReadMore>
              </section>
            </Reveal>
          )}

          {course.syllabus && course.syllabus.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{t("cd_syllabus")}</h2>
                <ol className="cd-card cd-syllabus">
                  {course.syllabus.map((line, n) => (
                    <li key={`${n}-${line.slice(0, 16)}`}>
                      <span className="cd-syl-n">{n + 1}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
          )}

          {highlights.length > 0 && (
            <Reveal>
              <section className="cd-group">
                <h2 className="cd-label">{course.level ? t("course_learn") : t("course_advantages")}</h2>
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
                <h2 className="cd-label">{course.level ? t("course_fees_title") : t("enroll_plan")}</h2>
                <ul className="cd-card cd-list">
                  {plans.map((p) => {
                    const cut =
                      discount > 0 ? Math.round(p.amount * (1 - discount / 100)) : 0;
                    return (
                      <li key={p.id} className="cd-row">
                        <span>{t(p.labelKey)}</span>
                        <strong className={cut > 0 ? "cd-price-sale" : undefined}>
                          {cut > 0 ? (
                            <>
                              <s>{formatPrice(p.amount)}</s>
                              {formatPrice(cut)}
                            </>
                          ) : (
                            formatPrice(p.amount)
                          )}
                        </strong>
                      </li>
                    );
                  })}
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

          {course.ctaKey && (
            <Reveal>
              <section className="cd-group cd-cta">
                <p>{t(course.ctaKey)}</p>
                <Link to={enrollTo} className="btn btn-seal" onClick={() => void hapticLight()}>
                  <span>{t("register_cta")}</span>
                </Link>
              </section>
            </Reveal>
          )}

          <Reveal>
            <section className="cd-group">
              <h2 className="cd-label">{t("course_reviews")}</h2>
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
              {salePrice > 0 && <em className="cd-bar-was">{formatPrice(fromPrice)}</em>}
              <strong>{priceLabel(salePrice > 0 ? salePrice : fromPrice)}</strong>
              {seatsLabel && <span className="cd-bar-seats">{seatsLabel}</span>}
            </>
          ) : (
            <strong>{title}</strong>
          )}
        </div>
        <Link to={enrollTo} className="btn btn-seal" onClick={() => void hapticLight()}>
          <span>{course.seatsLeft != null && course.seatsLeft <= 0 ? t("mh_full") : t("cd_enroll")}</span>
        </Link>
      </div>,
        document.body,
      )}
    </PageShell>
  );
}

const SCHED_ICONS = {
  cal: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  hourglass: <path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 4.5-8 8.5s8 4 8 8.5" />,
  level: <path d="M5 19V14M10 19V10M15 19V7M20 19V4" />,
  price: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  start: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4" />
    </>
  ),
  format: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2.5" />
      <path d="M8 20h8M12 16.5V20" />
    </>
  ),
};

function SchedRow({
  icon,
  label,
  value,
  strong = false,
}: {
  icon: keyof typeof SCHED_ICONS;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <li className={`cd-sched-row is-${icon}`}>
      <span className="cd-sched-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {SCHED_ICONS[icon]}
        </svg>
      </span>
      <span className="cd-sched-label">{label}</span>
      {strong ? <strong className="cd-sched-value">{value}</strong> : <span className="cd-sched-value">{value}</span>}
    </li>
  );
}

function TeacherTile({ member }: { member: TeamMemberCms }) {
  const { t, lang } = useI18n();
  const name = loc(lang, t, member.name, member.nameKey);
  // The director is on every course: just name and role, so her card
  // doesn't show other levels or run taller than the teachers'.
  const director = member.roleKey === "teacher_role_director";
  const bio = director ? "" : loc(lang, t, member.bio);
  return (
    <li className="cd-teacher">
      <MemberAvatar photo={member.photo} name={name} className="cd-teacher-photo" />
      <strong>{name}</strong>
      <small>{loc(lang, t, member.role, member.roleKey)}</small>
      {!director && member.hsk.length > 0 && <em>HSK{member.hsk.join(" · ")}</em>}
      {bio && <p>{bio}</p>}
    </li>
  );
}
