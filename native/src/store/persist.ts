import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GuestProfile, LocalEnrollment } from "../domain/types";

const KEY = "hanz.native.v1";

export type PersistShape = {
  enrollments: LocalEnrollment[];
  profile: GuestProfile;
  onboarded: boolean;
  theme: "light" | "dark" | "system";
  quiz: QuizPersist;
};

export type QuizPersist = {
  xp: number;
  streak: number;
  lastDay: string | null;
  hearts: number;
  heartsDay: string | null;
  completed: Record<string, { correct: number; total: number; at: string }>;
};

export const emptyQuiz = (): QuizPersist => ({
  xp: 0,
  streak: 0,
  lastDay: null,
  hearts: 5,
  heartsDay: null,
  completed: {},
});

const empty: PersistShape = {
  enrollments: [],
  profile: { name: "", phone: "", email: "" },
  onboarded: false,
  theme: "system",
  quiz: emptyQuiz(),
};

export async function loadPersist(): Promise<PersistShape> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistShape>;
    return {
      ...empty,
      ...parsed,
      profile: { ...empty.profile, ...parsed.profile },
      quiz: { ...empty.quiz, ...parsed.quiz },
      enrollments: parsed.enrollments ?? [],
    };
  } catch {
    return empty;
  }
}

export async function savePersist(next: PersistShape) {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
