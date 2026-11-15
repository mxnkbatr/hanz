import type { CourseLive } from "../lib/cms";
import { formatPrice } from "./content";
import { plansForLevel, programFromInterest, programs } from "./enroll";

/** One source for what a course costs, how long it runs and which level it is,
 *  shared by the phone home, the course list and the course page. */
export function courseFacts(course: CourseLive, t: (k: string) => string) {
  const program = programs.find((p) => p.id === programFromInterest(course.id));
  // The one-level monthly price is not shown on course pages.
  const plans = (course.level ? plansForLevel(program, course.id) : (program?.plans ?? [])).filter(
    (p) => p.id !== "m1",
  );
  const fromPrice = plans.length ? Math.min(...plans.map((p) => p.amount)) : 0;
  const priceText =
    fromPrice > 0
      ? plans.length > 1
        ? t("wz_from").replace("{p}", formatPrice(fromPrice))
        : formatPrice(fromPrice)
      : "";
  const language = course.language ?? "zh";
  const levelLabel =
    language === "pl" ? course.cefr ?? "" : course.level ? `HSK${course.level}` : "";
  const isIntensive = program?.id === "intensive";
  return {
    program,
    plans,
    fromPrice,
    priceText,
    language,
    format: course.format ?? "classroom",
    timeOfDay: course.timeOfDay ?? (isIntensive ? "day" : undefined),
    levelLabel,
    // HSK levels: "172 hours / 1 month". (unitKey is the course's headline sentence, not a length.)
    duration: isIntensive ? t("course_unit") : "",
    isIntensive,
  };
}

/** "15 Dec" style short date in the UI language. */
export function shortDate(iso: string, lang: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : lang === "en" ? "en" : "mn", {
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Course is open for enrolment: has a start date today or later. */
export function isEnrolling(course: CourseLive, today = new Date().toISOString().slice(0, 10)) {
  return Boolean(course.startDate && course.startDate >= today);
}
