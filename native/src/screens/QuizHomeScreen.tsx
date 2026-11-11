import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mesh, ProgressRing, Txt } from "../components/ui";
import { lessons } from "../data/quiz";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useTabClearance } from "../navigation/inset";
import { useScrollY } from "../navigation/scroll";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Quiz">, NativeStackNavigationProp<RootStackParamList>>;

export function QuizHomeScreen() {
  const nav = useNavigation<Nav>();
  const { quiz } = useApp();
  const { theme, type } = useTheme();
  const clearance = useTabClearance();
  const insets = useSafeAreaInsets();
  const scrollY = useScrollY();
  const level = Math.min(1, quiz.xp / 200);

  return (
    <Mesh>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: clearance + 24 }]}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y;
        }}
      >
        <Txt tone="label">Дасгал</Txt>
        <Txt tone="display" style={{ fontSize: 34, lineHeight: 40 }}>
          Өнөөдрийн даалгавар
        </Txt>
        <View style={[styles.hero, { borderColor: theme.line, backgroundColor: theme.name === "dark" ? "#1C1C20" : "#FFFFFF" }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt tone="label">Үргэлжилсэн өдөр</Txt>
            <Txt tone="display" style={{ fontSize: 36, lineHeight: 42 }}>
              <Text style={{ color: theme.seal }}>{quiz.streak}</Text>
              <Text> өдөр</Text>
            </Txt>
            <Txt tone="muted"><Text style={{ color: theme.seal }}>{quiz.xp}</Text> оноо · {quiz.hearts} оролдлого</Txt>
          </View>
          <ProgressRing progress={level} color="#C81E24" label={`${Math.round(level * 100)}%`} />
        </View>
        <View style={styles.hearts}>
          {Array.from({ length: 5 }, (_, i) => (
            <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < quiz.hearts ? "#C81E24" : theme.line }} />
          ))}
          <Txt tone="muted">Үлдсэн оролдлого</Txt>
        </View>
        {lessons.map((lesson) => {
          const done = quiz.completed[lesson.id];
          return (
            <Pressable key={lesson.id} onPress={() => nav.navigate("QuizPlay", { lessonId: lesson.id })}>
              <View style={[styles.card, { borderColor: theme.line, backgroundColor: theme.name === "dark" ? "#1C1C20" : "#FFFFFF" }]}>
                <View style={[styles.mark, { borderColor: "#C81E24" }]}>
                  <Txt style={{ color: theme.seal, fontFamily: type.bold, fontSize: 15 }}>
                    {lesson.kind === "placement" ? "Түв" : lesson.level.replace("HSK ", "")}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: type.bold, fontSize: 17 }}>{lesson.title}</Txt>
                  <Txt tone="muted">{lesson.subtitle}</Txt>
                  <Txt tone="muted">
                    {lesson.minutes} мин · <Text style={{ color: theme.seal }}>{lesson.xp}</Text> оноо
                    {done ? ` · ${done.correct}/${done.total}` : ""}
                  </Txt>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 130, gap: 12 },
  hero: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  hearts: { flexDirection: "row", alignItems: "center", gap: 6 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" },
  mark: { width: 64, height: 64, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
