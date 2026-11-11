import { Pressable, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass, Icon, Txt } from "../components/ui";
import { hapticSelect } from "../lib/haptics";
import { CatalogScreen } from "../screens/CatalogScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MineScreen } from "../screens/MineScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { QuizHomeScreen } from "../screens/QuizHomeScreen";
import { useTheme } from "../theme/Theme";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const icons = ["home", "search", "quiz", "ticket", "user"] as const;
const labels = ["Нүүр", "Хайх", "Сорил", "Элсэлт", "Би"];

export function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="Quiz" component={QuizHomeScreen} />
      <Tab.Screen name="Mine" component={MineScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function GlassTabBar({ state, navigation }: { state: { index: number; routes: { key: string; name: string }[] }; navigation: { navigate: (name: string) => void } }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const index = useSharedValue(state.index);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    index.value = withSpring(state.index, { damping: 16, stiffness: 220 });
  }, [index, state.index]);
  const inner = Math.max(0, width - 8);
  const slot = inner / Math.max(1, state.routes.length);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: index.value * slot }] }));
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Glass style={styles.bar} intensity={40}>
        <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 ? <Animated.View style={[styles.pill, { width: slot - 6, backgroundColor: theme.name === "dark" ? "rgba(255,255,255,0.1)" : "rgba(200,30,36,0.12)" }, pill]} /> : null}
          {state.routes.map((route, i) => {
            const focused = state.index === i;
            return (
              <Pressable
                key={route.key}
                style={styles.item}
                onPress={() => {
                  void hapticSelect();
                  navigation.navigate(route.name);
                }}
              >
                <TabGlyph name={icons[i] ?? "home"} color={focused ? theme.seal : theme.muted} focused={focused} />
                <Txt style={{ fontSize: 10, color: focused ? theme.seal : theme.muted }}>{labels[i]}</Txt>
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </View>
  );
}

function TabGlyph({ name, color, focused }: { name: (typeof icons)[number]; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const turn = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.16 : 1, { damping: 12, stiffness: 240 });
    turn.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 180 });
  }, [focused, scale, turn]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${(1 - turn.value) * -8}deg` }, { translateY: (1 - turn.value) * 1 }],
  }));
  return (
    <Animated.View style={style}>
      <Icon name={name} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14 },
  bar: { flexDirection: "row", borderRadius: 28, paddingVertical: 6, paddingHorizontal: 4 },
  item: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 4, zIndex: 1 },
  track: { flexDirection: "row", width: "100%", minHeight: 52 },
  pill: { position: "absolute", left: 3, top: 4, bottom: 4, borderRadius: 22 },
});
