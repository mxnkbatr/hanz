import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewInstance } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PrimaryButton, Txt } from "../components/ui";
import { hapticSelect } from "../lib/haptics";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

const pages = [
  {
    hanzi: "汉",
    kicker: "Сургалт",
    title: "HSK 1–6,\nнэг дороос",
    body: "Эрчимжүүлсэн анги, хуваарь, суудал, эцсийн хугацаа. Тохирох түвшнээ сонгоод элсэнэ.",
    colors: [categoryMeta.course.a, categoryMeta.course.b] as [string, string],
  },
  {
    hanzi: "奖",
    kicker: "Тэтгэлэг",
    title: "Хятадын\nих сургууль",
    body: "Хэлний бэлтгэл, бакалавр, магистр. Сургалт ба байр үнэгүй хөтөлбөрүүд нээлттэй.",
    colors: [categoryMeta.scholarship.a, "#E07A1A"] as [string, string],
  },
  {
    hanzi: "旅",
    kicker: "Аялал · QPay",
    title: "Өвөл, зун,\nдараа нь төлбөр",
    body: "Хятад дахь богино хөтөлбөр. Элсэлтээ QPay QR эсвэл банкны аппаар баталгаажуулна.",
    colors: [categoryMeta.tour.a, "#0F766E"] as [string, string],
  },
];

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { finishOnboarding } = useApp();
  const { theme, type } = useTheme();
  const ref = useRef<ScrollViewInstance>(null);
  const [page, setPage] = useState(0);

  function go(next: number) {
    void hapticSelect();
    ref.current?.scrollTo({ x: next * width, animated: true });
    setPage(next);
  }

  function finish() {
    finishOnboarding();
    nav.replace("Main");
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {pages.map((p) => (
          <LinearGradient key={p.kicker} colors={p.colors} style={[styles.page, { width }]}>
            <Txt tone="zh" style={styles.hanzi}>
              {p.hanzi}
            </Txt>
            <Txt tone="label" style={{ color: "rgba(255,255,255,0.8)" }}>
              {p.kicker}
            </Txt>
            <Txt tone="display" style={styles.title}>
              {p.title}
            </Txt>
            <Txt style={styles.body}>{p.body}</Txt>
          </LinearGradient>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {pages.map((p, i) => (
            <View key={p.kicker} style={[styles.dot, { width: i === page ? 22 : 7, backgroundColor: i === page ? theme.ink : theme.line }]} />
          ))}
        </View>
        {page < pages.length - 1 ? (
          <View style={styles.actions}>
            <Pressable onPress={finish}>
              <Txt tone="muted" style={{ fontFamily: type.semi }}>
                Алгасах
              </Txt>
            </Pressable>
            <View style={{ width: 180 }}>
              <PrimaryButton label="Цааш" onPress={() => go(page + 1)} />
            </View>
          </View>
        ) : (
          <PrimaryButton label="Эхлэх" onPress={finish} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 28, paddingTop: 110, justifyContent: "flex-end", paddingBottom: 160 },
  hanzi: { position: "absolute", top: 90, right: 24, fontSize: 120, color: "rgba(255,255,255,0.28)" },
  title: { color: "#fff", fontSize: 48, lineHeight: 50, marginTop: 10 },
  body: { color: "rgba(255,255,255,0.92)", fontSize: 17, lineHeight: 24, marginTop: 14, maxWidth: 340 },
  footer: { position: "absolute", left: 20, right: 20, bottom: 28, gap: 14 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { height: 7, borderRadius: 99 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
