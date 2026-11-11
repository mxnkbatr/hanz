import { StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Confetti, PrimaryButton, Txt } from "../components/ui";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

export function QuizDoneScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "QuizDone">>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { programs } = useApp();
  const { theme } = useTheme();
  const { correct, total, xp, suggested } = route.params;
  const program = programs.find((p) => p.id === suggested);
  const ratio = total ? correct / total : 0;

  return (
    <View style={[styles.page, { backgroundColor: theme.bg }]}>
      <Confetti show={ratio >= 0.6} />
      <Txt tone="zh" style={{ fontSize: 72, textAlign: "center", color: categoryMeta.quiz.a }}>
        {ratio >= 0.75 ? "好" : ratio >= 0.4 ? "学" : "再"}
      </Txt>
      <Txt tone="display" style={{ textAlign: "center", fontSize: 38, lineHeight: 42 }}>
        {correct}/{total}
      </Txt>
      <Txt tone="muted" style={{ textAlign: "center" }}>
        +{xp} XP
      </Txt>
      {program ? (
        <>
          <Txt style={{ textAlign: "center" }}>Танд тохирох анги: {program.title}</Txt>
          <PrimaryButton
            label="Энэ ангид элсэх"
            colors={[categoryMeta.quiz.a, categoryMeta.quiz.b]}
            onPress={() => nav.replace("Detail", { id: program.id })}
          />
        </>
      ) : null}
      <PrimaryButton label="Сорил руу" colors={[theme.ink, "#3A2A30"]} onPress={() => nav.popToTop()} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
});
