import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass, PrimaryButton, Txt } from "../components/ui";
import { formatRange, priceLabel, uid } from "../lib/format";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

const DOCS = ["Гадаад паспорт", "Цээж зураг", "HSK гэрчилгээ (байвал)"];

export function EnrollScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Enroll">>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { programs, profile, submitEnrollment } = useApp();
  const { theme, type } = useTheme();
  const program = programs.find((p) => p.id === route.params.id);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [notes, setNotes] = useState("");
  const [intakeId, setIntakeId] = useState(program?.intakes[0]?.id ?? "");
  const [planId, setPlanId] = useState(route.params.planId ?? program?.plans[0]?.id ?? "");
  const [docs, setDocs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const intake = program?.intakes.find((i) => i.id === intakeId) ?? program?.intakes[0];
  const plan = program?.plans.find((p) => p.id === planId) ?? program?.plans[0];
  const colors = program ? ([categoryMeta[program.category].a, categoryMeta[program.category].b] as [string, string]) : undefined;

  const phoneOk = useMemo(() => phone.replace(/\D/g, "").length >= 8, [phone]);
  const emailOk = email.includes("@") && email.includes(".");

  if (!program || !intake || !plan) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: theme.bg }}>
        <Txt>Хөтөлбөр олдсонгүй.</Txt>
      </View>
    );
  }

  function next() {
    setError("");
    if (step === 0) {
      if (name.trim().length < 2) return setError("Нэрээ бүтэн бичнэ үү.");
      if (!phoneOk) return setError("Утасны дугаар 8 оронтой байна.");
      if (!emailOk) return setError("И-мэйл хаягаа шалгана уу.");
    }
    if (step < 3) setStep((s) => s + 1);
  }

  async function send() {
    if (!program || !intake || !plan) return;
    setBusy(true);
    setError("");
    try {
      const draft = {
        id: uid(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        program,
        intake,
        plan,
        documentsReady: docs,
      };
      const { enrollment, invoice } = await submitEnrollment(draft);
      if ("unavailable" in invoice) nav.replace("Success", { enrollmentId: enrollment.id });
      else nav.replace("Qpay", { enrollmentId: enrollment.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Илгээж чадсангүй.");
    } finally {
      setBusy(false);
    }
  }

  const titles = ["Таны мэдээлэл", "Элсэлт сонгох", "Материал", "Шалгах"];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => (step === 0 ? nav.goBack() : setStep((s) => s - 1))}>
          <Txt tone="muted">Буцах</Txt>
        </Pressable>
        <Txt tone="label">
          Алхам {step + 1} / 4 · {program.title}
        </Txt>
        <Txt tone="display" style={{ fontSize: 32, lineHeight: 36 }}>
          {titles[step]}
        </Txt>
        <View style={styles.steps}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.step, { backgroundColor: i <= step ? theme.seal : theme.line, flex: i === step ? 2 : 1 }]} />
          ))}
        </View>

        {step === 0 ? (
          <View style={{ gap: 10 }}>
            <Field label="Нэр" value={name} onChange={setName} placeholder="Овог нэр" />
            <Field label="Утас" value={phone} onChange={setPhone} placeholder="99112233" keyboard="phone-pad" />
            <Field label="И-мэйл" value={email} onChange={setEmail} placeholder="name@mail.com" keyboard="email-address" />
            <Field label="Тэмдэглэл" value={notes} onChange={setNotes} placeholder="Түвшин, асуулт…" multiline />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 10 }}>
            {program.plans.map((p) => (
              <Pressable key={p.id} onPress={() => setPlanId(p.id)} style={[styles.choice, { borderColor: plan.id === p.id ? theme.seal : theme.line, backgroundColor: theme.card }]}>
                <Txt style={{ fontFamily: type.bold }}>{p.label}</Txt>
                <Txt>{priceLabel(program, p)}</Txt>
              </Pressable>
            ))}
            {program.intakes.map((i) => (
              <Pressable key={i.id} onPress={() => setIntakeId(i.id)} style={[styles.choice, { borderColor: intake.id === i.id ? theme.seal : theme.line, backgroundColor: theme.card }]}>
                <Txt style={{ fontFamily: type.bold }}>{i.label}</Txt>
                <Txt tone="muted">
                  {formatRange(i.start, i.end)} · {i.seats} суудал
                </Txt>
                <Txt tone="muted">{i.schedule}</Txt>
              </Pressable>
            ))}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 10 }}>
            <Txt tone="muted">Файл серверт хадгалагдахгүй. Бэлэн эсэхээ тэмдэглэнэ — энэ алхам загвар.</Txt>
            {DOCS.map((doc) => {
              const on = docs.includes(doc);
              return (
                <Pressable
                  key={doc}
                  onPress={() => setDocs((prev) => (on ? prev.filter((d) => d !== doc) : [...prev, doc]))}
                  style={[styles.doc, { borderColor: on ? theme.seal : theme.line }]}
                >
                  <Txt style={{ fontFamily: type.bold }}>{on ? "Бэлэн" : "Хавсаргах"}</Txt>
                  <Txt>{doc}</Txt>
                  <Txt tone="muted">Файл сонгох товч дараагийн хувилбарт холбогдоно.</Txt>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 3 ? (
          <Glass style={styles.review}>
            <Row k="Нэр" v={name} />
            <Row k="Утас" v={phone} />
            <Row k="И-мэйл" v={email} />
            <Row k="Хөтөлбөр" v={program.title} />
            <Row k="Элсэлт" v={intake.label} />
            <Row k="Төлбөр" v={priceLabel(program, plan)} />
            <Row k="Материал" v={docs.length ? docs.join(", ") : "Тэмдэглээгүй"} />
            {notes ? <Row k="Тэмдэглэл" v={notes} /> : null}
          </Glass>
        ) : null}

        {error ? <Txt style={{ color: theme.bad }}>{error}</Txt> : null}
      </ScrollView>
      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.bg }]}>
        {step < 3 ? (
          <PrimaryButton label="Үргэлжлүүлэх" colors={colors} onPress={next} />
        ) : (
          <PrimaryButton label={busy ? "Илгээж байна…" : plan.amount > 0 ? "QPay руу" : "Хүсэлт илгээх"} colors={colors} disabled={busy} onPress={() => void send()} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboard?: "phone-pad" | "email-address";
  multiline?: boolean;
}) {
  const { theme, type } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Txt tone="label">{label}</Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboard}
        autoCapitalize={keyboard === "email-address" ? "none" : "words"}
        multiline={multiline}
        style={[
          styles.input,
          { color: theme.ink, borderColor: theme.line, backgroundColor: theme.card, fontFamily: type.body, minHeight: multiline ? 90 : 52 },
        ]}
      />
    </View>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ gap: 2, marginBottom: 8 }}>
      <Txt tone="label">{k}</Txt>
      <Txt>{v}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 120, gap: 12 },
  steps: { flexDirection: "row", gap: 6, height: 6 },
  step: { borderRadius: 99 },
  choice: { borderWidth: 1.5, borderRadius: 18, padding: 14, gap: 2 },
  doc: { borderWidth: 1.5, borderStyle: "dashed", borderRadius: 18, padding: 14, gap: 4 },
  review: { padding: 16, borderRadius: 22 },
  input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, fontSize: 16 },
  dock: { padding: 16 },
});
