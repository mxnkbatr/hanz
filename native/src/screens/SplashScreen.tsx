import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Mesh, SealMark, Txt } from "../components/ui";
import { academy } from "../data/academy";
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

  useEffect(() => {
    enter.value = withTiming(1, { duration: reduce ? 160 : 700, easing: Easing.out(Easing.cubic) });
  }, [enter, reduce]);

  useEffect(() => {
    if (!ready || holdSplash()) return;
    const t = setTimeout(() => {
      if (onboarded || skipIntro()) nav.replace("Main");
      else nav.replace("Onboarding");
    }, reduce ? 400 : 1600);
    return () => clearTimeout(t);
  }, [nav, onboarded, ready, reduce]);

  const seal = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.96 + enter.value * 0.04 }],
  }));
  const word = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 8 }],
  }));

  return (
    <Mesh field>
      <View style={styles.center}>
        <Animated.View style={seal}>
          <SealMark size={88} />
        </Animated.View>
        <Animated.View style={[styles.copy, word]}>
          <Txt tone="display" style={{ fontSize: 44, lineHeight: 50, textAlign: "center", color: "#fff" }}>
            {academy.brand}
          </Txt>
          <Txt tone="zh" style={{ textAlign: "center", color: "rgba(255,255,255,0.92)", fontSize: 18, marginTop: 4 }}>
            {academy.brandZh}
          </Txt>
          <Txt style={{ textAlign: "center", marginTop: 12, color: "rgba(255,255,255,0.78)", fontFamily: type.medium }}>
            {academy.tagline}
          </Txt>
        </Animated.View>
      </View>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 28, paddingHorizontal: 32 },
  copy: { alignItems: "center" },
});
