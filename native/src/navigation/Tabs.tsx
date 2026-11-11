import { Pressable, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect } from "react";
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
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Glass style={styles.bar} intensity={40}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={() => {
                void hapticSelect();
                navigation.navigate(route.name);
              }}
            >
              <TabGlyph name={icons[index] ?? "home"} color={focused ? theme.seal : theme.muted} focused={focused} />
              <Txt style={{ fontSize: 10, color: focused ? theme.seal : theme.muted }}>{labels[index]}</Txt>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

function TabGlyph({ name, color, focused }: { name: (typeof icons)[number]; color: string; focused: boolean }) {
  const scale = useSharedValue(focused ? 1 : 0.92);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 220 });
  }, [focused, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateY: focused ? -2 : 0 }] }));
  return (
    <Animated.View style={style}>
      <Icon name={name} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14 },
  bar: { flexDirection: "row", borderRadius: 28, paddingVertical: 6, paddingHorizontal: 4 },
  item: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 4 },
});
