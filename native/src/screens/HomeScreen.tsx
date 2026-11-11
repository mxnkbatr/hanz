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
import { Badge, CategoryBar, Glass, Icon, Mesh, Money, ProgramBadges, ProgramCard, SealMark, Tilt, Txt, type IconName } from "../components/ui";
import { academy } from "../data/academy";
import type { Category, LocalEnrollment, PaymentState, Program } from "../domain/types";
import { daysUntil, deadlineSoon, formatDay, formatMnt, greeting, priceLabel, soonestIntake } from "../lib/format";
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

function paymentCopy(payment: PaymentState) {
  if (payment === "paid") return "Төлөгдсөн";
  if (payment === "failed") return "Амжилтгүй";
  if (payment === "none") return "Төлбөргүй";
  return "Хүлээгдэж буй";
}

function enrollmentCopy(status: LocalEnrollment["status"]) {
  if (status === "accepted") return "Баталсан";
  if (status === "paid") return "Төлбөр бүртгэгдсэн";
  if (status === "failed") return "Амжилтгүй";
  return "Илгээсэн";
}

function classPlace(program: Program | undefined) {
  if (!program || program.category === "course") return "Төв салбар";
  return program.city ?? "Хятад";
}

function AccountHome({
  name,
  enrollments,
  programs,
}: {
  name: string;
  enrollments: LocalEnrollment[];
  programs: Program[];
}) {
  const nav = useNavigation<Nav>();
  const { theme, type } = useTheme();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const { width } = useWindowDimensions();
  const col = (width - 40 - 12) / 2;
  const ordered = [...enrollments].sort((a, b) => {
    const ap = programs.find((p) => p.id === a.programId);
    const bp = programs.find((p) => p.id === b.programId);
    const ad = ap?.intakes.find((i) => i.id === a.intakeId)?.deadline ?? "9999";
    const bd = bp?.intakes.find((i) => i.id === b.intakeId)?.deadline ?? "9999";
    return ad.localeCompare(bd);
  });
  const primary = ordered[0];
  const program = programs.find((p) => p.id === primary?.programId);
  const intake = program?.intakes.find((i) => i.id === primary?.intakeId);
  const days = intake ? daysUntil(intake.deadline) : null;

  const facts: { icon: IconName; label: string; value: string; detail: string; onPress?: () => void }[] = primary
    ? [
        {
          icon: "ticket",
          label: "Элсэлт",
          value: enrollmentCopy(primary.status),
          detail: primary.programTitle,
          onPress: () => nav.navigate("Detail", { id: primary.programId }),
        },
        {
          icon: "card",
          label: "Төлбөр · QPay",
          value: paymentCopy(primary.payment),
          detail: primary.amount > 0 ? formatMnt(primary.amount) : "Төлбөр байхгүй",
          onPress: primary.payment === "pending" && primary.amount > 0 ? () => nav.navigate("Qpay", { enrollmentId: primary.id }) : undefined,
        },
        {
          icon: "calendar",
          label: "Дараагийн хичээл",
          value: intake ? formatDay(intake.start) : "Тодорхойгүй",
          detail: classPlace(program),
          onPress: () => nav.navigate("Detail", { id: primary.programId }),
        },
        {
          icon: "clock",
          label: "Эцсийн хугацаа",
          value: intake ? formatDay(intake.deadline) : "Тодорхойгүй",
          detail: days == null ? primary.intakeLabel : days < 0 ? "Хугацаа дууссан" : `${days} хоног үлдсэн`,
          onPress: () => nav.navigate("Detail", { id: primary.programId }),
        },
      ]
    : [];

  return (
    <Mesh>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: clearance + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#7A0C10", "#A3141A", "#C81E24"]} locations={[0, 0.55, 1]} style={[styles.mast, { paddingTop: insets.top + 64 }]}>
          <Txt style={{ color: "rgba(255,255,255,0.78)", fontFamily: type.medium }}>Сайн байна уу, {name}</Txt>
          <Txt tone="display" style={{ marginTop: 6, color: "#fff", fontSize: 34, lineHeight: 40 }}>
            Өнөөдрийн тойм
          </Txt>
          <Txt style={{ marginTop: 8, color: "rgba(255,255,255,0.82)", fontFamily: type.medium }}>Элсэлт, төлбөр, хичээлийн хуваарь.</Txt>
          <View style={styles.goldRule} />
        </LinearGradient>

        {facts.length ? (
          <View style={styles.grid}>
            {facts.map((fact) => (
              <Pressable
                key={fact.label}
                onPress={fact.onPress}
                style={[styles.fact, { width: col, borderColor: theme.line, backgroundColor: theme.name === "dark" ? "#121214" : "#FFFFFF" }]}
              >
                <Icon name={fact.icon} color="#C81E24" size={18} />
                <Txt tone="label">{fact.label}</Txt>
                <Txt style={{ fontFamily: type.bold, fontSize: 16, lineHeight: 22 }}>{fact.value}</Txt>
                <Txt tone="muted" numberOfLines={2}>{fact.detail}</Txt>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Txt tone="title">Элсэлт бүртгэгдээгүй</Txt>
            <Txt tone="muted">Нээлттэй хөтөлбөрөөс анги, тэтгэлэг эсвэл аялал сонгоно уу.</Txt>
          </View>
        )}

        {ordered.length ? (
          <View style={{ gap: 10 }}>
            <Txt tone="title">Миний бүртгэл</Txt>
            {ordered.map((item) => (
              <Pressable key={item.id} onPress={() => nav.navigate("Mine")} style={[styles.rowCard, { borderColor: theme.line }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={{ fontFamily: type.bold }}>{item.programTitle}</Txt>
                  <Txt tone="muted">{item.intakeLabel}</Txt>
                </View>
                <Txt style={{ fontFamily: type.semi, color: theme.seal }}>{paymentCopy(item.payment)}</Txt>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable onPress={() => nav.navigate("Catalog")}>
          <Txt style={{ fontFamily: type.semi, color: theme.seal }}>Нээлттэй хөтөлбөр</Txt>
        </Pressable>
      </ScrollView>
      <View pointerEvents="box-none" style={[styles.nav, { paddingTop: insets.top }]}>
        <Glass style={styles.navGlass} intensity={64} tint="brand">
          <SealMark size={32} />
          <View style={{ flex: 1 }}>
            <Txt numberOfLines={1} style={{ fontFamily: type.bold, fontSize: 17, lineHeight: 22, color: "#fff" }}>ХАНЗ</Txt>
          </View>
          <Pressable
            onPress={() => {
              void hapticTap();
              void Linking.openURL(`tel:${academy.phones[0].raw}`);
            }}
          >
            <View style={[styles.call, { backgroundColor: theme.name === "dark" ? "#161618" : "#FFFFFF", borderWidth: 1, borderColor: theme.name === "dark" ? "#C81E24" : "#7A0C10" }]}>
              <Icon name="phone" color="#C81E24" size={15} />
              <Txt style={{ fontFamily: type.semi, fontSize: 14, color: "#C81E24" }}>Залгах</Txt>
            </View>
          </Pressable>
        </Glass>
      </View>
    </Mesh>
  );
}

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { theme, type } = useTheme();
  const reduce = useReduceMotion();
  const clearance = useTabClearance();
  const insets = useSafeAreaInsets();
  const scrollY = useScrollY();
  const { programs, profile, enrollments, sessionEmail, refresh, refreshing } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const cardW = Math.min(width - 40, 440);
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
  const signedIn = Boolean(sessionEmail || profile.name.trim());
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

  if (signedIn) {
    return (
      <AccountHome
        name={profile.name.trim() || "Суралцагч"}
        enrollments={enrollments.filter((item) => item.name === profile.name.trim() || item.email === profile.email.trim())}
        programs={programs}
      />
    );
  }

  return (
    <Mesh>
      <Animated.ScrollView
        onScroll={onPage}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingBottom: clearance + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#FFFFFF" colors={["#C81E24"]} />}
      >
        <LinearGradient colors={["#7A0C10", "#A3141A", "#C81E24"]} locations={[0, 0.62, 1]} style={[styles.mast, { paddingTop: insets.top + 64 }]}>
          <Animated.View style={largeTitle}>
            <Txt style={{ color: "rgba(255,255,255,0.78)", fontFamily: type.medium }}>{name ? `Сайн байна уу, ${name}` : greeting()}</Txt>
            <Txt tone="display" style={{ marginTop: 6, color: "#fff", fontSize: 40, lineHeight: 46 }}>
              Нээлттэй{"\n"}элсэлт
            </Txt>
            <Txt style={{ marginTop: 10, color: "rgba(255,255,255,0.82)", fontFamily: type.medium }}>HSK 1–6, тэтгэлэг, Хятад дахь аялал.</Txt>
          </Animated.View>

          <Glass style={styles.search} intensity={28} tint="frost">
            <Icon name="search" color="rgba(255,255,255,0.72)" size={18} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="HSK, тэтгэлэг, аялал…"
              placeholderTextColor="rgba(255,255,255,0.62)"
              style={[styles.input, { color: "#fff", fontFamily: type.medium }]}
            />
          </Glass>

          <Glass style={styles.chips} intensity={28} tint="frost">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 4 }}>
            <CategoryBar value={cat} onChange={setCat} onRed />
          </ScrollView>
        </Glass>
          <View style={styles.goldRule} />
        </LinearGradient>

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

        <View style={[styles.stats, { borderColor: theme.line }]}>
          {[
            [academy.graduates, "суралцагч"],
            [`${academy.years} жил`, "туршлага"],
            [academy.partners, "их сургууль"],
          ].map(([value, label], index) => (
            <View key={label} style={[styles.stat, index > 0 ? { borderLeftWidth: 1, borderColor: theme.line } : null]}>
              <Txt style={{ fontFamily: type.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.3, color: theme.gold }}>{value}</Txt>
              <Txt tone="muted">{label}</Txt>
            </View>
          ))}
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
      </Animated.ScrollView>
      <View pointerEvents="box-none" style={[styles.nav, { paddingTop: insets.top }]}>
        <Glass style={styles.navGlass} intensity={64} tint="brand">
          <SealMark size={32} />
          <View style={{ flex: 1 }}>
            <Txt numberOfLines={1} style={{ fontFamily: type.bold, fontSize: 17, lineHeight: 22, color: "#fff" }}>ХАНЗ</Txt>
          </View>
          <Pressable
            onPress={() => {
              void hapticTap();
              void Linking.openURL(`tel:${academy.phones[0].raw}`);
            }}
          >
            <View
              style={[
                styles.call,
                theme.name === "dark"
                  ? { backgroundColor: "#161618", borderWidth: 1, borderColor: "#C81E24" }
                  : { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#7A0C10" },
              ]}
            >
              <Icon name="phone" color="#C81E24" size={15} />
              <Txt style={{ fontFamily: type.semi, fontSize: 14, color: "#C81E24" }}>Залгах</Txt>
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
            <Badge text={cat.label} color={cat.a} textColor={cat.a === "#D4A84B" ? "#111111" : "#fff"} />
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
    <Txt tone="display" style={{ color: "#fff", fontSize: 32, lineHeight: 38, fontFamily: family }}>
      {text}
    </Txt>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 130, gap: 20 },
  mast: { marginHorizontal: -20, paddingHorizontal: 20, paddingBottom: 22, gap: 20 },
  goldRule: { position: "absolute", left: 0, right: 0, bottom: 0, height: 1, backgroundColor: "#D4A84B" },
  nav: { position: "absolute", top: 0, left: 0, right: 0 },
  navGlass: { borderRadius: 0, borderTopWidth: 0, paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  stats: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 16, flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  call: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 36, borderRadius: 999 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, height: 48, borderRadius: 16 },
  chips: { borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  tabs: { gap: 8, paddingVertical: 2 },
  tabOn: { paddingHorizontal: 14, height: 36, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  tabOff: { paddingHorizontal: 14, height: 36, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  section: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 },
  carouselWrap: { gap: 10 },
  dots: { flexDirection: "row", gap: 6, paddingLeft: 4 },
  dot: { height: 6, borderRadius: 99 },
  hero: { height: 248, borderRadius: 22, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  heroBody: { flex: 1, justifyContent: "flex-end", padding: 20, gap: 8 },
  heroMeta: { marginTop: 6, gap: 2 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cta: { borderRadius: 28, padding: 20, gap: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  fact: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 6, minHeight: 148 },
  rowCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
});
