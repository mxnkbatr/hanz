import { describe, expect, it } from "vitest";
import { resolveMatch } from "./courseMatch";
import { coursesMeta } from "./content";

describe("resolveMatch", () => {
  it("sends beginners to HSK1", () => {
    expect(resolveMatch(0).courseId).toBe("hsk1");
  });

  it("suggests the next level up", () => {
    expect(resolveMatch(2).courseId).toBe("hsk3");
    expect(resolveMatch(5).courseId).toBe("hsk6");
  });
});

describe("coursesMeta", () => {
  it("has HSK1–6 and only HSK1–5 join the 6-month class", () => {
    expect(coursesMeta.map((c) => c.id)).toEqual(["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"]);
    expect(coursesMeta.filter((c) => c.sixMonth).map((c) => c.level)).toEqual([1, 2, 3, 4, 5]);
  });
});
