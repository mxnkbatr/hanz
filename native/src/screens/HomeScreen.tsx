import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, useWindowDimensions, View, type ScrollViewInstance } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import { Badge, CategoryBar, Glass, Icon, Mesh, Money, ProgramBadges, ProgramCard, SealMark, Tilt, Txt } from "../components/ui";
import { academy } from "../data/academy";
import type { Category, Program } from "../domain/types";
import { deadlineSoon, greeting, priceLabel, soonestIntake } from "../lib/format";
import { hapticTap } from "../lib/haptics";
import { useReduceMotion } from "../lib/motion";
import { useTabClearance } from "../navigation/inset";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Home">, NativeStackNavigationProp<RootStackParamList>>;

const cats: (Category | "all")[] = ["all", "course", "scholarship", "tour"];

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { theme, type } = useTheme();
  const reduce = useReduceMotion();
  const clearance = useTabClearance();
  const { programs, profile, refresh, refreshing } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const cardW = Math.min(width - 78, 420);
  const stride = cardW + 12;
  const scrollX = useSharedValue(0);
  const scroller = useRef<ScrollViewInstance>(null);
  const page = useRef(0);
  const paused = useRef(false);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return programs.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!query) return true;
      return `${p.title} ${p.summary} ${p.city ?? ""} ${p.level ?? ""}`.toLowerCase().includes(query);
    });
  }, [programs, q, cat]);

  const hero = filtered.filter((p) => p.featured && soonestIntake(p)).slice(0, 5);
  const open = filtered.filter((p) => soonestIntake(p));
  const soon = open.filter(deadlineSoon);
  const name = profile.name.trim().split(" ")[0];
  const slides = hero.length ? hero : open.slice(0, 3);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = setInterval(() => {
      if (paused.current) return;
      const next = (page.current + 1) % slides.length;
      page.current = next;
      scroller.current?.scrollTo({ x: next * stride, animated: true });
    }, 4200);
    return () => clearInterval(timer);
  }, [reduce, slides.length, stride]);

  return (
    <Mesh>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: clearance + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={theme.seal} colors={[theme.seal, theme.gold]} />}
      >
        <View style={styles.top}>
          <View style={styles.brand}>
            <SealMark size={42} />
            <View>
              <Txt tone="label">Ханз академи</Txt>
              <Txt style={{ fontFamily: type.bold, fontSize: 16 }}>Улаанбаатар</Txt>
            </View>
          </View>
          <Pressable
            onPress={() => {
              void hapticTap();
              void Linking.openURL(`tel:${academy.phones[0].raw}`);
            }}
          >
            <Glass style={styles.call} intensity={50} interactive>
              <Icon name="phone" color={theme.seal} size={15} />
              <Txt style={{ fontFamily: type.semi, fontSize: 14 }}>Залгах</Txt>
            </Glass>
          </Pressable>
        </View>

        <Txt tone="muted">{greeting()}</Txt>
        <Txt tone="display" style={{ fontSize: 40, lineHeight: 44, marginTop: 2 }}>
          {name ? `${name},\nөдрийг эхлүүл` : "Хятад хэлээ\nөнөөдөр эхлүүл"}
        </Txt>

        <Glass style={styles.search} intensity={36}>
          <Icon name="search" color={theme.muted} size={18} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="HSK, тэтгэлэг, аялал…"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink, fontFamily: type.medium }]}
          />
        </Glass>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          <CategoryBar value={cat} onChange={setCat} />
        </ScrollView>

        <View style={styles.carouselWrap}>
          <Animated.ScrollView
            ref={scroller}
            horizontal
            decelerationRate="fast"
            snapToInterval={stride}
            disableIntervalMomentum
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              paused.current = true;
            }}
            onMomentumScrollEnd={(e) => {
              page.current = Math.round(e.nativeEvent.contentOffset.x / stride);
              paused.current = false;
            }}
            contentContainerStyle={{ gap: 12, paddingRight: 36 }}
          >
            {slides.map((program, index) => (
              <Hero key={program.id} program={program} index={index} width={cardW} scrollX={scrollX} stride={stride} onPress={() => nav.navigate("Detail", { id: program.id })} />
            ))}
          </Animated.ScrollView>
          <View style={styles.dots}>
            {slides.map((program, index) => (
              <Dot key={program.id} index={index} scrollX={scrollX} stride={stride} />
            ))}
          </View>
        </View>

        <Section title="Нээлттэй элсэлт" action="Бүгд" onAction={() => nav.navigate("Catalog", cat === "all" ? undefined : { category: cat })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {open.slice(0, 8).map((p) => (
            <ProgramCard key={p.id} program={p} onPress={() => nav.navigate("Detail", { id: p.id })} />
          ))}
        </ScrollView>

        {soon.length ? (
          <>
            <Section title="Хугацаа дөхөж байна" />
            <View style={{ gap: 12 }}>
              {soon.slice(0, 3).map((p) => (
                <ProgramCard key={p.id} program={p} wide onPress={() => nav.navigate("Detail", { id: p.id })} />
              ))}
            </View>
          </>
        ) : null}

        <Pressable
          onPress={() => {
            void hapticTap();
            void Linking.openURL(`tel:${academy.phones[0].raw}`);
          }}
        >
          <Glass style={styles.cta} intensity={48}>
            <Txt tone="label">Шууд холбогдох</Txt>
            <Txt tone="title">{academy.phones[0].display}</Txt>
            <Txt tone="muted">{academy.phones[1].display} · {academy.hours}</Txt>
          </Glass>
        </Pressable>
      </ScrollView>
    </Mesh>
  );
}

function Section({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { type, theme } = useTheme();
  return (
    <View style={styles.section}>
      <Txt tone="title">{title}</Txt>
      {action ? (
        <Pressable onPress={onAction}>
          <Txt style={{ fontFamily: type.semi, color: theme.seal }}>{action}</Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

function Hero({
  program,
  index,
  width,
  stride,
  scrollX,
  onPress,
}: {
  program: Program;
  index: number;
  width: number;
  stride: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const { type } = useTheme();
  const cat = categoryMeta[program.category];
  const intake = soonestIntake(program);
  const img = useAnimatedStyle(() => {
    const center = index * stride;
    const shift = interpolate(scrollX.value, [center - stride, center, center + stride], [28, 0, -28]);
    return { transform: [{ translateX: shift }, { scale: 1.08 }] };
  });
  return (
    <Tilt onPress={onPress} style={{ width }}>
      <View style={[styles.hero, { width }]}>
        <Animated.View style={[StyleSheet.absoluteFill, img]}>
          <Image source={{ uri: program.image }} style={styles.heroImg} />
        </Animated.View>
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.88)"]} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroBody}>
          <View style={styles.row}>
            <Badge text={cat.label} color={cat.a} />
            <ProgramBadges program={program} />
          </View>
          <TextWrap family={type.display} text={program.title} />
          <Txt numberOfLines={2} style={{ color: "rgba(255,255,255,0.92)", marginTop: 4 }}>{program.summary}</Txt>
          <View style={styles.heroMeta}>
            <Money text={priceLabel(program)} light style={{ fontSize: 22 }} />
            <Txt style={{ color: "rgba(255,255,255,0.86)" }}>{intake?.schedule}</Txt>
          </View>
        </View>
      </View>
    </Tilt>
  );
}

function Dot({ index, scrollX, stride }: { index: number; scrollX: SharedValue<number>; stride: number }) {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => {
    const focus = 1 - Math.min(1, Math.abs(scrollX.value / stride - index));
    return { width: 6 + focus * 12, opacity: 0.28 + focus * 0.72, backgroundColor: theme.ink };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

function TextWrap({ text, family }: { text: string; family?: string }) {
  return (
    <Txt tone="display" style={{ color: "#fff", fontSize: 34, lineHeight: 36, fontFamily: family }}>
      {text}
    </Txt>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingTop: 16, paddingBottom: 130, gap: 16 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  call: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 36, borderRadius: 999 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, height: 52, borderRadius: 18, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  tabs: { gap: 8, paddingVertical: 2 },
  tabOn: { paddingHorizontal: 14, height: 36, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  tabOff: { paddingHorizontal: 14, height: 36, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  section: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 },
  carouselWrap: { marginRight: -18, gap: 10 },
  dots: { flexDirection: "row", gap: 6, paddingLeft: 4 },
  dot: { height: 6, borderRadius: 99 },
  hero: { height: 312, borderRadius: 32, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  heroBody: { flex: 1, justifyContent: "flex-end", padding: 20, gap: 8 },
  heroMeta: { marginTop: 6, gap: 2 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cta: { borderRadius: 28, padding: 20, gap: 6 },
});
