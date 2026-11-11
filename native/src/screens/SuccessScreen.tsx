import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Glass, PrimaryButton, SealMark, Txt } from "../components/ui";
import { formatMnt, receiptNo } from "../lib/format";
import { hapticSuccess } from "../lib/haptics";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

export function SuccessScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Success">>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { enrollments } = useApp();
  const { theme, type } = useTheme();
  const enrollment = enrollments.find((e) => e.id === route.params.enrollmentId);

  useEffect(() => {
    void hapticSuccess();
  }, []);

  const paid = enrollment?.payment === "paid";

  return (
    <View style={[styles.page, { backgroundColor: theme.bg }]}>
      <SealMark size={72} />
      <Txt tone="display" style={{ textAlign: "center", fontSize: 40, lineHeight: 44 }}>
        {paid ? "Төлбөр\nбаталгаажлаа" : "Хүсэлт\nбүртгэгдлээ"}
      </Txt>
      <Txt tone="muted" style={{ textAlign: "center" }}>
        {enrollment?.sandbox ? "Туршилтын баримт. Мөнгө шилжээгүй." : "ХАНЗ тантай холбогдоно."}
      </Txt>
      <Glass style={styles.receipt}>
        <Txt tone="label">Баримт</Txt>
        <Txt style={{ fontFamily: type.bold, fontSize: 18 }}>{enrollment ? receiptNo(enrollment.id) : "—"}</Txt>
        <Line k="Хөтөлбөр" v={enrollment?.programTitle ?? "—"} />
        <Line k="Элсэлт" v={enrollment?.intakeLabel ?? "—"} />
        <Line k="Нэр" v={enrollment?.name ?? "—"} />
        <Line k="Дүн" v={enrollment ? formatMnt(enrollment.amount) : "—"} />
        <Line k="Төлөв" v={paid ? "Төлөгдсөн" : enrollment?.payment === "none" ? "Төлбөргүй бүртгэл" : "Илгээсэн"} />
      </Glass>
      <PrimaryButton label="Миний элсэлт" onPress={() => nav.navigate("Main", { screen: "Mine" })} />
      <PrimaryButton label="Нүүр лүү" colors={[theme.ink, "#3A2A30"]} onPress={() => nav.navigate("Main", { screen: "Home" })} />
    </View>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.line}>
      <Txt tone="muted">{k}</Txt>
      <Txt style={{ flex: 1, textAlign: "right" }}>{v}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 22, justifyContent: "center", gap: 12 },
  receipt: { padding: 16, borderRadius: 22, gap: 6 },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});
