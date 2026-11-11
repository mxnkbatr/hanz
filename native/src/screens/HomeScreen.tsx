import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, useWindowDimensions, View, type ScrollViewInstance } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { rememberOrigin } from "../navigation/origin";
import { useScrollY } from "../navigation/scroll";
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
  const insets = useSafeAreaInsets();
  const scrollY = useScrollY();
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
  const onPage = useAnimatedScrollHandler({
    onScroll: (e) => {
      if (scrollY) scrollY.value = e.contentOffset.y;
    },
  });
  const largeTitle = useAnimatedStyle(() => ({
    opacity: scrollY ? interpolate(scrollY.value, [0, 36], [1, 0], Extrapolation.CLAMP) : 1,
    transform: [{ translateY: scrollY ? interpolate(scrollY.value, [0, 36], [0, -6], Extrapolation.CLAMP) : 0 }],
  }));
  const inlineTitle = useAnimatedStyle(() => ({
    opacity: scrollY ? interpolate(scrollY.value, [20, 48], [0, 1], Extrapolation.CLAMP) : 0,
  }));

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
      <Animated.ScrollView
        onScroll={onPage}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: clearance + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={theme.seal} colors={[theme.seal]} />}
      >
        <Animated.View style={largeTitle}>
          <Txt tone="muted">{name ? `Сайн байна уу, ${name}` : greeting()}</Txt>
          <Txt tone="display" style={{ marginTop: 4 }}>
            Хятад хэл.{"\n"}Тэтгэлэг. Хятад.
          </Txt>
          <Txt tone="muted" style={{ marginTop: 8 }}>2014 оноос HSK 1–6. Хятадын их сургуульд хүрэх зам.</Txt>
        </Animated.View>

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

        <Glass style={styles.stats} intensity={40}>
          {[
            [academy.graduates, "суралцагч"],
            [`${academy.years} жил`, "туршлага"],
            [academy.partners, "их сургууль"],
          ].map(([value, label]) => (
            <View key={label} style={styles.stat}>
              <Txt style={{ fontFamily: type.bold, fontSize: 18, letterSpacing: -0.3 }}>{value}</Txt>
              <Txt tone="muted">{label}</Txt>
            </View>
          ))}
        </Glass>

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
      </Animated.ScrollView>
      <View pointerEvents="box-none" style={[styles.nav, { paddingTop: insets.top }]}>
        <Glass style={styles.navGlass} intensity={60}>
          <SealMark size={32} />
          <Animated.View style={[{ flex: 1 }, inlineTitle]}>
            <Txt numberOfLines={1} style={{ fontFamily: type.bold, fontSize: 17 }}>ХАНЗ</Txt>
          </Animated.View>
          <Pressable
            onPress={() => {
              void hapticTap();
              void Linking.openURL(`tel:${academy.phones[0].raw}`);
            }}
          >
            <View style={styles.call}>
              <Icon name="phone" color={theme.seal} size={15} />
              <Txt style={{ fontFamily: type.semi, fontSize: 14 }}>Залгах</Txt>
            </View>
          </Pressable>
        </Glass>
      </View>
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
  const ref = useRef<{ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null>(null);
  const img = useAnimatedStyle(() => {
    const center = index * stride;
    const shift = interpolate(scrollX.value, [center - stride, center, center + stride], [28, 0, -28]);
    return { transform: [{ translateX: shift }, { scale: 1.08 }] };
  });
  return (
    <Tilt
      onPress={() => {
        ref.current?.measureInWindow((x, y, w, h) => {
          rememberOrigin({ x, y, w, h, image: program.image });
          onPress();
        });
      }}
      style={{ width }}
    >
      <View ref={ref as never} collapsable={false} style={[styles.hero, { width }]}>
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
  scroll: { padding: 20, paddingTop: 18, paddingBottom: 130, gap: 20 },
  nav: { position: "absolute", top: 0, left: 0, right: 0 },
  navGlass: { borderRadius: 0, borderTopWidth: 0, paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  stats: { borderRadius: 22, paddingVertical: 14, paddingHorizontal: 8, flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
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
  hero: { height: 248, borderRadius: 22, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  heroBody: { flex: 1, justifyContent: "flex-end", padding: 20, gap: 8 },
  heroMeta: { marginTop: 6, gap: 2 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cta: { borderRadius: 28, padding: 20, gap: 6 },
});
