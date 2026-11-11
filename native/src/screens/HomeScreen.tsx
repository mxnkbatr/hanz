import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CategoryBar, Glass, Icon, Mesh, SealMark, Txt } from "../components/ui";
import type { Category, Program } from "../domain/types";
import { formatDay, formatMnt, priceLabel, soonestIntake } from "../lib/format";
import { hapticSelect } from "../lib/haptics";
import { useTabClearance } from "../navigation/inset";
import { rememberOrigin } from "../navigation/origin";
import { useScrollY } from "../navigation/scroll";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Home">, NativeStackNavigationProp<RootStackParamList>>;

const cats: (Category | "all")[] = ["all", "course", "scholarship", "tour"];

export function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { theme, type } = useTheme();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const scrollY = useScrollY();
  const { programs, enrollments, quiz } = useApp();
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const [q, setQ] = useState("");

  const featured = useMemo(() => {
    const pool = programs.filter((p) => (cat === "all" ? p.featured || p.category === "course" : p.category === cat));
    const query = q.trim().toLowerCase();
    const matched = query ? pool.filter((p) => `${p.title} ${p.summary}`.toLowerCase().includes(query)) : pool;
    return (matched[0] ?? programs.find((p) => p.category === "course") ?? programs[0]) as Program | undefined;
  }, [programs, cat, q]);

  const next = useMemo(() => {
    const enrollment = enrollments[0];
    const program = programs.find((p) => p.id === enrollment?.programId) ?? featured;
    const intake = program?.intakes.find((i) => i.id === enrollment?.intakeId) ?? (program ? soonestIntake(program) : undefined);
    return { program, intake, enrollment };
  }, [enrollments, programs, featured]);

  const payment = enrollments.find((e) => e.amount > 0) ?? enrollments[0];
  const scholarship = programs.find((p) => p.category === "scholarship");
  const paid = payment?.payment === "paid";

  function openProgram(program: Program) {
    rememberOrigin({ x: 24, y: 280, w: 180, h: 240, image: program.image });
    nav.navigate("Detail", { id: program.id });
  }

  return (
    <Mesh>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        contentContainerStyle={{ paddingBottom: clearance + 48 }}
      >
        <LinearGradient colors={["#C81E24", "#A3141A", "#7A0C10"]} locations={[0, 0.55, 1]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Txt tone="zh" style={styles.watermark}>汉</Txt>
          <View style={styles.brandRow}>
            <SealMark size={36} light />
            <Txt style={[styles.brand, { fontFamily: type.bold }]}>ХАНЗ АКАДЕМИ</Txt>
          </View>
          <Txt tone="display" style={styles.title}>
            Хятад хэлээ{"\n"}өнөөдөр эхлүүл
          </Txt>
        </LinearGradient>

        <Glass style={styles.search} intensity={28} tint="sheet">
          <Icon name="search" color={theme.muted} size={18} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="HSK, тэтгэлэг, аялал хайх"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink, fontFamily: type.medium }]}
          />
        </Glass>

        <View style={styles.chips}>
          <CategoryBar
            value={cat}
            onChange={(id) => {
              void hapticSelect();
              setCat(id);
            }}
          />
        </View>

        <View style={styles.bento}>
          <View style={styles.row}>
          {featured ? (
            <Pressable style={styles.photo} onPress={() => openProgram(featured)}>
              <Image source={{ uri: featured.image }} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(10,10,11,0.82)"]} style={styles.scrim} />
              <View style={styles.photoCopy}>
                <Txt tone="display" style={styles.photoTitle}>{featured.title}</Txt>
                <Txt style={styles.photoPrice}>{priceLabel(featured)}</Txt>
              </View>
            </Pressable>
          ) : null}

          <View style={styles.stack}>
            <Pressable
              style={[styles.tile, styles.graphite]}
              onPress={() => next.program && openProgram(next.program)}
            >
              <View style={styles.tileTop}>
                <Icon name="calendar" color="#FFFFFF" size={20} />
                <Icon name="chevron" color="#E5E5EA" size={18} />
              </View>
              <Txt style={styles.tileLabel}>Дараагийн хичээл</Txt>
              <Txt style={[styles.tileValue, { fontFamily: type.bold }]}>
                {next.intake ? formatDay(next.intake.start).slice(5).replace(".", ".") : "Нээлттэй"}
              </Txt>
            </Pressable>

            <Pressable
              style={[styles.tile, styles.white, { borderColor: theme.line }]}
              onPress={() => (payment && payment.amount > 0 ? nav.navigate("Qpay", { enrollmentId: payment.id }) : nav.navigate("Mine"))}
            >
              <View style={styles.payRow}>
                <Icon name="check" color={paid ? theme.good : theme.warn} size={22} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: type.bold, color: theme.ink }}>Төлбөр · QPay</Txt>
                  <Txt tone="muted">{paid ? "Төлөгдсөн" : payment ? "Хүлээгдэж буй" : "Элсэлт алга"}</Txt>
                </View>
              </View>
              {payment && payment.amount > 0 ? <Txt style={{ fontFamily: type.bold, color: theme.ink }}>{formatMnt(payment.amount)}</Txt> : null}
            </Pressable>
          </View>
          </View>

          <View style={styles.row}>
          <Pressable style={[styles.wide, styles.white, { borderColor: theme.line }]} onPress={() => nav.navigate("Quiz")}>
            <Icon name="flame" color="#C81E24" size={26} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: type.bold, color: theme.ink }}>Сорил</Txt>
              <Txt tone="muted">{quiz.streak} өдөр · {quiz.xp} оноо</Txt>
            </View>
          </Pressable>

          {scholarship ? (
            <Pressable style={[styles.wide, styles.graphite]} onPress={() => openProgram(scholarship)}>
              <View style={styles.tileTop}>
                <View>
                  <Txt style={{ fontFamily: type.bold, color: "#FFFFFF" }}>Тэтгэлэгт хөтөлбөр</Txt>
                  <Txt style={{ color: "#E5E5EA", marginTop: 4 }}>{scholarship.city ?? scholarship.subtitle}</Txt>
                </View>
                <View style={styles.star}>
                  <Icon name="star" color="#C81E24" size={16} />
                </View>
              </View>
              <View style={styles.redLine} />
            </Pressable>
          ) : null}
          </View>
        </View>
      </ScrollView>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28, overflow: "hidden" },
  watermark: { position: "absolute", right: -10, top: 36, fontSize: 180, lineHeight: 190, color: "#FFFFFF", opacity: 0.14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { color: "#FFFFFF", fontSize: 13, letterSpacing: 1.4 },
  title: { color: "#FFFFFF", fontSize: 34, lineHeight: 40, marginTop: 22 },
  search: { marginHorizontal: 20, marginTop: -26, height: 48, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  chips: { paddingHorizontal: 20, paddingTop: 16 },
  bento: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  photo: { flex: 1, height: 248, borderRadius: 24, overflow: "hidden", backgroundColor: "#1C1C1E" },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 140 },
  photoCopy: { position: "absolute", left: 14, right: 14, bottom: 14, gap: 4 },
  photoTitle: { color: "#FFFFFF", fontSize: 22, lineHeight: 26 },
  photoPrice: { color: "#FFFFFF", fontSize: 16 },
  stack: { flex: 1, gap: 12 },
  tile: { borderRadius: 24, padding: 14, minHeight: 116, justifyContent: "space-between" },
  graphite: { backgroundColor: "#1C1C1E" },
  white: { backgroundColor: "#FFFFFF", borderWidth: 1 },
  tileTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tileLabel: { color: "#E5E5EA", fontSize: 14, marginTop: 12 },
  tileValue: { color: "#FFFFFF", fontSize: 20, lineHeight: 26 },
  payRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  wide: { flex: 1, borderRadius: 24, padding: 14, minHeight: 104, justifyContent: "space-between" },
  star: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  redLine: { height: 2, borderRadius: 1, backgroundColor: "#C81E24", marginTop: 16 },
});
