/**
 * The academy's paper student form ("Суралцагчийн анкет 2026") as data: what the
 * enrol wizard asks after the programme, and how the answers are summarised for
 * the admin lead list.
 */
export type YesNo = "" | "yes" | "no";

export type Anket = {
  surname: string;
  name: string;
  regNo: string;
  gender: "" | "male" | "female";
  age: string;
  phone: string;
  facebook: string;
  email: string;
  occupation: string;
  occupationOther: string;
  schedule: string;
  scheduleOther: string;
  emergency: { phone: string; relation: string }[];
  address: string;
  source: string[];
  sourceOther: string;
  scholarship: YesNo;
  langPrep: YesNo;
  agreed: boolean;
};

export const emptyAnket = (): Anket => ({
  surname: "",
  name: "",
  regNo: "",
  gender: "",
  age: "",
  phone: "",
  facebook: "",
  email: "",
  occupation: "",
  occupationOther: "",
  schedule: "",
  scheduleOther: "",
  emergency: [
    { phone: "", relation: "" },
    { phone: "", relation: "" },
  ],
  address: "",
  source: [],
  sourceOther: "",
  scholarship: "",
  langPrep: "",
  agreed: false,
});

/** Question 2 on the form; "other" opens a text field. */
export const anketSchedules = ["10-18", "10-13", "15-18", "other"] as const;
/** Question 3. */
export const anketOccupations = ["pupil", "student", "civil", "self", "other"] as const;
/** Question 6, as chips instead of a blank line. */
export const anketSources = ["facebook", "instagram", "friend", "google", "school", "other"] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Message key for what blocks the personal screen, or "" when it is complete. */
export function personalMissing(a: Anket): string {
  if (!a.surname.trim() || !a.name.trim()) return "ak_err_name";
  if (a.phone.replace(/\D/g, "").length < 8) return "ak_err_phone";
  if (!a.gender || !a.age.trim()) return "ak_err_gender_age";
  if (a.email.trim() && !EMAIL.test(a.email.trim())) return "ak_err_email";
  return "";
}

/** Message key for what blocks the questionnaire screen. */
export function questionsMissing(a: Anket, isCourse: boolean): string {
  if (isCourse && (!a.schedule || (a.schedule === "other" && !a.scheduleOther.trim()))) {
    return "ak_err_schedule";
  }
  if (!a.occupation || (a.occupation === "other" && !a.occupationOther.trim())) return "ak_err_occupation";
  if (a.emergency[0].phone.replace(/\D/g, "").length < 8 || !a.emergency[0].relation.trim()) {
    return "ak_err_emergency";
  }
  if (!a.address.trim()) return "ak_err_address";
  if (!a.scholarship || !a.langPrep) return "ak_err_yesno";
  if (!a.agreed) return "ak_err_agree";
  return "";
}

/** Readable lines for the lead message; `t` resolves the option labels. */
export function anketLines(a: Anket, t: (key: string) => string, isCourse: boolean): string[] {
  const other = (value: string, text: string, prefix: string) =>
    value === "other" ? text.trim() : t(`${prefix}${value}`);
  const contacts = a.emergency
    .filter((c) => c.phone.trim())
    .map((c) => `${c.phone.trim()} (${c.relation.trim()})`)
    .join(", ");
  const sources = a.source
    .map((s) => (s === "other" ? a.sourceOther.trim() : t(`ak_src_${s}`)))
    .filter(Boolean)
    .join(", ");
  return [
    `${t("ak_regno")}: ${a.regNo.trim() || "—"}`,
    `${t("ak_gender")}: ${t(`ak_gender_${a.gender}`)} · ${t("ak_age")}: ${a.age.trim()}`,
    a.facebook.trim() ? `Facebook: ${a.facebook.trim()}` : "",
    a.email.trim() ? `Email: ${a.email.trim()}` : "",
    isCourse ? `${t("ak_q_schedule")}: ${other(a.schedule, a.scheduleOther, "ak_sch_")}` : "",
    `${t("ak_q_occupation")}: ${other(a.occupation, a.occupationOther, "ak_occ_")}`,
    `${t("ak_q_emergency")}: ${contacts}`,
    `${t("ak_q_address")}: ${a.address.trim()}`,
    sources ? `${t("ak_q_source")}: ${sources}` : "",
    `${t("ak_q_scholarship")}: ${t(`ak_${a.scholarship}`)}`,
    `${t("ak_q_langprep")}: ${t(`ak_${a.langPrep}`)}`,
  ].filter(Boolean);
}
