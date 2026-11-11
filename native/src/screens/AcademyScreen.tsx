import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass, Mesh, Txt } from "../components/ui";
import { academy } from "../data/academy";
import { useReduceMotion } from "../lib/motion";
import { useTheme } from "../theme/Theme";

export function AcademyScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, type } = useTheme();
  return (
    <Mesh>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => nav.goBack()}>
          <Txt tone="muted">Буцах</Txt>
        </Pressable>
        <Txt tone="label">{academy.legal}</Txt>
        <Txt tone="display" style={{ fontSize: 36, lineHeight: 40 }}>
          {academy.brand}
        </Txt>
        <Txt>{academy.about}</Txt>
        <Txt tone="muted">{academy.scg}</Txt>
        <Txt tone="muted">{academy.polandNote}</Txt>
        <View style={styles.stats}>
          <Stat value={academy.graduatesValue} suffix="+" label="суралцагч" />
          <Stat value={academy.scholarshipValue} suffix="+" label="тэтгэлэг" />
          <Stat value={Number(academy.years)} suffix="" label="жил" />
          <Stat value={academy.partnersValue} suffix="+" label="их сургууль" />
          <Stat value={70} suffix="+" label="коллеж" />
          <Stat value={250} suffix="+" label="Тяньжин" />
          <Stat value={35} suffix="" label="Польш, эрх" />
          <Stat value={academy.branches.length} suffix="" label="салбар" />
        </View>
        <Glass style={styles.card}>
          <Txt tone="label">Хаяг</Txt>
          <Txt>{academy.address}</Txt>
          <Txt tone="muted">{academy.hours}</Txt>
          <Pressable onPress={() => void Linking.openURL(academy.map)}>
            <Txt style={{ color: theme.seal, fontFamily: type.bold }}>Газрын зураг</Txt>
          </Pressable>
        </Glass>
        <Glass style={styles.card}>
          <Txt tone="label">Утас · и-мэйл</Txt>
          {academy.phones.map((p) => (
            <Pressable key={p.raw} onPress={() => void Linking.openURL(`tel:${p.raw}`)}>
              <Txt style={{ fontFamily: type.bold, fontSize: 18 }}>{p.display}</Txt>
            </Pressable>
          ))}
          <Pressable onPress={() => void Linking.openURL(`mailto:${academy.email}`)}>
            <Txt>{academy.email}</Txt>
          </Pressable>
          <Pressable onPress={() => void Linking.openURL(academy.facebook)}>
            <Txt tone="muted">Facebook</Txt>
          </Pressable>
          <Pressable onPress={() => void Linking.openURL(academy.instagram)}>
            <Txt tone="muted">Instagram</Txt>
          </Pressable>
        </Glass>
        {academy.branches.map((b) => (
          <View key={b.id} style={[styles.branch, { borderColor: theme.line }]}>
            <Txt style={{ fontFamily: type.bold }}>{b.title}</Txt>
            <Txt tone="muted">{b.address}</Txt>
            <Txt tone="muted">{b.phones.join(" · ")}</Txt>
          </View>
        ))}
      </ScrollView>
    </Mesh>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { theme, type } = useTheme();
  const reduce = useReduceMotion();
  const n = useSharedValue(0);
  useEffect(() => {
    n.value = withTiming(value, { duration: reduce ? 0 : 900 });
  }, [n, reduce, value]);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 900);
      setShown(Math.round(value * t));
      if (t >= 1) clearInterval(timer);
    }, 32);
    return () => clearInterval(timer);
  }, [reduce, value]);
  const hidden = useAnimatedStyle(() => ({ opacity: 1 }));
  return (
    <Animated.View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.line }, hidden]}>
      <Txt style={{ fontFamily: type.display, fontSize: 22, color: theme.seal }}>
        {shown}
        {suffix}
      </Txt>
      <Txt tone="muted">{label}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40, gap: 12 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: { width: "48%", borderWidth: 1, borderRadius: 18, padding: 12 },
  card: { padding: 14, borderRadius: 22, gap: 6 },
  branch: { borderTopWidth: 1, paddingTop: 10, gap: 2 },
});
