import { Pressable, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass, Icon, Txt } from "../components/ui";
import { hapticSelect } from "../lib/haptics";
import { useScrollY } from "./scroll";
import { CatalogScreen } from "../screens/CatalogScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MineScreen } from "../screens/MineScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { QuizHomeScreen } from "../screens/QuizHomeScreen";
import { useTheme } from "../theme/Theme";
import { ScrollYProvider } from "./scroll";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const icons = ["home", "search", "quiz", "ticket", "user"] as const;
const labels = ["Нүүр", "Хайх", "Сорил", "Элсэлт", "Би"];

export function Tabs() {
  const y = useSharedValue(0);
  return (
    <ScrollYProvider value={y}>
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="Quiz" component={QuizHomeScreen} />
      <Tab.Screen name="Mine" component={MineScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
    </ScrollYProvider>
  );
}

function GlassTabBar({ state, navigation }: { state: { index: number; routes: { key: string; name: string }[] }; navigation: { navigate: (name: string) => void } }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const y = useScrollY();
  const index = useSharedValue(state.index);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    index.value = withSpring(state.index, { damping: 18, stiffness: 220 });
  }, [index, state.index]);
  const shell = useAnimatedStyle(() => {
    const t = y ? interpolate(y.value, [0, 48], [0, 1], Extrapolation.CLAMP) : 0;
    return { transform: [{ scale: 1 - t * 0.06 }] };
  });
  const inner = Math.max(0, width - 8);
  const slot = inner / Math.max(1, state.routes.length);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: index.value * slot }] }));
  const idle = theme.name === "dark" ? "#E5E5EA" : "#1C1C1E";
  return (
    <Animated.View style={[styles.wrap, { bottom: Math.max(insets.bottom, 16) }, shell]} pointerEvents="box-none">
      <Glass style={styles.bar} intensity={70} tint="bar">
        <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 ? <Animated.View style={[styles.pill, { width: slot - 6 }, pill]} /> : null}
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
                <Icon name={icons[i] ?? "home"} color={focused ? "#FFFFFF" : idle} size={20} />
                <Txt style={{ fontSize: 11, lineHeight: 14, color: focused ? "#FFFFFF" : idle }}>{labels[i]}</Txt>
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 20, right: 20 },
  bar: { flexDirection: "row", borderRadius: 28, paddingVertical: 6, paddingHorizontal: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)" },
  item: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 6, zIndex: 1 },
  track: { flexDirection: "row", width: "100%", minHeight: 52 },
  pill: { position: "absolute", left: 3, top: 4, bottom: 4, borderRadius: 22, backgroundColor: "#C81E24" },
});
