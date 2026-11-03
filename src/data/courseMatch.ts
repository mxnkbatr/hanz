import { coursesMeta } from "./content";

export type CourseFilter = "all" | "beginner" | "intermediate" | "advanced";

export const courseFilters: CourseFilter[] = ["all", "beginner", "intermediate", "advanced"];

/** Highest HSK level already mastered; 0 = never studied. */
export type MatchLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const matchLevels: MatchLevel[] = [0, 1, 2, 3, 4, 5];

export type MatchResult = {
  courseId: string;
  titleKey: string;
  descKey: string;
  reasonKey: string;
};

/** The next level up from what the learner already has. */
export function resolveMatch(done: MatchLevel): MatchResult {
  const course = coursesMeta.find((c) => c.level === done + 1) ?? coursesMeta[0];
  return {
    courseId: course.id,
    titleKey: course.titleKey,
    descKey: course.sumKey,
    reasonKey: "cmatch_reason_level",
  };
}

export function filterKeyLabel(f: CourseFilter): string {
  return f === "all" ? "filter_all" : `tag_${f}`;
}
