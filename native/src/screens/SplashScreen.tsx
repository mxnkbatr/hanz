import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Mesh, SealMark, Txt } from "../components/ui";
import { academy } from "../data/academy";
import { useReduceMotion } from "../lib/motion";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  const { theme } = useTheme();
  const reduce = useReduceMotion();
  const enter = useSharedValue(0);
  const dash = useSharedValue(460);

  useEffect(() => {
    enter.value = withTiming(1, { duration: reduce ? 200 : 900, easing: Easing.out(Easing.cubic) });
    dash.value = withTiming(0, { duration: reduce ? 0 : 1400, easing: Easing.out(Easing.cubic) });
  }, [dash, enter, reduce]);

  useEffect(() => {
    if (!ready || holdSplash()) return;
    const t = setTimeout(() => {
      if (onboarded || skipIntro()) nav.replace("Main");
      else nav.replace("Onboarding");
    }, reduce ? 500 : 2600);
    return () => clearTimeout(t);
  }, [nav, onboarded, ready, reduce]);

  const seal = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.82 + enter.value * 0.18 }, { translateY: (1 - enter.value) * 16 }],
  }));
  const word = useAnimatedStyle(() => ({
    opacity: Math.max(0, (enter.value - 0.35) / 0.65),
    transform: [{ translateY: (1 - enter.value) * 18 }],
  }));
  const brush = useAnimatedProps(() => ({ strokeDashoffset: dash.value }));

  return (
    <Mesh>
      <View style={styles.center}>
        <Animated.View style={seal}>
          <View style={styles.glow}>
            <LinearGradient colors={["rgba(200,30,36,0.0)", "rgba(200,30,36,0.35)"]} style={styles.glowFill} />
          </View>
          <SealMark size={108} />
        </Animated.View>
        <Svg width={280} height={46} style={{ marginTop: 8 }}>
          <AnimatedPath
            d="M8 28 C 50 6, 90 42, 140 24 S 230 8, 272 26"
            stroke={theme.seal}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
            strokeDasharray="460"
            animatedProps={brush}
          />
          <AnimatedPath
            d="M18 30 C 70 14, 120 36, 200 22"
            stroke={theme.gold}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            strokeDasharray="460"
            animatedProps={brush}
          />
        </Svg>
        <Animated.View style={[styles.copy, word]}>
          <Txt tone="display" style={{ fontSize: 56, lineHeight: 60, textAlign: "center" }}>
            {academy.brand}
          </Txt>
          <Txt tone="zh" style={{ textAlign: "center", color: theme.seal, fontSize: 22 }}>
            {academy.brandZh}
          </Txt>
          <Txt tone="muted" style={{ textAlign: "center", marginTop: 6, letterSpacing: 2 }}>
            {academy.tagline.toUpperCase()}
          </Txt>
        </Animated.View>
      </View>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 40 },
  glow: { position: "absolute", width: 180, height: 180, borderRadius: 90, left: -36, top: -36, overflow: "hidden" },
  glowFill: { flex: 1 },
  copy: { alignItems: "center", marginTop: 8 },
});
