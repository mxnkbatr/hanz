import { enrollInterests, hskFees, kidsLevels } from "./content";

/**
 * What the enroll form offers per programme: which level list, which schedules
 * and which payment plans. The HSK 1–6 class and its fees come from the
 * academy's page copy (data/content.ts → hskFees).
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

const intensive: Program = {
  id: "intensive",
  kind: "course",
  labelKey: "program_intensive",
  levels: "hsk",
  schedules: [{ id: "intensive", labelKey: "sch_intensive" }],
  plans: [
    { id: "m1", labelKey: "plan_m1", amount: hskFees.month },
    { id: "m6", labelKey: "plan_m6", amount: hskFees.sixMonth },
  ],
};

/** The HSK class first, then travel and general advice. */
export const programs: Program[] = [
  intensive,
  ...enrollInterests
    .filter((i) => i.kind !== "course")
    .map((i): Program => ({
      id: i.id,
      kind: i.kind,
      labelKey: i.labelKey,
      levels: null,
      schedules: [],
      plans: [],
    })),
];

/** Map an incoming ?interest= (or course id) to a programme id. */
export function programFromInterest(raw: string | null | undefined): string {
  const id = (raw || "").trim();
  if (id === "classroom" || id === "hsk" || id === "intensive" || /^hsk[1-6]$/.test(id)) {
    return "intensive";
  }
  return programs.some((p) => p.id === id) ? id : "consult";
}

/** The 6-month class covers HSK 1–5, so HSK 6 only has the 1-month plan. */
export function plansForLevel(program: Program | undefined, level: string): Plan[] {
  const plans = program?.plans ?? [];
  return level === "hsk6" ? plans.filter((p) => p.id !== "m6") : plans;
}

export const hskLevelChoices: Choice[] = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `hsk${n}`, labelKey: `HSK ${n}` })),
  { id: "unknown", labelKey: "enroll_level_unknown" },
];

export const kidsLevelChoices: Choice[] = kidsLevels.map((l) => ({
  id: l.id,
  labelKey: l.labelKey,
}));
