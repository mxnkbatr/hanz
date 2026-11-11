import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Mesh, ProgressRing, Tilt, Txt } from "../components/ui";
import { lessons } from "../data/quiz";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useTabClearance } from "../navigation/inset";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Quiz">, NativeStackNavigationProp<RootStackParamList>>;

export function QuizHomeScreen() {
  const nav = useNavigation<Nav>();
  const { quiz } = useApp();
  const { theme, type } = useTheme();
  const clearance = useTabClearance();
  const accent = categoryMeta.quiz;
  const level = Math.min(1, quiz.xp / 200);

  return (
    <Mesh>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: clearance + 24 }]}>
        <Txt tone="label">Сорил</Txt>
        <Txt tone="display" style={{ fontSize: 36, lineHeight: 40 }}>
          Өнөөдрийн{"\n"}ханз
        </Txt>
        <LinearGradient colors={[accent.a, accent.b]} style={styles.hero}>
          <View style={{ flex: 1, gap: 6 }}>
            <Txt tone="label" style={{ color: "rgba(255,255,255,0.8)" }}>
              Цуваа · XP
            </Txt>
            <Txt tone="display" style={{ color: "#fff", fontSize: 42, lineHeight: 46 }}>
              {quiz.streak} өдөр
            </Txt>
            <Txt style={{ color: "#fff" }}>{quiz.xp} XP · {quiz.hearts} зүрх</Txt>
          </View>
          <ProgressRing progress={level} color="#fff" label={`${Math.round(level * 100)}%`} />
        </LinearGradient>
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
            <Tilt key={lesson.id} onPress={() => nav.navigate("QuizPlay", { lessonId: lesson.id })}>
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>
                <View style={[styles.mark, { backgroundColor: lesson.kind === "placement" ? accent.a : theme.seal }]}>
                  <Txt style={{ color: "#fff", fontFamily: type.bold, fontSize: lesson.kind === "placement" ? 22 : 16 }}>
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
              </View>
            </Tilt>
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
  card: { borderRadius: 22, borderWidth: 1, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" },
  mark: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
