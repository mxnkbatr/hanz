import { useMemo, useState, type ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useEffect } from "react";
import type { Category, Program } from "../domain/types";
import { deadlineSoon, formatMnt, priceCaption, priceLabel, seatsLeft, soonestIntake, daysUntil } from "../lib/format";
import { hapticTap } from "../lib/haptics";
import { useReduceMotion } from "../lib/motion";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

export function Mesh({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: theme.bg }, style]}>
      <LinearGradient colors={theme.mesh} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={[styles.blob, { backgroundColor: theme.blobs[0], top: -90, right: -70 }]} />
      <View style={[styles.blob, { backgroundColor: theme.blobs[1], top: 260, left: -100, width: 280, height: 280 }]} />
      <View style={[styles.blob, { backgroundColor: theme.blobs[2], bottom: 40, right: -40, width: 240, height: 240 }]} />
      {children}
    </View>
  );
}

type Tone = "display" | "title" | "body" | "muted" | "zh" | "label";

export function Txt({
  children,
  tone = "body",
  style,
  numberOfLines,
}: {
  children: ReactNode;
  tone?: Tone;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const { theme, type } = useTheme();
  const map: Record<Tone, TextStyle> = {
    display: { fontFamily: type.display, fontSize: 36, lineHeight: 40, letterSpacing: -1.1, color: theme.ink },
    title: { fontFamily: type.bold, fontSize: 22, lineHeight: 26, letterSpacing: -0.4, color: theme.ink },
    body: { fontFamily: type.body, fontSize: 15, lineHeight: 22, color: theme.ink },
    muted: { fontFamily: type.medium, fontSize: 13, lineHeight: 18, color: theme.muted },
    zh: { fontFamily: type.zh, fontSize: 28, color: theme.ink },
    label: { fontFamily: type.semi, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: theme.muted },
  };
  return (
    <Text numberOfLines={numberOfLines} style={[map[tone], style]}>
      {children}
    </Text>
  );
}

export function Glass({
  children,
  style,
  intensity = 28,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.glassWrap, { borderColor: theme.glassBorder, shadowColor: theme.shadow }, style]}>
      <BlurView intensity={intensity} tint={theme.name === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.glass }]} />
      {children}
    </View>
  );
}

export function Tilt({
  children,
  onPress,
  style,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const reduce = useReduceMotion();
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const sc = useSharedValue(1);
  const box = useSharedValue({ w: 1, h: 1 });
  const anim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
      { scale: sc.value },
    ],
  }));
  return (
    <Animated.View
      style={[anim, style]}
      onLayout={(e) => {
        box.value = { w: e.nativeEvent.layout.width || 1, h: e.nativeEvent.layout.height || 1 };
      }}
      onTouchStart={() => {
        sc.value = withSpring(reduce || disabled ? 1 : 0.985, { damping: 18, stiffness: 260 });
      }}
      onTouchMove={(e) => {
        if (reduce || disabled) return;
        const { locationX, locationY } = e.nativeEvent;
        ry.value = (locationX / box.value.w - 0.5) * 7;
        rx.value = (0.5 - locationY / box.value.h) * 6;
      }}
      onTouchEnd={() => {
        rx.value = withSpring(0);
        ry.value = withSpring(0);
        sc.value = withSpring(1);
      }}
      onTouchCancel={() => {
        rx.value = withSpring(0);
        ry.value = withSpring(0);
        sc.value = withSpring(1);
      }}
    >
      <Pressable
        disabled={disabled}
        onPress={() => {
          void hapticTap();
          onPress?.();
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function SealMark({ size = 72, light = false }: { size?: number; light?: boolean }) {
  const { type } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: "#C81E24",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#C81E24",
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <Text style={{ fontFamily: type.zh, color: "#fff", fontSize: size * 0.46, marginTop: -2 }}>汉</Text>
      {light ? null : null}
    </View>
  );
}

export function Badge({
  text,
  color,
  textColor = "#fff",
}: {
  text: string;
  color: string;
  textColor?: string;
}) {
  const { type } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={{ color: textColor, fontFamily: type.semi, fontSize: 11 }}>{text}</Text>
    </View>
  );
}

export function ProgramBadges({ program }: { program: Program }) {
  const seats = seatsLeft(program);
  const soon = deadlineSoon(program);
  return (
    <View style={styles.row}>
      {soon ? <Badge text="Хугацаа дөхөж байна" color="#C81E24" /> : null}
      {seats > 0 && seats <= 12 ? <Badge text={`${seats} суудал`} color="#1A1214" /> : null}
    </View>
  );
}

export function ProgramCard({ program, onPress, wide }: { program: Program; onPress: () => void; wide?: boolean }) {
  const { theme, type } = useTheme();
  const cat = categoryMeta[program.category];
  const intake = soonestIntake(program);
  return (
    <Tilt onPress={onPress} style={{ width: wide ? "100%" : 250 }}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>
        <Image source={{ uri: program.image }} style={styles.cardImg} />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.55)"]} style={styles.cardShade} />
        <View style={styles.cardTop}>
          <Badge text={cat.label} color={cat.a} />
          <ProgramBadges program={program} />
        </View>
        <View style={styles.cardBody}>
          <Text style={{ fontFamily: type.zh, color: "#fff", fontSize: 22 }}>{program.hanzi}</Text>
          <Text style={[styles.cardTitle, { fontFamily: type.bold }]} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.86)", fontFamily: type.medium, fontSize: 12 }} numberOfLines={1}>
            {intake ? intake.label : program.subtitle}
          </Text>
          <Text style={{ color: "#fff", fontFamily: type.bold, marginTop: 6 }}>{priceLabel(program)}</Text>
        </View>
      </View>
    </Tilt>
  );
}

export function Countdown({ deadline }: { deadline: string }) {
  const { theme, type } = useTheme();
  const days = Math.max(0, daysUntil(deadline));
  return (
    <View style={[styles.count, { borderColor: theme.line, backgroundColor: theme.card }]}>
      <Text style={{ fontFamily: type.display, fontSize: 28, color: theme.seal }}>{days}</Text>
      <Text style={{ fontFamily: type.medium, color: theme.muted, fontSize: 12 }}>хоног үлдлээ</Text>
    </View>
  );
}

export function ProgressRing({
  progress,
  size = 72,
  color,
  label,
}: {
  progress: number;
  size?: number;
  color: string;
  label: string;
}) {
  const { type, theme } = useTheme();
  const reduce = useReduceMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: reduce ? 0 : 900, easing: Easing.out(Easing.cubic) });
  }, [p, progress, reduce]);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const style = useAnimatedStyle(() => ({ opacity: 1 }));
  const dash = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.line} strokeWidth={6} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dash}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text style={{ fontFamily: type.bold, color: theme.ink, fontSize: 13 }}>{label}</Text>
      </View>
    </Animated.View>
  );
}

export function SandboxQr({ seed, size = 196 }: { seed: string; size?: number }) {
  const n = 21;
  const cells = useMemo(() => {
    const out: boolean[] = [];
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    for (let i = 0; i < n * n; i++) {
      h = Math.imul(h ^ i, 2246822519);
      out.push((h >>> 0) % 3 !== 0);
    }
    const stamp = (x: number, y: number) => {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const edge = dx === 0 || dy === 0 || dx === 6 || dy === 6;
          const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
          out[(y + dy) * n + (x + dx)] = edge || core;
        }
      }
    };
    stamp(0, 0);
    stamp(n - 7, 0);
    stamp(0, n - 7);
    return out;
  }, [seed]);
  const cell = size / n;
  return (
    <View style={{ width: size, height: size, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" }}>
      <Svg width={size} height={size}>
        {cells.map((on, i) =>
          on ? (
            <Rect
              key={i}
              x={(i % n) * cell}
              y={Math.floor(i / n) * cell}
              width={cell - 0.4}
              height={cell - 0.4}
              fill="#161216"
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
}

const CONFETTI = ["#C81E24", "#FF5C7A", "#F5A524", "#14B8A6", "#7C5CFF", "#F0C36A", "#FF3D8A"];

export function Confetti({ show }: { show: boolean }) {
  const reduce = useReduceMotion();
  if (!show || reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {CONFETTI.flatMap((color, i) =>
        [0, 1, 2, 3].map((k) => <Bit key={`${i}-${k}`} color={color} index={i * 4 + k} />),
      )}
    </View>
  );
}

function Bit({ color, index }: { color: string; index: number }) {
  const y = useSharedValue(-40);
  const r = useSharedValue(0);
  const o = useSharedValue(1);
  useEffect(() => {
    const delay = (index % 7) * 70;
    y.value = withDelay(delay, withTiming(760, { duration: 1600 + (index % 5) * 180, easing: Easing.out(Easing.quad) }));
    r.value = withDelay(delay, withRepeat(withTiming(220, { duration: 700 }), -1));
    o.value = withDelay(delay + 1100, withTiming(0, { duration: 500 }));
  }, [index, o, r, y]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${r.value}deg` }],
    opacity: o.value,
  }));
  const left = (index * 37) % 100;
  return <Animated.View style={[styles.bit, { backgroundColor: color, left: `${left}%` }, style]} />;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { theme, type } = useTheme();
  const reduce = useReduceMotion();
  const y = useSharedValue(420);
  useEffect(() => {
    y.value = withTiming(open ? 0 : 420, { duration: reduce ? 0 : 320, easing: Easing.out(Easing.cubic) });
  }, [open, reduce, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  if (!open) return null;
  return (
    <View style={styles.sheetRoot}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { backgroundColor: theme.name === "dark" ? "#1C1418" : "#FFF" }, style]}>
        <View style={[styles.handle, { backgroundColor: theme.line }]} />
        <Text style={{ fontFamily: type.bold, fontSize: 18, color: theme.ink, marginBottom: 12 }}>{title}</Text>
        {children}
      </Animated.View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  colors,
  disabled,
}: {
  label: string;
  onPress: () => void;
  colors?: [string, string];
  disabled?: boolean;
}) {
  const { type } = useTheme();
  const pair = colors ?? ["#C81E24", "#8E1218"];
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        void hapticTap();
        onPress();
      }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <LinearGradient colors={pair} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        <Text style={{ color: "#fff", fontFamily: type.bold, fontSize: 16 }}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function Icon({ name, color, size = 22 }: { name: "home" | "search" | "quiz" | "ticket" | "user"; color: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24" };
  if (name === "home") {
    return (
      <Svg {...common}>
        <Path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill={color} />
      </Svg>
    );
  }
  if (name === "search") {
    return (
      <Svg {...common}>
        <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={2} fill="none" />
        <Path d="M16 16.5 20 20.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === "quiz") {
    return (
      <Svg {...common}>
        <Path d="M12 3 14.2 8.6 20 9.2 15.6 13.2 16.9 19 12 16.1 7.1 19 8.4 13.2 4 9.2 9.8 8.6 12 3Z" fill={color} />
      </Svg>
    );
  }
  if (name === "ticket") {
    return (
      <Svg {...common}>
        <Path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2 2 0 0 0 0-3.6V8Z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg {...common}>
      <Circle cx="12" cy="9" r="3.2" fill={color} />
      <Path d="M6.2 19.2c1.2-2.6 3.2-3.8 5.8-3.8s4.6 1.2 5.8 3.8" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function moneyLine(program: Program) {
  const plan = program.plans[0];
  return `${priceLabel(program)} · ${priceCaption(program)}${plan && plan.amount > 0 && program.priceSource !== "covered" ? "" : ""}`;
}

export function usePressScale() {
  const [down, setDown] = useState(false);
  return { down, setDown };
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
  blob: { position: "absolute", width: 320, height: 320, borderRadius: 200 },
  glassWrap: { overflow: "hidden", borderWidth: 1, borderRadius: 24 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  card: { height: 230, borderRadius: 26, overflow: "hidden", borderWidth: 1 },
  cardImg: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  cardShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 150 },
  cardTop: { position: "absolute", top: 12, left: 12, right: 12, gap: 8 },
  cardBody: { position: "absolute", left: 14, right: 14, bottom: 14 },
  cardTitle: { color: "#fff", fontSize: 18, lineHeight: 22, marginTop: 2 },
  count: { minWidth: 92, borderRadius: 20, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  ringLabel: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  bit: { position: "absolute", top: 0, width: 8, height: 14, borderRadius: 2 },
  sheetRoot: { ...StyleSheet.absoluteFill, justifyContent: "flex-end", zIndex: 20 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, paddingBottom: 28 },
  handle: { width: 42, height: 5, borderRadius: 99, alignSelf: "center", marginBottom: 12 },
  btn: { height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});

void interpolate;
void formatMnt;
void withRepeat;
