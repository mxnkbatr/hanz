import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass, Mesh, PrimaryButton, SealMark, Txt } from "../components/ui";
import { academy } from "../data/academy";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { services } from "../services";
import { useTabClearance } from "../navigation/inset";
import { useApp } from "../state/AppState";
import { useTheme } from "../theme/Theme";

type Nav = CompositeNavigationProp<BottomTabNavigationProp<TabParamList, "Profile">, NativeStackNavigationProp<RootStackParamList>>;

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { profile, setProfile, sessionEmail, signIn, signOut, preview, themeMode, setThemeMode, sourceLabel } = useApp();
  const { theme, type } = useTheme();
  const clearance = useTabClearance();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <Mesh>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: clearance + 24 }]}>
        <View style={styles.head}>
          <SealMark size={64} />
          <View style={{ flex: 1 }}>
            <Txt tone="title">{profile.name || "Зочин"}</Txt>
            <Txt tone="muted">{profile.phone || "Утсаар элсэнэ"}</Txt>
          </View>
        </View>
        <Txt tone="muted">
          {preview ? "Каталог урьдчилсан харагдацтай. Төлбөр туршилтын горимд." : sourceLabel}
          {sessionEmail ? ` Нэвтэрсэн: ${sessionEmail}` : " Элсэлт бүртгэлгүйгээр илгээнэ."}
        </Txt>

        <Txt tone="label">Өнгө</Txt>
        <View style={styles.row}>
          {(["light", "dark", "system"] as const).map((mode) => (
            <Pressable key={mode} onPress={() => setThemeMode(mode)} style={[styles.chip, { backgroundColor: themeMode === mode ? theme.ink : theme.card, borderColor: theme.line }]}>
              <Txt style={{ color: themeMode === mode ? theme.bg : theme.ink, fontFamily: type.semi }}>
                {mode === "light" ? "Гэгээ" : mode === "dark" ? "Харанхуй" : "Систем"}
              </Txt>
            </Pressable>
          ))}
        </View>

        <Glass style={styles.card}>
          <Txt tone="label">Холбоо</Txt>
          <Txt style={{ fontFamily: type.bold }}>{academy.phones.map((p) => p.display).join(" · ")}</Txt>
          <Txt>{academy.email}</Txt>
          <Txt tone="muted">{academy.address}</Txt>
          <PrimaryButton label="Академийн мэдээлэл" onPress={() => nav.navigate("Academy")} />
        </Glass>

        <Glass style={styles.card}>
          <Txt tone="label">Нэвтрэх</Txt>
          {services.auth.configured && !preview ? (
            sessionEmail ? (
              <PrimaryButton label="Гарах" onPress={() => void signOut()} colors={["#111111", "#111111"]} />
            ) : (
              <>
                <TextInput value={email} onChangeText={setEmail} placeholder="И-мэйл" placeholderTextColor={theme.muted} autoCapitalize="none" style={[styles.input, { color: theme.ink, borderColor: theme.line, fontFamily: type.body }]} />
                <TextInput value={password} onChangeText={setPassword} placeholder="Нууц үг" placeholderTextColor={theme.muted} secureTextEntry style={[styles.input, { color: theme.ink, borderColor: theme.line, fontFamily: type.body }]} />
                <PrimaryButton
                  label="Нэвтрэх"
                  onPress={() => {
                    void signIn(email, password).then((err) => setMsg(err ?? "Нэвтэрлээ"));
                  }}
                />
              </>
            )
          ) : (
            <Txt tone="muted">Supabase түлхүүргүй тул зочин горим. Элсэлт утас, и-мэйлээр хадгалагдана.</Txt>
          )}
          {msg ? <Txt tone="muted">{msg}</Txt> : null}
        </Glass>

        <Glass style={styles.card}>
          <Txt tone="label">Зочин профайл</Txt>
          <TextInput value={profile.name} onChangeText={(name) => setProfile({ ...profile, name })} placeholder="Нэр" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.line, fontFamily: type.body }]} />
          <TextInput value={profile.phone} onChangeText={(phone) => setProfile({ ...profile, phone })} placeholder="Утас" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.line, fontFamily: type.body }]} />
          <TextInput value={profile.email} onChangeText={(mail) => setProfile({ ...profile, email: mail })} placeholder="И-мэйл" placeholderTextColor={theme.muted} autoCapitalize="none" style={[styles.input, { color: theme.ink, borderColor: theme.line, fontFamily: type.body }]} />
        </Glass>
      </ScrollView>
    </Mesh>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 140, gap: 12 },
  head: { flexDirection: "row", gap: 12, alignItems: "center" },
  row: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 12, height: 36, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  card: { padding: 14, borderRadius: 22, gap: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, height: 48, fontSize: 15 },
});
