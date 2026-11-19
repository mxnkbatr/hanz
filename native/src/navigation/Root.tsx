import { NavigationContainer, type LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ExpoLinking from "expo-linking";
import { AcademyScreen } from "../screens/AcademyScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { EnrollScreen } from "../screens/EnrollScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { QpayScreen } from "../screens/QpayScreen";
import { QuizDoneScreen } from "../screens/QuizDoneScreen";
import { QuizPlayScreen } from "../screens/QuizPlayScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { SuccessScreen } from "../screens/SuccessScreen";
import { Tabs } from "./Tabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [ExpoLinking.createURL("/"), "hanz://"],
  config: {
    screens: {
      Splash: "",
      Onboarding: "onboarding",
      Main: {
        path: "app",
        screens: {
          Home: "home",
          Catalog: "catalog",
          Quiz: "quiz",
          Mine: "mine",
          Profile: "profile",
        },
      },
      Detail: "program/:id",
      Enroll: "enroll/:id",
      Qpay: "pay/:enrollmentId",
      Success: "success/:enrollmentId",
      QuizPlay: "lesson/:lessonId",
      QuizDone: "lesson-done",
      Academy: "academy",
    },
  },
};

export function RootNav() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: "fade" }} />
        <Stack.Screen name="Main" component={Tabs} options={{ animation: "fade" }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ animation: "fade_from_bottom" }} />
        <Stack.Screen name="Enroll" component={EnrollScreen} />
        <Stack.Screen name="Qpay" component={QpayScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="QuizPlay" component={QuizPlayScreen} />
        <Stack.Screen name="QuizDone" component={QuizDoneScreen} options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="Academy" component={AcademyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
