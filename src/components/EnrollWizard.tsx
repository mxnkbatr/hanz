import { useEffect, useState } from "react";
import { formatPrice } from "../data/content";
import {
  hskLevelChoices,
  kidsLevelChoices,
  programFromInterest,
  programs,
  type Choice,
  type Program,
} from "../data/enroll";
import { useI18n } from "../i18n/I18nContext";
import type { CourseLive, TeamMemberCms } from "../lib/cms";
import { loc } from "../lib/i18nText";
import { checkQpayPaid, createQpayInvoice, type QpayInvoice } from "../lib/qpay";
import { useSiteContent } from "../lib/SiteContentContext";
import { getSupabase } from "../lib/supabase";
import { hapticLight } from "../lib/native";
import { SafeImage } from "./SafeImage";
import { MemberAvatar } from "./TeachersSection";

type Step = "program" | "details" | "you" | "pay" | "confirm";
type Phase = "form" | "sending" | "paying" | "paid" | "done";

/** Columns from supabase/enrollments-v2.sql; dropped on retry if the DB doesn't have them yet. */
const V2_COLUMNS = ["hsk_level", "schedule", "plan", "plan_price", "child_name"] as const;

/** The course page behind a programme (intensive = the classroom course). */
const courseIdOf = (programId: string) => (programId === "intensive" ? "classroom" : programId);

/**
 * App-style enrollment: programme → details (teachers, advantages, level,
 * schedule) → your details → payment plan → confirm, then QPay. Starting from a
 * course or HSK card skips the first screen.
 */
export function EnrollWizard({
  defaultInterest,
  defaultLevel = "",
  context,
}: {
  defaultInterest?: string | null;
  defaultLevel?: string;
  /** Extra line saved at the top of the lead message, e.g. the chosen university. */
  context?: string;
}) {
  const { t } = useI18n();
  const { coursesLive, teamLive } = useSiteContent();
  const startProgram = defaultInterest ? programFromInterest(defaultInterest) : "";

  const [programId, setProgramId] = useState(startProgram);
  const [level, setLevel] = useState(defaultLevel);
  const [schedule, setSchedule] = useState("");
  const [plan, setPlan] = useState("");
  const [you, setYou] = useState({ name: "", phone: "", childName: "", childAge: "", note: "" });
  const [step, setStep] = useState<Step>(startProgram ? "details" : "program");
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<QpayInvoice | null>(null);
  const [leadId, setLeadId] = useState("");

  const program = programs.find((p) => p.id === programId);
  const course = program && coursesLive.find((c) => c.id === courseIdOf(program.id));
  const isKids = program?.levels === "kids";
  const levelChoices: Choice[] =
    program?.levels === "hsk" ? hskLevelChoices : isKids ? kidsLevelChoices : [];
  const levelId = levelChoices.some((c) => c.id === level) ? level : "";
  const scheduleId =
    program?.schedules.length === 1
      ? program.schedules[0].id
      : program?.schedules.some((s) => s.id === schedule)
        ? schedule
        : "";
  const planMeta =
    program?.plans.length === 1 ? program.plans[0] : program?.plans.find((p) => p.id === plan);
  const label = (c: Choice) => (c.labelKey.startsWith("HSK ") ? c.labelKey : t(c.labelKey));

  const steps: Step[] = [
    "program",
    "details",
    "you",
    ...(program?.plans.length ? (["pay"] as Step[]) : []),
    "confirm",
  ];
  const index = steps.indexOf(step);

  /** What still blocks "Continue" on this screen (empty = ready). */
  const missing = (() => {
    if (step === "program") return program ? "" : t("wz_pick");
    if (step === "details") {
      if (levelChoices.length && !levelId) return t("wz_pick_level");
      if ((program?.schedules.length ?? 0) > 1 && !scheduleId) return t("wz_pick_schedule");
      return "";
    }
    if (step === "you") {
      if (!you.name.trim() || you.phone.trim().length < 6) return t("wz_fill_contact");
      if (isKids && (!you.childName.trim() || !you.childAge.trim())) return t("wz_fill_child");
      return "";
    }
    if (step === "pay") return planMeta ? "" : t("wz_pick_plan");
    return "";
  })();

  const go = (delta: number) => {
    setError("");
    const next = steps[index + delta];
    if (next) {
      setStep(next);
      void hapticLight();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // While the QR is on screen, ask every 5 s whether the payment went through.
  useEffect(() => {
    if (phase !== "paying" || !leadId) return;
    const timer = window.setInterval(async () => {
      if (await checkQpayPaid(leadId)) setPhase("paid");
    }, 5000);
    return () => window.clearInterval(timer);
  }, [phase, leadId]);

  async function submit() {
    if (!program) return;
    setPhase("sending");
    setError("");
    const id = crypto.randomUUID();
    const levelLabel = levelChoices.find((c) => c.id === levelId);
    const scheduleLabel = program.schedules.find((s) => s.id === scheduleId);
    const message = [
      context,
      `${t("enroll_program")}: ${t(program.labelKey)}`,
      isKids ? `${t("kids_form_child")}: ${you.childName.trim()} (${you.childAge.trim()})` : "",
      levelLabel ? `${t("enroll_level")}: ${label(levelLabel)}` : "",
      scheduleLabel ? `${t("enroll_schedule")}: ${t(scheduleLabel.labelKey)}` : "",
      planMeta ? `${t("enroll_plan")}: ${t(planMeta.labelKey)} · ${formatPrice(planMeta.amount)}` : "",
      you.note.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const base = {
      id,
      name: you.name.trim(),
      phone: you.phone.trim(),
      kind: program.kind,
      interest: program.id,
      child_age: isKids ? you.childAge.trim() || null : null,
      message,
    };
    const structured = {
      hsk_level: levelId || null,
      schedule: scheduleId || null,
      plan: planMeta?.id ?? null,
      plan_price: planMeta?.amount ?? null,
      child_name: isKids ? you.childName.trim() || null : null,
    };

    const supabase = await getSupabase();
    let { error: err } = await supabase.from("enrollments").insert({ ...base, ...structured });
    if (err && V2_COLUMNS.some((c) => err!.message.includes(c))) {
      ({ error: err } = await supabase.from("enrollments").insert(base));
    }
    if (err) {
      console.error("[enroll]", err);
      setError(t("form_err"));
      setPhase("form");
      return;
    }
    setLeadId(id);
    void hapticLight();

    if (!planMeta) {
      setPhase("done");
      return;
    }
    const inv = await createQpayInvoice(id);
    if (inv) {
      setInvoice(inv);
      setPhase("paying");
    } else {
      setPhase("done");
    }
  }

  /* ── After sending ── */
  if (phase === "paying" && invoice) {
    return (
      <section className="wz wz-pay">
        <h2 className="wz-title">{t("wz_pay_title")}</h2>
        <p className="wz-lead">{t("wz_pay_lead")}</p>
        <p className="wz-amount">{formatPrice(invoice.amount)}</p>
        <img className="wz-qr" src={`data:image/png;base64,${invoice.qr_image}`} alt="QPay QR" />
        {invoice.urls.length > 0 && (
          <ul className="wz-banks">
            {invoice.urls.map((u) => (
              <li key={u.link}>
                <a href={u.link}>
                  <img src={u.logo} alt="" loading="lazy" />
                  <span>{u.name}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="wz-waiting">{t("wz_pay_waiting")}</p>
        <div className="wz-actions">
          <button
            type="button"
            className="btn btn-seal"
            onClick={async () => {
              if (await checkQpayPaid(leadId)) setPhase("paid");
            }}
          >
            <span>{t("wz_pay_check")}</span>
          </button>
          <button type="button" className="btn hsk-btn-ghost" onClick={() => setPhase("done")}>
            <span>{t("wz_pay_later")}</span>
          </button>
        </div>
      </section>
    );
  }

  if (phase === "paid" || phase === "done") {
    return (
      <section className="wz wz-done">
        <span className="wz-done-mark" aria-hidden>
          ✓
        </span>
        <h2 className="wz-title">{phase === "paid" ? t("wz_paid_title") : t("form_success_title")}</h2>
        <p className="wz-lead">
          {phase === "paid" ? t("wz_paid_msg") : planMeta ? t("wz_nopay_msg") : t("wz_done_msg")}
        </p>
      </section>
    );
  }

  /* ── The five screens ── */
  return (
    <section className="wz enroll-form">
      <header className="wz-head">
        <ol className="wz-progress" aria-label={`${index + 1} / ${steps.length}`}>
          {steps.map((s, i) => (
            <li key={s} className={i <= index ? "is-on" : undefined} />
          ))}
        </ol>
        <p className="wz-count">
          {index + 1} / {steps.length} · {t(`wz_step_${step}`)}
        </p>
      </header>

      {step === "program" && (
        <div className="wz-programs">
          {programs.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              course={coursesLive.find((c) => c.id === courseIdOf(p.id))}
              active={p.id === programId}
              onPick={() => {
                setProgramId(p.id);
                setLevel("");
                setSchedule("");
                setPlan("");
              }}
            />
          ))}
        </div>
      )}

      {step === "details" && program && (
        <div className="wz-details">
          <div className="wz-course">
            {course && (
              <span className="wz-course-media">
                <SafeImage src={course.poster || course.image} alt="" />
              </span>
            )}
            <div>
              <h2 className="wz-title">{t(program.labelKey)}</h2>
              {course?.unitKey && <p className="wz-lead">{t(course.unitKey)}</p>}
            </div>
          </div>

          {course?.highlights && course.highlights.length > 0 && (
            <ul className="wz-points">
              {course.highlights.map((h) => (
                <li key={h}>{t(h)}</li>
              ))}
            </ul>
          )}

          <TeacherStrip course={course} team={teamLive} />

          {levelChoices.length > 0 && (
            <fieldset className="enroll-choices">
              <legend>{t("enroll_level")}</legend>
              {levelChoices.map((c) => (
                <label key={c.id} className={`enroll-chip${levelId === c.id ? " is-on" : ""}`}>
                  <input type="radio" name="level" checked={levelId === c.id} onChange={() => setLevel(c.id)} />
                  <span>{label(c)}</span>
                </label>
              ))}
            </fieldset>
          )}

          {program.schedules.length === 1 && (
            <p className="enroll-fixed">
              <span>{t("enroll_schedule")}</span>
              <strong>{t(program.schedules[0].labelKey)}</strong>
            </p>
          )}
          {program.schedules.length > 1 && (
            <fieldset className="enroll-choices is-stacked">
              <legend>{t("enroll_schedule")}</legend>
              {program.schedules.map((s) => (
                <label key={s.id} className={`enroll-chip${scheduleId === s.id ? " is-on" : ""}`}>
                  <input type="radio" name="schedule" checked={scheduleId === s.id} onChange={() => setSchedule(s.id)} />
                  <span>{t(s.labelKey)}</span>
                </label>
              ))}
            </fieldset>
          )}
          {program.id === "consult" && <p className="wz-lead">{t("wz_consult_lead")}</p>}
        </div>
      )}

      {step === "you" && (
        <div className="wz-fields consult-form">
          <label>
            <span>{isKids ? t("kids_form_parent") : t("form_name")}</span>
            <input
              value={you.name}
              onChange={(e) => setYou({ ...you, name: e.target.value })}
              autoComplete="name"
              maxLength={80}
            />
          </label>
          <label>
            <span>{t("form_phone")}</span>
            <input
              value={you.phone}
              onChange={(e) => setYou({ ...you, phone: e.target.value })}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
            />
          </label>
          {isKids && (
            <>
              <label>
                <span>{t("kids_form_child")}</span>
                <input
                  value={you.childName}
                  onChange={(e) => setYou({ ...you, childName: e.target.value })}
                  maxLength={80}
                />
              </label>
              <label>
                <span>{t("form_child_age")}</span>
                <input
                  value={you.childAge}
                  onChange={(e) => setYou({ ...you, childAge: e.target.value })}
                  inputMode="numeric"
                  placeholder="7–14"
                  maxLength={10}
                />
              </label>
            </>
          )}
          <label>
            <span>{t("form_msg")}</span>
            <textarea
              value={you.note}
              onChange={(e) => setYou({ ...you, note: e.target.value })}
              rows={3}
              maxLength={1000}
            />
          </label>
        </div>
      )}

      {step === "pay" && program && (
        <div className="wz-plans">
          <fieldset className="enroll-choices enroll-plans">
            <legend>{t("enroll_plan")}</legend>
            {program.plans.map((p) => (
              <label key={p.id} className={`enroll-plan${planMeta?.id === p.id ? " is-on" : ""}`}>
                <input type="radio" name="plan" checked={planMeta?.id === p.id} onChange={() => setPlan(p.id)} />
                <span>{t(p.labelKey)}</span>
                <strong>{formatPrice(p.amount)}</strong>
              </label>
            ))}
          </fieldset>
          <p className="wz-note">{t("wz_qpay_note")}</p>
        </div>
      )}

      {step === "confirm" && program && (
        <dl className="wz-summary">
          <div>
            <dt>{t("enroll_program")}</dt>
            <dd>{t(program.labelKey)}</dd>
          </div>
          {levelId && (
            <div>
              <dt>{t("enroll_level")}</dt>
              <dd>{label(levelChoices.find((c) => c.id === levelId)!)}</dd>
            </div>
          )}
          {scheduleId && (
            <div>
              <dt>{t("enroll_schedule")}</dt>
              <dd>{t(program.schedules.find((s) => s.id === scheduleId)!.labelKey)}</dd>
            </div>
          )}
          <div>
            <dt>{isKids ? t("kids_form_parent") : t("form_name")}</dt>
            <dd>
              {you.name} · {you.phone}
            </dd>
          </div>
          {isKids && (
            <div>
              <dt>{t("kids_form_child")}</dt>
              <dd>
                {you.childName} ({you.childAge})
              </dd>
            </div>
          )}
          {planMeta && (
            <div>
              <dt>{t("enroll_plan")}</dt>
              <dd>
                {t(planMeta.labelKey)} · <strong>{formatPrice(planMeta.amount)}</strong>
              </dd>
            </div>
          )}
          {!planMeta && <p className="wz-note">{t("wz_no_payment")}</p>}
        </dl>
      )}

      {error && <p className="form-err">{error}</p>}

      <footer className="wz-foot">
        {index > 0 ? (
          <button type="button" className="btn hsk-btn-ghost" onClick={() => go(-1)}>
            <span>{t("wz_back")}</span>
          </button>
        ) : (
          <span />
        )}
        {planMeta && step !== "program" && (
          <p className="wz-foot-total">
            <span>{t("enroll_total")}</span>
            <strong>{formatPrice(planMeta.amount)}</strong>
          </p>
        )}
        {step === "confirm" ? (
          <button type="button" className="btn btn-seal" disabled={phase === "sending"} onClick={() => void submit()}>
            <span>
              {phase === "sending" ? t("form_sending") : planMeta ? t("wz_submit_pay") : t("wz_submit")}
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-seal"
            onClick={() => (missing ? setError(missing) : go(1))}
          >
            <span>{t("wz_next")}</span>
          </button>
        )}
      </footer>
    </section>
  );
}

function ProgramCard({
  program,
  course,
  active,
  onPick,
}: {
  program: Program;
  course?: CourseLive;
  active: boolean;
  onPick: () => void;
}) {
  const { t } = useI18n();
  const from = program.plans.length ? Math.min(...program.plans.map((p) => p.amount)) : 0;
  return (
    <button type="button" className={`wz-program${active ? " is-on" : ""}`} onClick={onPick} aria-pressed={active}>
      <span className="wz-program-media">
        {course ? <SafeImage src={course.image} alt="" /> : <span aria-hidden>{program.kind === "travel" ? "旅" : "询"}</span>}
      </span>
      <span className="wz-program-body">
        <strong>{t(program.labelKey)}</strong>
        {program.schedules.length > 0 && <small>{t(program.schedules[0].labelKey)}</small>}
        {from > 0 && (
          <em>
            {program.plans.length > 1 ? t("wz_from").replace("{p}", formatPrice(from)) : formatPrice(from)}
          </em>
        )}
      </span>
    </button>
  );
}

/** Small teacher row for the details screen. */
function TeacherStrip({ course, team }: { course?: CourseLive; team: TeamMemberCms[] }) {
  const { t, lang } = useI18n();
  const members = (course?.teacherIds ?? [])
    .map((id) => team.find((m) => m.id === id))
    .filter((m): m is TeamMemberCms => Boolean(m));
  if (!members.length) return null;
  return (
    <div className="wz-teachers">
      <p className="wz-label">{t("course_teachers")}</p>
      <ul>
        {members.map((m) => {
          const name = loc(lang, t, m.name, m.nameKey);
          return (
            <li key={m.id}>
              <MemberAvatar photo={m.photo} name={name} className="wz-teacher-photo" />
              <span>
                <strong>{name}</strong>
                <small>
                  {loc(lang, t, m.role, m.roleKey)}
                  {m.hsk.length > 0 && ` · HSK ${m.hsk.join(", ")}`}
                </small>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
