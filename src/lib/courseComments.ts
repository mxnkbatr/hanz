export type CourseComment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

const STORAGE_PREFIX = "hanz-course-comments:";

const SEED: Record<string, CourseComment[]> = {
  beginner: [
    {
      id: "s1",
      name: "Болормаа",
      text: "Хүүхэд маань дуртай ордог болсон. Багш нар маш эелдэг.",
      createdAt: "2026-03-12T10:00:00.000Z",
    },
    {
      id: "s2",
      name: "Эрдэнэ",
      text: "Цагийн хуваарь тохиромжтой, онлайн бүртгэл амархан байсан.",
      createdAt: "2026-02-28T08:00:00.000Z",
    },
  ],
  elementary: [
    {
      id: "s3",
      name: "Сарантуяа",
      text: "Ярианы дасгал ихтэй. 2 долоо хоногт илүү ойлгодог болсон.",
      createdAt: "2026-03-01T12:00:00.000Z",
    },
  ],
  intermediate: [
    {
      id: "s4",
      name: "Бат",
      text: "HSK бэлтгэлийн эхлэлд сайн. Багш тодорхой тайлбарладаг.",
      createdAt: "2026-01-18T09:00:00.000Z",
    },
  ],
};

function levelFromSlotId(slotId: string) {
  return slotId.split("__")[0] || slotId;
}

function readLocal(slotId: string): CourseComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slotId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CourseComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(slotId: string, comments: CourseComment[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + slotId, JSON.stringify(comments));
  } catch {
    /* ignore quota */
  }
}

export function getCourseComments(slotId: string): CourseComment[] {
  const level = levelFromSlotId(slotId);
  const seeded = SEED[level] ?? [];
  const local = readLocal(slotId);
  return [...local, ...seeded].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export function addCourseComment(
  slotId: string,
  input: { name: string; text: string },
): CourseComment {
  const comment: CourseComment = {
    id: `c_${Date.now().toString(36)}`,
    name: input.name.trim(),
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
  };
  const next = [comment, ...readLocal(slotId)];
  writeLocal(slotId, next);
  return comment;
}
