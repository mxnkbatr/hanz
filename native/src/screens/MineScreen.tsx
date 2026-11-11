import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Glass, Mesh, Txt } from "../components/ui";
import type { LocalEnrollment } from "../domain/types";
import { formatMnt } from "../lib/format";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { useTabClearance } from "../navigation/inset";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Mine">, NativeStackNavigationProp<RootStackParamList>>;

const steps = [
  { id: "submitted", label: "Илгээсэн" },
  { id: "paid", label: "Төлсөн" },
  { id: "accepted", label: "Баталсан" },
] as const;

function reached(item: LocalEnrollment, id: (typeof steps)[number]["id"]) {
  if (id === "submitted") return true;
  if (id === "paid") return item.payment === "paid" || item.status === "paid" || item.status === "accepted";
  return item.status === "accepted";
}

export function MineScreen() {
  const { enrollments } = useApp();
  const nav = useNavigation<Nav>();
  const { theme, type } = useTheme();
  const clearance = useTabClearance();

  return (
    <Mesh>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: clearance + 24 }]}>
        <Txt tone="label">Бүртгэл</Txt>
        <Txt tone="display" style={{ fontSize: 34, lineHeight: 38 }}>
          Миний элсэлтүүд
        </Txt>
        {!enrollments.length ? <Txt tone="muted">Одоогоор элсэлт алга. Нүүрээс хөтөлбөр сонгоно уу.</Txt> : null}
        {enrollments.map((item) => {
          const cat = categoryMeta[item.category];
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.payment === "pending" && item.amount > 0) nav.navigate("Qpay", { enrollmentId: item.id });
              }}
            >
              <Glass style={styles.card}>
                <View style={styles.head}>
                  <View style={[styles.dot, { backgroundColor: cat.a }]} />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontFamily: type.bold }}>{item.programTitle}</Txt>
                    <Txt tone="muted">
                      {item.intakeLabel} · {formatMnt(item.amount)}
                    </Txt>
                  </View>
                  {item.demo ? <Txt tone="muted">Жишээ</Txt> : null}
                </View>
                <View style={styles.time}>
                  {steps.map((step, index) => {
                    const on = reached(item, step.id);
                    const failed = item.payment === "failed" && step.id === "paid";
                    return (
                      <View key={step.id} style={styles.step}>
                        <View style={styles.rail}>
                          <View style={[styles.node, { backgroundColor: failed ? theme.bad : on ? cat.a : theme.line }]} />
                          {index < steps.length - 1 ? <View style={[styles.bar, { backgroundColor: on ? cat.a : theme.line }]} /> : null}
                        </View>
                        <Txt tone="muted" style={{ color: on ? theme.ink : theme.muted, fontSize: 12 }}>
                          {failed ? "Амжилтгүй" : step.label}
                        </Txt>
                      </View>
                    );
                  })}
                </View>
                {item.payment === "pending" && item.amount > 0 ? <Txt style={{ color: theme.seal, fontFamily: type.semi }}>Төлбөр үргэлжлүүлэх</Txt> : null}
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
  card: { padding: 14, borderRadius: 22, gap: 12 },
  head: { flexDirection: "row", gap: 10, alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 99 },
  time: { flexDirection: "row" },
  step: { flex: 1, gap: 6 },
  rail: { flexDirection: "row", alignItems: "center" },
  node: { width: 12, height: 12, borderRadius: 99 },
  bar: { height: 3, flex: 1, marginRight: 4 },
});
