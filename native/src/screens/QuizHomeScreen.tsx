import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Glass, Mesh, ProgressRing, Txt } from "../components/ui";
import { lessons } from "../data/quiz";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useTabClearance } from "../navigation/inset";
import { useScrollY } from "../navigation/scroll";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Quiz">, NativeStackNavigationProp<RootStackParamList>>;

export function QuizHomeScreen() {
  const nav = useNavigation<Nav>();
  const { quiz } = useApp();
  const { theme, type } = useTheme();
  const clearance = useTabClearance();
  const scrollY = useScrollY();
  const accent = categoryMeta.quiz;
  const level = Math.min(1, quiz.xp / 200);

  return (
    <Mesh>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: clearance + 24 }]}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y;
        }}
      >
        <Txt tone="label">Сорил</Txt>
        <Txt tone="display" style={{ fontSize: 36, lineHeight: 40 }}>
          Өнөөдрийн{"\n"}ханз
        </Txt>
        <Glass style={styles.hero} intensity={46}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt tone="label">Цуваа · XP</Txt>
            <Txt tone="display" style={{ fontSize: 40, lineHeight: 44 }}>
              {quiz.streak} өдөр
            </Txt>
            <Txt tone="muted">{quiz.xp} XP · {quiz.hearts} зүрх</Txt>
          </View>
          <ProgressRing progress={level} color={accent.a} label={`${Math.round(level * 100)}%`} />
        </Glass>
        <View style={styles.hearts}>
          {Array.from({ length: 5 }, (_, i) => (
            <Txt key={i} style={{ fontSize: 22, opacity: i < quiz.hearts ? 1 : 0.25 }}>
              ♥
            </Txt>
          ))}
        </View>
        {lessons.map((lesson) => {
          const done = quiz.completed[lesson.id];
          return (
            <Pressable key={lesson.id} onPress={() => nav.navigate("QuizPlay", { lessonId: lesson.id })}>
              <Glass style={styles.card} intensity={36}>
                <View style={[styles.mark, { backgroundColor: lesson.kind === "placement" ? "rgba(110,89,230,0.14)" : "rgba(200,30,36,0.1)" }]}>
                  <Txt style={{ color: lesson.kind === "placement" ? accent.a : theme.seal, fontFamily: type.bold, fontSize: lesson.kind === "placement" ? 22 : 16 }}>
                    {lesson.kind === "placement" ? "测" : lesson.level.replace("HSK ", "")}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: type.bold, fontSize: 17 }}>{lesson.title}</Txt>
                  <Txt tone="muted">{lesson.subtitle}</Txt>
                  <Txt tone="muted">
                    {lesson.minutes} мин · {lesson.xp} XP
                    {done ? ` · ${done.correct}/${done.total}` : ""}
                  </Txt>
                </View>
              </Glass>
            </Pressable>
          );
        })}
      </ScrollView>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 130, gap: 12 },
  hero: { borderRadius: 28, padding: 18, flexDirection: "row", alignItems: "center", gap: 8 },
  hearts: { flexDirection: "row", gap: 6 },
  card: { borderRadius: 22, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" },
  mark: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
