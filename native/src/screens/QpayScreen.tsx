import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass, PrimaryButton, SandboxQr, Txt } from "../components/ui";
import type { PaymentState, QpayInvoice } from "../domain/types";
import { formatMnt } from "../lib/format";
import { hapticError, hapticSuccess } from "../lib/haptics";
import type { RootStackParamList } from "../navigation/types";
import { services } from "../services";
import { recallInvoice } from "../services/invoiceCache";
import { sandboxInvoice } from "../services/fixture";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

export function QpayScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Qpay">>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { enrollments, programs, setPayment, preview } = useApp();
  const { theme, type } = useTheme();
  const enrollment = enrollments.find((e) => e.id === route.params.enrollmentId);
  const [status, setStatus] = useState<PaymentState>(enrollment?.payment ?? "pending");
  const [note, setNote] = useState("");
  const [invoice, setInvoice] = useState<QpayInvoice | null>(null);

  useEffect(() => {
    if (!enrollment) return;
    const cached = recallInvoice(enrollment.id);
    if (cached && "unavailable" in cached) {
      setNote(cached.reason);
      setStatus("none");
      return;
    }
    if (cached && !("unavailable" in cached)) {
      setInvoice(cached);
      return;
    }
    const program = programs.find((p) => p.id === enrollment.programId);
    const plan = program?.plans.find((p) => p.id === enrollment.planId) ?? program?.plans[0];
    const intake = program?.intakes.find((i) => i.id === enrollment.intakeId) ?? program?.intakes[0];
    if (preview && program && plan && intake && plan.amount > 0) {
      setInvoice(
        sandboxInvoice({
          id: enrollment.id,
          name: enrollment.name,
          phone: enrollment.phone,
          email: enrollment.email,
          notes: enrollment.notes,
          program,
          intake,
          plan,
          documentsReady: [],
        }),
      );
    }
  }, [enrollment, preview, programs]);

  async function check() {
    if (!enrollment) return;
    const next = await services.payment.check(enrollment.id);
    setStatus(next);
    setPayment(enrollment.id, next, next === "paid" ? "paid" : next === "failed" ? "failed" : "submitted");
    if (next === "paid") {
      void hapticSuccess();
      nav.replace("Success", { enrollmentId: enrollment.id });
    }
    if (next === "failed") void hapticError();
  }

  async function settle(kind: "paid" | "failed") {
    if (!enrollment || !services.payment.sandboxSettle || !services.payment.sandboxFail) return;
    if (kind === "paid") await services.payment.sandboxSettle(enrollment.id);
    else await services.payment.sandboxFail(enrollment.id);
    await check();
  }

  if (!enrollment) {
    return (
      <View style={[styles.page, { backgroundColor: theme.bg, paddingTop: insets.top + 20 }]}>
        <Txt>Элсэлт олдсонгүй.</Txt>
      </View>
    );
  }

  const tone = status === "paid" ? theme.good : status === "failed" ? theme.bad : theme.warn;
  const label = status === "paid" ? "Төлөгдсөн" : status === "failed" ? "Амжилтгүй" : status === "none" ? "Нэхэмжлэхгүй" : "Хүлээгдэж буй";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={[styles.page, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <Pressable onPress={() => nav.goBack()}>
        <Txt tone="muted">Буцах</Txt>
      </Pressable>
      <Txt tone="label">Төлбөр</Txt>
      <Txt tone="display" style={{ fontSize: 34, lineHeight: 38 }}>
        QPay
      </Txt>
      <Glass style={styles.summary}>
        <Txt tone="muted">{enrollment.programTitle}</Txt>
        <Txt tone="title">{formatMnt(invoice?.amount ?? enrollment.amount)}</Txt>
        <Txt>{enrollment.planLabel}</Txt>
        <Txt tone="muted">{enrollment.intakeLabel}</Txt>
        <View style={[styles.pill, { backgroundColor: tone }]}>
          <Txt style={{ color: "#1A1214", fontFamily: type.bold }}>{label}</Txt>
        </View>
        {invoice?.sandbox ? <Txt tone="muted">Туршилтын нэхэмжлэх. Мөнгө шилжихгүй.</Txt> : null}
      </Glass>

      {invoice ? (
        <View style={styles.qrWrap}>
          {invoice.qrImage ? (
            <Image source={{ uri: `data:image/png;base64,${invoice.qrImage}` }} style={styles.qr} />
          ) : (
            <SandboxQr seed={invoice.invoiceId} />
          )}
          <Txt tone="muted" style={{ textAlign: "center" }}>
            {invoice.sandbox ? "Туршилтын дүрс. Банкны апп уншихгүй." : "Банкны аппаараа уншуулна уу."}
          </Txt>
        </View>
      ) : (
        <Glass style={styles.summary}>
          <Txt>{note || "QPay нэхэмжлэх бэлэн биш. Хүсэлт хадгалагдсан."}</Txt>
        </Glass>
      )}

      {invoice?.urls.length ? (
        <View style={{ gap: 8 }}>
          <Txt tone="title" style={{ fontSize: 18 }}>
            Банкны апп
          </Txt>
          {invoice.urls.map((u) => (
            <Pressable
              key={u.link}
              onPress={() => {
                void Linking.openURL(u.link).catch(() => setNote("Апп нээгдсэнгүй."));
              }}
              style={[styles.bank, { borderColor: theme.line, backgroundColor: theme.card }]}
            >
              <View style={[styles.logo, { backgroundColor: theme.seal }]}>
                <Txt style={{ color: "#fff", fontFamily: type.bold }}>{u.name.slice(0, 1)}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={{ fontFamily: type.bold }}>{u.name}</Txt>
                <Txt tone="muted">Апп нээх</Txt>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {invoice ? <PrimaryButton label="Төлбөр шалгах" onPress={() => void check()} /> : <PrimaryButton label="Хүсэлт хадгалсан" onPress={() => nav.replace("Success", { enrollmentId: enrollment.id })} />}

      {invoice?.sandbox ? (
        <View style={{ gap: 4, paddingTop: 4 }}>
          <Txt tone="label">Туршилтын касс</Txt>
          <Pressable onPress={() => void settle("paid")} style={styles.fail}>
            <Txt style={{ color: theme.ink, fontFamily: type.semi }}>Төлөгдсөн гэж шалгах</Txt>
          </Pressable>
          <Pressable onPress={() => void settle("failed")} style={styles.fail}>
            <Txt style={{ color: theme.muted, fontFamily: type.semi }}>Амжилтгүй гэж шалгах</Txt>
          </Pressable>
        </View>
      ) : null}
      {note ? <Txt tone="muted">{note}</Txt> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, gap: 12 },
  summary: { padding: 16, borderRadius: 22, gap: 4 },
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 6 },
  qrWrap: { alignItems: "center", gap: 8, paddingVertical: 8 },
  qr: { width: 220, height: 220, borderRadius: 16, backgroundColor: "#fff" },
  bank: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" },
  logo: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  fail: { alignItems: "center", padding: 8 },
});
