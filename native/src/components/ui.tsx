import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
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
import Svg, { Circle, Defs, FeTurbulence, Filter, Path, Rect } from "react-native-svg";
import { useEffect } from "react";
import type { Category, Program } from "../domain/types";
import { deadlineSoon, formatMnt, priceCaption, priceLabel, seatsLeft, soonestIntake } from "../lib/format";
import { hapticSelect, hapticTap } from "../lib/haptics";
import { useReduceMotion } from "../lib/motion";
import { rememberOrigin } from "../navigation/origin";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

export function Mesh({
  children,
  style,
  field = false,
  masthead = false,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Full deep-red field, used by the splash. */
  field?: boolean;
  /** Home: red holds through the large title, then paper. */
  masthead?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme.name === "dark";
  const paper = dark ? "#000000" : "#FFFFFF";
  if (!field) {
    return (
      <View style={[styles.fill, { backgroundColor: paper }, style]}>
        {dark && !masthead ? (
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(62,8,10,0.55)", "rgba(0,0,0,0)"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 160 }}
          />
        ) : null}
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: "#7A0C10" }, style]}>
      <LinearGradient
        colors={["#7A0C10", "#A3141A", "#C81E24"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
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
    display: { fontFamily: type.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, color: theme.ink },
    title: { fontFamily: type.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.5, color: theme.ink },
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
  intensity = 42,
  interactive = false,
  tint = "neutral",
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  interactive?: boolean;
  tint?: "neutral" | "brand" | "frost" | "bar";
}) {
  const { theme } = useTheme();
  const onRed = tint === "brand" || tint === "frost";
  const veil = tint === "brand"
    ? "rgba(74,8,12,0.94)"
    : tint === "frost"
      ? "rgba(62,8,12,0.82)"
      : tint === "bar"
        ? theme.name === "dark"
          ? "rgba(16,16,18,0.94)"
          : "rgba(255,255,255,0.94)"
        : theme.name === "dark"
          ? "rgba(18,18,20,0.72)"
          : "rgba(255,255,255,0.86)";
  const flat = StyleSheet.flatten(style) ?? {};
  const face: ViewStyle = {
    zIndex: 2,
    position: "relative",
    width: "100%",
    flexGrow: 1,
    flexDirection: flat.flexDirection,
    alignItems: flat.alignItems,
    justifyContent: flat.justifyContent,
    gap: flat.gap,
    padding: flat.padding,
    paddingHorizontal: flat.paddingHorizontal,
    paddingVertical: flat.paddingVertical,
    paddingTop: flat.paddingTop,
    paddingBottom: flat.paddingBottom,
    paddingLeft: flat.paddingLeft,
    paddingRight: flat.paddingRight,
  };
  const liquid = Platform.OS === "ios" && isLiquidGlassAvailable();
  if (liquid) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={theme.name}
        tintColor={onRed ? "#5C0C10" : "rgba(255,255,255,0.2)"}
        isInteractive={interactive}
        style={[{ overflow: "hidden", borderRadius: 28 }, style]}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[styles.glassWrap, { borderColor: onRed ? "rgba(255,255,255,0.16)" : theme.glassBorder, shadowColor: theme.shadow, backgroundColor: "transparent" }, style]}>
      <BlurView intensity={onRed ? 24 : intensity} tint={onRed || theme.name === "dark" ? "dark" : "light"} style={[StyleSheet.absoluteFill, { zIndex: 0 }]} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: veil, zIndex: 0 }]} />
      <LinearGradient
        pointerEvents="none"
        colors={onRed ? ["rgba(0,0,0,0)", "rgba(0,0,0,0)"] : theme.name === "dark" ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"] : ["rgba(255,255,255,0.7)", "rgba(255,255,255,0)"]}
        style={[styles.sheen, { zIndex: 1 }]}
      />
      <View style={face}>{children}</View>
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
        backgroundColor: "#A3141A",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#3A080C",
        shadowOpacity: 0.28,
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
      {soon ? <Badge text="Хугацаа дөхөж байна" color="#7A0C10" /> : null}
      {seats > 0 && seats <= 12 ? <Badge text={`${seats} суудал`} color="rgba(20,20,22,0.55)" /> : null}
    </View>
  );
}

export function ProgramCard({ program, onPress, wide }: { program: Program; onPress: () => void; wide?: boolean }) {
  const { theme, type } = useTheme();
  const cat = categoryMeta[program.category];
  const intake = soonestIntake(program);
  const ref = useRef<{ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null>(null);
  return (
    <Tilt
      onPress={() => {
        ref.current?.measureInWindow((x, y, w, h) => {
          rememberOrigin({ x, y, w, h, image: program.image });
          onPress();
        });
      }}
      style={{ width: wide ? "100%" : 236 }}
    >
      <View ref={ref as never} collapsable={false} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>
        <Image source={{ uri: program.image }} style={styles.cardImg} />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.55)"]} style={styles.cardShade} />
        <View style={styles.cardTop}>
          <Badge text={cat.label} color={cat.a} />
          <ProgramBadges program={program} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { fontFamily: type.bold }]} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.86)", fontFamily: type.medium, fontSize: 12 }} numberOfLines={1}>
            {intake ? intake.label : program.subtitle}
          </Text>
          <Money text={priceLabel(program)} light style={{ marginTop: 6, fontSize: 16 }} />
        </View>
      </View>
    </Tilt>
  );
}

export function Countdown({ deadline, color }: { deadline: string; color?: string }) {
  const { theme, type } = useTheme();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const ms = new Date(`${deadline}T23:59:59+08:00`).getTime() - now;
  const days = Math.max(0, Math.ceil(ms / 86_400_000));
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  const showHours = days <= 1;
  const value = showHours ? hours : days;
  const unit = showHours ? "цаг" : "хоног";
  const accent = color ?? theme.seal;
  return (
    <View style={styles.countWrap}>
      <ProgressRing progress={Math.min(1, value / (showHours ? 24 : 30))} size={86} color={accent} label={String(value)} />
      <Text style={{ fontFamily: type.medium, color: theme.muted, fontSize: 11, marginTop: 2 }}>{unit} үлдлээ</Text>
    </View>
  );
}

export function Money({ text, style, light }: { text: string; style?: StyleProp<TextStyle>; light?: boolean }) {
  const { type, theme } = useTheme();
  const color = light ? "#fff" : theme.ink;
  if (!text.includes("₮")) {
    return <Text style={[{ fontFamily: type.bold, color, fontSize: 18 }, style]}>{text}</Text>;
  }
  const amount = text.replace("₮", "");
  return (
    <Text style={[{ fontFamily: type.bold, color, fontSize: 18 }, style]}>
      {amount}
      <Text style={{ fontFamily: type.currency }}>₮</Text>
    </Text>
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

const CONFETTI = ["#7A0C10", "#A3141A", "#C81E24", "#FFFFFF"];

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
      <Animated.View style={[styles.sheet, { backgroundColor: theme.name === "dark" ? "#161618" : "#FFFFFF" }, style]}>
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
  const stops = colors ?? (["#7A0C10", "#C81E24"] as [string, string]);
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[anim, { opacity: disabled ? 0.5 : 1 }]}>
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }}
        onPress={() => {
          void hapticTap();
          onPress();
        }}
      >
        <LinearGradient colors={stops} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
          <Text style={{ color: "#fff", fontFamily: type.bold, fontSize: 17, letterSpacing: -0.2 }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function Icon({ name, color, size = 22 }: { name: "home" | "search" | "quiz" | "ticket" | "user" | "phone" | "back"; color: string; size?: number }) {
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
  if (name === "phone") {
    return (
      <Svg {...common}>
        <Path d="M8 3.5h2.2l1.2 3-1.7 1a11 11 0 0 0 5.8 5.8l1-1.7 3 1.2V20a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5" fill={color} />
      </Svg>
    );
  }
  if (name === "back") {
    return (
      <Svg {...common}>
        <Path d="M14.5 5.5 8 12l6.5 6.5" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

export function CategoryBar({
  value,
  onChange,
  onRed = false,
}: {
  value: Category | "all";
  onChange: (id: Category | "all") => void;
  onRed?: boolean;
}) {
  const { theme, type } = useTheme();
  const options: { id: Category | "all"; label: string; color: string }[] = [
    { id: "all", label: "Бүгд", color: theme.seal },
    { id: "course", label: categoryMeta.course.label, color: categoryMeta.course.a },
    { id: "scholarship", label: categoryMeta.scholarship.label, color: categoryMeta.scholarship.a },
    { id: "tour", label: categoryMeta.tour.label, color: categoryMeta.tour.a },
  ];
  const [box, setBox] = useState<Record<string, { x: number; w: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  useEffect(() => {
    const next = box[value];
    if (!next) return;
    x.value = withSpring(next.x, { damping: 18, stiffness: 220 });
    w.value = withSpring(next.w, { damping: 18, stiffness: 220 });
  }, [box, value, w, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: w.value }));
  return (
    <View style={{ height: 40 }}>
      <Animated.View style={[styles.chipPill, { backgroundColor: "#A3141A" }, pill]} />
      <View style={{ flexDirection: "row", gap: 6 }}>
        {options.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              key={option.id}
              onLayout={(e) => {
                const { x: left, width } = e.nativeEvent.layout;
                setBox((prev) => (prev[option.id]?.x === left && prev[option.id]?.w === width ? prev : { ...prev, [option.id]: { x: left, w: width } }));
              }}
              onPress={() => {
                void hapticSelect();
                onChange(option.id);
              }}
              style={styles.chipHit}
            >
              <Text style={{ fontFamily: on ? type.bold : type.medium, fontSize: 13, color: on || onRed ? "#fff" : theme.ink }}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  aurora: { position: "absolute", width: 420, height: 420, borderRadius: 240 },
  countWrap: { alignItems: "center", width: 96 },
  glassWrap: { overflow: "hidden", borderWidth: 1, borderRadius: 28, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 18 },
  sheen: { position: "absolute", top: 0, left: 0, right: 0, height: 22 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  card: { height: 220, borderRadius: 22, overflow: "hidden", borderWidth: 1 },
  cardImg: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  cardShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 190 },
  cardTop: { position: "absolute", top: 12, left: 12, right: 12, gap: 8 },
  cardBody: { position: "absolute", left: 14, right: 14, bottom: 14 },
  cardTitle: { color: "#fff", fontSize: 18, lineHeight: 24, marginTop: 2 },
  count: { minWidth: 92, borderRadius: 20, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  ringLabel: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  bit: { position: "absolute", top: 0, width: 8, height: 14, borderRadius: 2 },
  sheetRoot: { ...StyleSheet.absoluteFill, justifyContent: "flex-end", zIndex: 20 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, paddingBottom: 28 },
  handle: { width: 42, height: 5, borderRadius: 99, alignSelf: "center", marginBottom: 12 },
  btn: { height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  chipPill: { position: "absolute", top: 0, left: 0, height: 36, borderRadius: 999 },
  chipHit: { height: 36, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
});

void interpolate;
void formatMnt;
