import type { NavigatorScreenParams } from "@react-navigation/native";
import type { Category } from "../domain/types";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  Detail: { id: string };
  Enroll: { id: string; planId?: string; intakeId?: string };
  Qpay: { enrollmentId: string };
  Success: { enrollmentId: string };
  QuizPlay: { lessonId: string };
  QuizDone: { lessonId: string; correct: number; total: number; xp: number; suggested?: string };
  Academy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Catalog: { category?: Category } | undefined;
  Quiz: undefined;
  Mine: undefined;
  Profile: undefined;
};
