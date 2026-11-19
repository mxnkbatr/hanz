import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { demoEnrollments, fixturePrograms } from "../data/fixtures";
import { lessons, suggestProgramId, type Lesson } from "../data/quiz";
import type { EnrollmentDraft, GuestProfile, LocalEnrollment, Program } from "../domain/types";
import { isPreview } from "../lib/env";
import { services } from "../services";
import { rememberInvoice } from "../services/invoiceCache";
import type { QpayInvoice } from "../domain/types";
import { loadPersist, savePersist, type QuizPersist, emptyQuiz } from "../store/persist";
import { todayKey } from "../lib/format";
import { useTheme } from "../theme/Theme";

type InvoiceResult = QpayInvoice | { unavailable: true; reason: string };

type Ctx = {
  ready: boolean;
  preview: boolean;
  programs: Program[];
  sourceLabel: string;
  refreshing: boolean;
  refresh: () => Promise<void>;
  enrollments: LocalEnrollment[];
  profile: GuestProfile;
  setProfile: (p: GuestProfile) => void;
  onboarded: boolean;
  finishOnboarding: () => void;
  submitEnrollment: (draft: EnrollmentDraft) => Promise<{ enrollment: LocalEnrollment; invoice: InvoiceResult }>;
  setPayment: (id: string, payment: LocalEnrollment["payment"], status?: LocalEnrollment["status"]) => void;
  quiz: QuizPersist;
  lesson: (id: string) => Lesson | undefined;
  loseHeart: () => number;
  completeLesson: (lessonId: string, correct: number, total: number) => { xpGained: number; suggested?: string };
  sessionEmail: string | null;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signOut: () => Promise<void>;
  themeMode: "light" | "dark" | "system";
  setThemeMode: (mode: "light" | "dark" | "system") => void;
};

const StateCtx = createContext<Ctx | null>(null);

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { setMode } = useTheme();
  const [ready, setReady] = useState(false);
  const [programs, setPrograms] = useState<Program[]>(fixturePrograms);
  const [sourceLabel, setSourceLabel] = useState(isPreview ? "fixture" : "supabase");
  const [refreshing, setRefreshing] = useState(false);
  const [enrollments, setEnrollments] = useState<LocalEnrollment[]>([]);
  const [profile, setProfileState] = useState<GuestProfile>({ name: "", phone: "", email: "" });
  const [onboarded, setOnboarded] = useState(false);
  const [quiz, setQuiz] = useState<QuizPersist>(emptyQuiz());
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [themeMode, setThemeModeState] = useState<"light" | "dark" | "system">("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const stored = await loadPersist();
      if (!alive) return;
      const seeded =
        stored.enrollments.length || !isPreview ? stored.enrollments : demoEnrollments;
      setEnrollments(seeded);
      setProfileState(stored.profile);
      setOnboarded(stored.onboarded);
      setQuiz(stored.quiz);
      const queryTheme =
        Platform.OS === "web" && typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("theme")
          : null;
      const mode = queryTheme === "light" || queryTheme === "dark" ? queryTheme : stored.theme;
      setThemeModeState(mode);
      setMode(mode);
      setHydrated(true);
      try {
        const list = await services.catalog.listPrograms();
        if (alive && list.length) {
          setPrograms(list);
          setSourceLabel(services.catalog.source);
        }
      } catch {
        if (alive) setSourceLabel("fixture");
      }
      const previewAccount =
        Platform.OS === "web" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("account") === "1";
      if (previewAccount) {
        setProfileState({
          name: stored.profile.name || "Бат-Эрдэнэ",
          phone: stored.profile.phone || "99112233",
          email: stored.profile.email || "bat@example.com",
        });
      }
      try {
        const email = await services.auth.getSessionEmail();
        if (alive) setSessionEmail(previewAccount ? "bat@example.com" : email);
      } catch {
        if (alive && previewAccount) setSessionEmail("bat@example.com");
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [setMode]);

  useEffect(() => {
    if (!hydrated) return;
    const handle = setTimeout(() => {
      void savePersist({
        enrollments,
        profile,
        onboarded,
        theme: themeMode,
        quiz,
      });
    }, 120);
    return () => clearTimeout(handle);
  }, [enrollments, profile, onboarded, quiz, hydrated, themeMode]);

  const setThemeMode = useCallback(
    (mode: "light" | "dark" | "system") => {
      setThemeModeState(mode);
      setMode(mode);
    },
    [setMode],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await services.catalog.listPrograms();
      if (list.length) {
        setPrograms(list);
        setSourceLabel(services.catalog.source);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const setProfile = useCallback((p: GuestProfile) => setProfileState(p), []);

  const finishOnboarding = useCallback(() => setOnboarded(true), []);

  const submitEnrollment = useCallback(async (draft: EnrollmentDraft) => {
    const remote = await services.enrollment.create(draft);
    const invoice = await services.payment.createInvoice(draft);
    rememberInvoice(draft.id, invoice);
    const paidFree = "unavailable" in invoice;
    const enrollment: LocalEnrollment = {
      id: draft.id,
      createdAt: new Date().toISOString(),
      name: draft.name,
      phone: draft.phone,
      email: draft.email,
      notes: draft.notes,
      programId: draft.program.id,
      programTitle: draft.program.title,
      category: draft.program.category,
      intakeId: draft.intake.id,
      intakeLabel: draft.intake.label,
      planId: draft.plan.id,
      planLabel: draft.plan.label,
      amount: draft.plan.amount,
      status: paidFree ? "submitted" : "submitted",
      payment: paidFree ? "none" : "pending",
      sandbox: !("unavailable" in invoice) && invoice.sandbox,
      remote: remote.remote,
    };
    setEnrollments((prev) => [enrollment, ...prev.filter((e) => e.id !== enrollment.id)]);
    setProfileState({ name: draft.name, phone: draft.phone, email: draft.email });
    return { enrollment, invoice };
  }, []);

  const setPayment = useCallback((id: string, payment: LocalEnrollment["payment"], status?: LocalEnrollment["status"]) => {
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              payment,
              status: status ?? (payment === "paid" ? "paid" : payment === "failed" ? "failed" : e.status),
            }
          : e,
      ),
    );
  }, []);

  const loseHeart = useCallback(() => {
    const day = todayKey();
    let left = 5;
    setQuiz((prev) => {
      const reset = prev.heartsDay !== day;
      const hearts = Math.max(0, (reset ? 5 : prev.hearts) - 1);
      left = hearts;
      return { ...prev, hearts, heartsDay: day };
    });
    return left;
  }, []);

  const completeLesson = useCallback((lessonId: string, correct: number, total: number) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    const ratio = total ? correct / total : 0;
    const gained = Math.round((lesson?.xp ?? 20) * (0.4 + ratio * 0.6));
    const day = todayKey();
    setQuiz((prev) => {
      const continued = prev.lastDay === day || prev.lastDay === yesterdayKey();
      const streak = prev.lastDay === day ? prev.streak : continued ? prev.streak + 1 : 1;
      return {
        ...prev,
        xp: prev.xp + gained,
        streak: prev.lastDay ? streak : 1,
        lastDay: day,
        heartsDay: day,
        hearts: prev.heartsDay === day ? prev.hearts : 5,
        completed: {
          ...prev.completed,
          [lessonId]: { correct, total, at: new Date().toISOString() },
        },
      };
    });
    return { xpGained: gained, suggested: lesson ? suggestProgramId(lesson, ratio) : undefined };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await services.auth.signIn(email, password);
    if (!res.error) setSessionEmail(email.trim());
    return res.error;
  }, []);

  const signOut = useCallback(async () => {
    await services.auth.signOut();
    setSessionEmail(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      preview: isPreview,
      programs,
      sourceLabel,
      refreshing,
      refresh,
      enrollments,
      profile,
      setProfile,
      onboarded,
      finishOnboarding,
      submitEnrollment,
      setPayment,
      quiz,
      lesson: (id) => lessons.find((l) => l.id === id),
      loseHeart,
      completeLesson,
      sessionEmail,
      signIn,
      signOut,
      themeMode,
      setThemeMode,
    }),
    [
      ready,
      programs,
      sourceLabel,
      refreshing,
      refresh,
      enrollments,
      profile,
      setProfile,
      onboarded,
      finishOnboarding,
      submitEnrollment,
      setPayment,
      quiz,
      loseHeart,
      completeLesson,
      sessionEmail,
      signIn,
      signOut,
      themeMode,
      setThemeMode,
    ],
  );

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("useApp");
  return ctx;
}
