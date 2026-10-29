import { enrollInterests, kidsLevels } from "./content";
import { hskSchedule } from "./hsk";

/**
 * What the enroll form offers per programme: which level list, which schedules
 * and which payment plans. Prices and kids options come from the academy's HSK
 * 3.0 document (data/hsk.ts).
 */
export type Choice = { id: string; labelKey: string };
export type Plan = { id: string; labelKey: string; amount: number };

export type Program = {
  id: string;
  labelKey: string;
  kind: "course" | "travel" | "consult";
  /** "hsk" = HSK 1–6 + "not sure"; "kids" = kids levels; null = no level question. */
  levels: "hsk" | "kids" | null;
  /** One entry = fixed schedule shown as info; several = the applicant picks one. */
  schedules: Choice[];
  plans: Plan[];
};

const intensiveFees = hskSchedule.intensive.fees;
const kidsFees = hskSchedule.kids.fees;

const SPECIAL: Record<string, Omit<Program, "id" | "kind">> = {
  intensive: {
    labelKey: "program_intensive",
    levels: "hsk",
    schedules: [{ id: "intensive", labelKey: "sch_intensive" }],
    plans: [
      { id: "m1", labelKey: "plan_m1", amount: intensiveFees[0].amount },
      { id: "m6", labelKey: "plan_m6", amount: intensiveFees[1].amount },
    ],
  },
  kids: {
    labelKey: "course_kids_t",
    levels: "kids",
    schedules: [
      { id: "kids_a_am", labelKey: "sch_kids_a_am" },
      { id: "kids_a_pm", labelKey: "sch_kids_a_pm" },
      { id: "kids_b_am", labelKey: "sch_kids_b_am" },
      { id: "kids_b_pm", labelKey: "sch_kids_b_pm" },
    ],
    plans: [{ id: "m9", labelKey: "plan_m9", amount: kidsFees[0].amount }],
  },
};

/** Courses where a HSK level question makes sense. */
const HSK_LEVEL_COURSES = new Set(["online", "short", "year", "speak"]);

/** Classroom and HSK courses are the intensive class; everything else keeps its own entry. */
export const programs: Program[] = [
  { id: "intensive", kind: "course", ...SPECIAL.intensive },
  ...enrollInterests
    .filter((i) => i.id !== "classroom" && i.id !== "hsk")
    .map((i): Program =>
      SPECIAL[i.id]
        ? { id: i.id, kind: i.kind, ...SPECIAL[i.id] }
        : {
            id: i.id,
            kind: i.kind,
            labelKey: i.labelKey,
            levels: HSK_LEVEL_COURSES.has(i.id) ? "hsk" : null,
            schedules: [],
            plans: [],
          },
    ),
];

/** Map an incoming ?interest= (or course id) to a programme id. */
export function programFromInterest(raw: string | null | undefined): string {
  const id = (raw || "").trim();
  if (id === "classroom" || id === "hsk") return "intensive";
  return programs.some((p) => p.id === id) ? id : "consult";
}

export const hskLevelChoices: Choice[] = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `hsk${n}`, labelKey: `HSK ${n}` })),
  { id: "unknown", labelKey: "enroll_level_unknown" },
];

export const kidsLevelChoices: Choice[] = kidsLevels.map((l) => ({
  id: l.id,
  labelKey: l.labelKey,
}));
