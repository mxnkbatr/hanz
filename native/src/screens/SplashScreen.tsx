import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Mesh, SealMark, Txt } from "../components/ui";
import { useReduceMotion } from "../lib/motion";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

function holdSplash() {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("hold") === "1";
}

function skipIntro() {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("skipOnboarding") === "1";
}

export function SplashScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { onboarded, ready } = useApp();
  const { type } = useTheme();
  const reduce = useReduceMotion();
  const enter = useSharedValue(0);
  const bar = useSharedValue(0);

  useEffect(() => {
    enter.value = withSpring(1, { damping: 14, stiffness: 140 });
    bar.value = withTiming(1, { duration: reduce ? 200 : 1400, easing: Easing.out(Easing.cubic) });
  }, [bar, enter, reduce]);

  useEffect(() => {
    if (!ready || holdSplash()) return;
    const t = setTimeout(() => {
      if (onboarded || skipIntro()) nav.replace("Main");
      else nav.replace("Onboarding");
    }, reduce ? 400 : 1700);
    return () => clearTimeout(t);
  }, [nav, onboarded, ready, reduce]);

  const mark = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.86 + enter.value * 0.14 }],
  }));
  const line = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  return (
    <Mesh field>
      <Txt tone="zh" style={styles.watermark}>汉</Txt>
      <View style={styles.center}>
        <Animated.View style={mark}>
          <SealMark size={112} light />
        </Animated.View>
        <Txt tone="display" style={[styles.word, { fontFamily: type.bold }]}>
          ХАНЗ АКАДЕМИ
        </Txt>
        <Txt style={styles.sub}>Хятад хэлний академи · Улаанбаатар</Txt>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, line]} />
      </View>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: "absolute",
    alignSelf: "center",
    top: "18%",
    fontSize: 280,
    lineHeight: 300,
    color: "#FFFFFF",
    opacity: 0.08,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  word: { color: "#FFFFFF", fontSize: 22, lineHeight: 28, letterSpacing: 3.2, textAlign: "center" },
  sub: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 20, textAlign: "center" },
  track: { position: "absolute", left: 64, right: 64, bottom: 72, height: 2, borderRadius: 1, backgroundColor: "rgba(255,255,255,0.28)", overflow: "hidden" },
  progress: { height: 2, backgroundColor: "#FFFFFF", borderRadius: 1 },
});
