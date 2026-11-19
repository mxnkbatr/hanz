import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryBar, Glass, Icon, Mesh, PrimaryButton, ProgramCard, Sheet, Txt } from "../components/ui";
import type { Category, Stage } from "../domain/types";
import { deadlineSoon, seatsLeft } from "../lib/format";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useTabClearance } from "../navigation/inset";
import { useScrollY } from "../navigation/scroll";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Catalog">, NativeStackNavigationProp<RootStackParamList>>;

export function CatalogScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<TabParamList, "Catalog">>();
  const { programs } = useApp();
  const { theme, type } = useTheme();
  const clearance = useTabClearance();
  const insets = useSafeAreaInsets();
  const scrollY = useScrollY();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">(route.params?.category ?? "all");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [onlySoon, setOnlySoon] = useState(false);
  const [onlySeats, setOnlySeats] = useState(false);
  const [sheet, setSheet] = useState(false);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return programs.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (stage !== "all" && p.stage !== stage) return false;
      if (onlySoon && !deadlineSoon(p)) return false;
      if (onlySeats && seatsLeft(p) > 12) return false;
      if (!query) return true;
      return `${p.title} ${p.summary} ${p.city ?? ""} ${p.level ?? ""}`.toLowerCase().includes(query);
    });
  }, [programs, q, cat, stage, onlySoon, onlySeats]);

  return (
    <Mesh>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: clearance + 24 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y;
        }}
      >
        <Txt tone="label">Каталог</Txt>
        <Txt tone="display" style={{ fontSize: 34, lineHeight: 38 }}>
          Хөтөлбөр хайх
        </Txt>
        <Glass style={styles.search}>
          <Icon name="search" color={theme.muted} size={18} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Нэр, хот, түвшин…"
            placeholderTextColor={theme.muted}
            style={{ flex: 1, color: theme.ink, fontFamily: type.medium, fontSize: 15 }}
          />
        </Glass>
        <CategoryBar value={cat} onChange={setCat} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Txt tone="muted">{list.length} хөтөлбөр</Txt>
          <Pressable onPress={() => setSheet(true)} style={[styles.chip, { borderColor: theme.seal, backgroundColor: theme.card }]}>
            <Txt style={{ color: theme.seal, fontFamily: type.bold, fontSize: 13 }}>Шүүлтүүр</Txt>
          </Pressable>
        </View>
        <View style={{ gap: 12 }}>
          {list.map((p) => (
            <ProgramCard key={p.id} program={p} wide onPress={() => nav.navigate("Detail", { id: p.id })} />
          ))}
          {!list.length ? <Txt tone="muted">Тохирох хөтөлбөр алга. Шүүлтүүрээ суллана уу.</Txt> : null}
        </View>
      </ScrollView>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Шүүлтүүр">
        <Txt tone="label">Түвшин</Txt>
        <View style={styles.wrap}>
          {(["all", "beginner", "intermediate", "advanced"] as const).map((id) => (
            <Pressable key={id} onPress={() => setStage(id)} style={[styles.chip, { backgroundColor: stage === id ? theme.ink : theme.card, borderColor: theme.line }]}>
              <Txt style={{ color: stage === id ? theme.bg : theme.ink, fontFamily: type.semi, fontSize: 13 }}>
                {id === "all" ? "Бүгд" : id === "beginner" ? "Анхан" : id === "intermediate" ? "Дунд" : "Ахисан"}
              </Txt>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => setOnlySoon((v) => !v)} style={styles.check}>
          <Txt>{onlySoon ? "Сонгосон · " : ""}Хугацаа дөхсөн</Txt>
        </Pressable>
        <Pressable onPress={() => setOnlySeats((v) => !v)} style={styles.check}>
          <Txt>{onlySeats ? "Сонгосон · " : ""}12-оос цөөн суудал</Txt>
        </Pressable>
        <PrimaryButton label="Харах" onPress={() => setSheet(false)} />
      </Sheet>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingTop: 18, paddingBottom: 130, gap: 12 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, height: 50, borderRadius: 18 },
  chip: { paddingHorizontal: 12, height: 36, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 10 },
  check: { paddingVertical: 8 },
});
