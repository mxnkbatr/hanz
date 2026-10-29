import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  enrollInterests,
  kidsLevels,
  kidsSchedules,
} from "../data/content";
import { SuccessBurst } from "./SuccessBurst";
import { getSupabase } from "../lib/supabase";
import { useI18n } from "../i18n/I18nContext";

type Props = {
  compact?: boolean;
  defaultInterest?: string;
  defaultKind?: "course" | "travel" | "consult";
  defaultLevel?: string;
  defaultSchedule?: string;
  /** Extra line saved at the top of the lead message, e.g. the chosen university. */
  context?: string;
};

function resolveKind(interest: string): "course" | "travel" | "consult" {
  const found = enrollInterests.find((i) => i.id === interest);
  return found?.kind ?? "consult";
}

export function EnrollForm({
  compact = false,
  defaultInterest = "consult",
  defaultKind,
  defaultLevel = kidsLevels[0].id,
  defaultSchedule = kidsSchedules[0].id,
  context,
}: Props) {
  const { t } = useI18n();
  const [interest, setInterest] = useState(defaultInterest);
  const [level, setLevel] = useState(defaultLevel);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );

  useEffect(() => {
    setInterest(defaultInterest);
  }, [defaultInterest]);

  useEffect(() => {
    setLevel(defaultLevel);
  }, [defaultLevel]);

  useEffect(() => {
    setSchedule(defaultSchedule);
  }, [defaultSchedule]);

  const kind = useMemo(
    () => defaultKind ?? resolveKind(interest),
    [defaultKind, interest],
  );
  const isKids = interest === "kids";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("msg") || "").trim();
    const childAge = String(data.get("child_age") || "").trim();
    const childName = String(data.get("child_name") || "").trim();
    const selectedInterest = String(data.get("interest") || interest);

    if (!name || !phone) return;

    const kids =
      selectedInterest === "kids"
        ? [
            childName ? `${t("kids_form_child")}: ${childName}` : "",
            `${t("kids_form_level")}: ${t(
              kidsLevels.find((l) => l.id === level)?.labelKey ||
                "kids_lvl_beginner",
            )}`,
            `${t("kids_form_schedule")}: ${t(
              kidsSchedules.find((s) => s.id === schedule)?.labelKey ||
                "kids_sch_wd_afternoon",
            )}`,
          ]
            .filter(Boolean)
            .join("\n")
        : "";

    const fullMessage = [context, kids, message].filter(Boolean).join("\n");

    setStatus("sending");
    const supabase = await getSupabase();
    const { error } = await supabase.from("enrollments").insert({
      name,
      phone,
      kind: defaultKind ?? resolveKind(selectedInterest),
      interest: selectedInterest,
      child_age: selectedInterest === "kids" ? childAge || null : null,
      message: fullMessage || null,
    });

    if (error) {
      console.error("[enroll]", error);
      setStatus("err");
      return;
    }
    setStatus("ok");
    e.currentTarget.reset();
  };

  if (status === "ok") {
    return (
      <SuccessBurst
        title={t("form_success_title")}
        message={t("form_ok")}
        doneLabel={t("back")}
        onDone={() => setStatus("idle")}
      />
    );
  }

  return (
    <form
      className={`consult-form${compact ? " is-compact" : ""}`}
      onSubmit={onSubmit}
    >
      <label>
        <span>{isKids ? t("kids_form_parent") : t("form_name")}</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        <span>{t("form_phone")}</span>
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      <label>
        <span>{t("form_interest")}</span>
        <select
          name="interest"
          required
          value={interest}
          onChange={(ev) => setInterest(ev.target.value)}
        >
          {enrollInterests.map((item) => (
            <option key={item.id} value={item.id}>
              {t(item.labelKey)}
            </option>
          ))}
        </select>
      </label>
      {isKids && (
        <>
          <label>
            <span>{t("kids_form_child")}</span>
            <input name="child_name" required autoComplete="off" />
          </label>
          <label>
            <span>{t("form_child_age")}</span>
            <input name="child_age" inputMode="numeric" placeholder="7–14" required />
          </label>
          <label>
            <span>{t("kids_form_level")}</span>
            <select
              value={level}
              onChange={(ev) => setLevel(ev.target.value)}
              required
            >
              {kidsLevels.map((l) => (
                <option key={l.id} value={l.id}>
                  {t(l.labelKey)} · {t(l.ageKey)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("kids_form_schedule")}</span>
            <select
              value={schedule}
              onChange={(ev) => setSchedule(ev.target.value)}
              required
            >
              {kidsSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.labelKey)}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <label>
        <span>{t("form_msg")}</span>
        <textarea name="msg" rows={compact ? 3 : 4} />
      </label>
      {status === "err" && <p className="form-err">{t("form_err")}</p>}
      <button
        type="submit"
        className="btn btn-seal"
        disabled={status === "sending"}
      >
        <span>
          {status === "sending"
            ? t("form_sending")
            : isKids
              ? t("kids_enroll_cta")
              : t("form_send")}
        </span>
      </button>
      <p className="form-kind-hint" hidden>
        {kind}
      </p>
    </form>
  );
}
