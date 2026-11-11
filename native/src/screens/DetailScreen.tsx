import { useEffect, useState, type ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Countdown, Icon, Money, PrimaryButton, ProgramBadges, Txt } from "../components/ui";
import { formatDay, formatRange, priceCaption, priceLabel, soonestIntake } from "../lib/format";
import { useReduceMotion } from "../lib/motion";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

export function DetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Detail">>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { programs } = useApp();
  const { theme, type } = useTheme();
  const reduce = useReduceMotion();
  const program = programs.find((p) => p.id === route.params.id);
  const y = useSharedValue(0);
  const intro = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    intro.value = withTiming(1, { duration: reduce ? 0 : 520 });
  }, [intro, reduce]);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.value = e.contentOffset.y;
    },
  });
  const cover = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value > 0 ? y.value * 0.45 : y.value * 0.25 },
      { scale: y.value < 0 ? 1 - y.value / 500 : interpolate(intro.value, [0, 1], [1.08, 1]) },
    ],
  }));
  const bar = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [160, 230], [0, 1]) }));
  const [planId, setPlanId] = useState(program?.plans[0]?.id);
  const [intakeId, setIntakeId] = useState<string | undefined>(undefined);

  if (!program) {
    return (
      <MeshFallback>
        <Txt>Хөтөлбөр олдсонгүй.</Txt>
      </MeshFallback>
    );
  }
  const plan = program.plans.find((p) => p.id === planId) ?? program.plans[0];
  const openIntake = soonestIntake(program) ?? program.intakes[0];
  const intake = program.intakes.find((i) => i.id === (intakeId ?? openIntake?.id)) ?? openIntake;
  const cat = categoryMeta[program.category];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.coverWrap}>
          <Animated.View style={[styles.cover, cover]}>
            <Image source={{ uri: program.image }} style={styles.img} />
          </Animated.View>
          <LinearGradient colors={["rgba(0,0,0,0.12)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.86)"]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.coverCopy, { paddingTop: insets.top + 72 }]}>
            <View style={styles.row}>
              <Badge text={cat.label} color={cat.a} />
              <ProgramBadges program={program} />
            </View>
            <Txt tone="display" style={{ color: "#fff", fontSize: 36, lineHeight: 40, marginTop: 8 }}>
              {program.title}
            </Txt>
            <Txt style={{ color: "rgba(255,255,255,0.9)", marginTop: 4 }}>{program.subtitle}</Txt>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Txt tone="label">{priceCaption(program)}</Txt>
              <Money text={priceLabel(program, plan)} style={{ fontSize: 26 }} />
            </View>
            {intake ? <Countdown deadline={intake.deadline} color={cat.a} /> : null}
          </View>

          <Txt>{program.body}</Txt>

          {program.plans.length > 1 ? (
            <View style={{ gap: 8 }}>
              <Txt tone="title" style={{ fontSize: 18 }}>
                Төлөвлөгөө
              </Txt>
              {program.plans.map((p) => (
                <Pressable key={p.id} onPress={() => setPlanId(p.id)} style={[styles.line, { borderColor: plan?.id === p.id ? theme.seal : theme.line, backgroundColor: theme.card }]}>
                  <Txt style={{ fontFamily: type.semi }}>{p.label}</Txt>
                  <Txt style={{ fontFamily: type.bold }}>{priceLabel(program, p)}</Txt>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Txt tone="title" style={{ fontSize: 18 }}>
            Хуваарь
          </Txt>
          {program.intakes.map((i) => {
            const selected = intake?.id === i.id;
            return (
              <Pressable
                key={i.id}
                onPress={() => setIntakeId(i.id)}
                style={[styles.block, { borderColor: selected ? cat.a : theme.line, backgroundColor: selected ? `${cat.a}18` : theme.card }]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Txt style={{ fontFamily: type.bold }}>{i.label}</Txt>
                  <Txt style={{ color: selected ? cat.a : theme.muted, fontFamily: type.semi }}>{selected ? "Сонгосон" : "Сонгох"}</Txt>
                </View>
                <Txt tone="muted">{formatRange(i.start, i.end)}</Txt>
                <Txt tone="muted">{i.schedule}</Txt>
                <Txt tone="muted">Эцсийн хугацаа {formatDay(i.deadline)} · {i.seats} суудал</Txt>
              </Pressable>
            );
          })}

          <Txt tone="title" style={{ fontSize: 18 }}>
            Багтаамж
          </Txt>
          {program.included.map((item) => (
            <Txt key={item}>· {item}</Txt>
          ))}
          <Txt tone="title" style={{ fontSize: 18 }}>
            Шаардлага
          </Txt>
          {program.requirements.map((item) => (
            <Txt key={item}>· {item}</Txt>
          ))}
        </View>
      </Animated.ScrollView>

      <Animated.View pointerEvents="none" style={[styles.sticky, { height: insets.top + 56, backgroundColor: theme.name === "dark" ? "#161014" : "#FFF8F6", borderColor: theme.line }, bar]} />
      <Pressable onPress={() => nav.goBack()} style={[styles.back, { top: insets.top + 8, backgroundColor: theme.glassStrong, borderColor: theme.glassBorder }]}>
        <Icon name="back" color={theme.ink} size={22} />
      </Pressable>
      <Animated.View style={[styles.topTitle, { top: insets.top + 12 }, bar]} pointerEvents="none">
        <Txt numberOfLines={1} style={{ fontFamily: type.bold }}>
          {program.title}
        </Txt>
      </Animated.View>

      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.name === "dark" ? "#161014" : "#FFF8F6", borderColor: theme.line }]}>
        <View style={{ flex: 1 }}>
          <Txt tone="muted">{plan?.label}</Txt>
          <Money text={priceLabel(program, plan)} />
        </View>
        <View style={{ width: 150 }}>
          <PrimaryButton label="Елсэх" colors={[cat.a, cat.b]} onPress={() => nav.navigate("Enroll", { id: program.id, planId: plan?.id, intakeId: intake?.id })} />
        </View>
      </View>
    </View>
  );
}

function MeshFallback({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return <View style={{ flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: "center" }}>{children}</View>;
}

const styles = StyleSheet.create({
  coverWrap: { height: 420, overflow: "hidden" },
  cover: { ...StyleSheet.absoluteFill },
  img: { width: "100%", height: "100%" },
  coverCopy: { flex: 1, justifyContent: "flex-end", padding: 20, gap: 4 },
  body: { padding: 18, gap: 12 },
  priceRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  line: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: "row", justifyContent: "space-between" },
  block: { padding: 14, gap: 2, borderRadius: 18, borderWidth: 1.5 },
  back: { position: "absolute", left: 16, width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sticky: { position: "absolute", left: 0, right: 0, top: 0, borderBottomWidth: 1 },
  topTitle: { position: "absolute", left: 110, right: 20, height: 40, justifyContent: "center" },
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 10 },
});
