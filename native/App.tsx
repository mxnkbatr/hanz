import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNav } from "./src/navigation/Root";
import { AppStateProvider } from "./src/state/AppState";
import { ThemeProvider, useTheme } from "./src/theme/Theme";

function bootTheme(): "light" | "dark" | "system" {
  if (Platform.OS !== "web" || typeof window === "undefined") return "system";
  const theme = new URLSearchParams(window.location.search).get("theme");
  if (theme === "light" || theme === "dark") return theme;
  return "system";
}

function Shell() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
      <AppStateProvider>
        <RootNav />
      </AppStateProvider>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider initialMode={bootTheme()}>
          <Shell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
