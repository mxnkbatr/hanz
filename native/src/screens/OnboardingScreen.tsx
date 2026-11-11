import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewInstance } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Mesh, PrimaryButton, Txt } from "../components/ui";
import { hapticSelect } from "../lib/haptics";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

const pages = [
  {
    hanzi: "汉",
    kicker: "Сургалт",
    title: "HSK 1–6,\nнэг дороос",
    body: "Эрчимжүүлсэн анги, хуваарь, суудал, эцсийн хугацаа. Тохирох түвшнээ сонгоод элсэнэ.",
  },
  {
    hanzi: "奖",
    kicker: "Тэтгэлэг",
    title: "Хятадын\nих сургууль",
    body: "Хэлний бэлтгэл, бакалавр, магистр. Сургалт ба байр үнэгүй хөтөлбөрүүд нээлттэй.",
  },
  {
    hanzi: "旅",
    kicker: "Аялал · QPay",
    title: "Өвөл, зун,\nдараа нь төлбөр",
    body: "Хятад дахь богино хөтөлбөр. Элсэлтээ QPay QR эсвэл банкны аппаар баталгаажуулна.",
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
    <Mesh>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {pages.map((p) => (
          <View key={p.kicker} style={[styles.page, { width }]}>
            <Txt tone="zh" style={[styles.hanzi, { color: theme.seal }]}>
              {p.hanzi}
            </Txt>
            <Txt tone="label">{p.kicker}</Txt>
            <Txt tone="display" style={styles.title}>
              {p.title}
            </Txt>
            <Txt tone="muted" style={styles.body}>{p.body}</Txt>
          </View>
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
    </Mesh>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 28, paddingTop: 110, justifyContent: "flex-end", paddingBottom: 160 },
  hanzi: { position: "absolute", top: 90, right: 24, fontSize: 120, opacity: 0.12 },
  title: { fontSize: 48, lineHeight: 52, marginTop: 10 },
  body: { fontSize: 17, lineHeight: 24, marginTop: 14, maxWidth: 340 },
  footer: { position: "absolute", left: 20, right: 20, bottom: 28, gap: 14 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { height: 7, borderRadius: 99 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
