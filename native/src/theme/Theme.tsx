import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import {
  NotoSansSC_500Medium,
  NotoSansSC_700Bold,
  useFonts as useScFonts,
} from "@expo-google-fonts/noto-sans-sc";
import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  Onest_800ExtraBold,
  useFonts as useOnest,
} from "@expo-google-fonts/onest";
import { darkTheme, lightTheme, type Theme, type ThemeName } from "./tokens";

type Mode = ThemeName | "system";

type Ctx = {
  theme: Theme;
  mode: Mode;
  setMode: (mode: Mode) => void;
  fontsReady: boolean;
  type: {
    body: string | undefined;
    medium: string | undefined;
    semi: string | undefined;
    bold: string | undefined;
    display: string | undefined;
    zh: string | undefined;
  };
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({
  children,
  initialMode = "system",
}: {
  children: ReactNode;
  initialMode?: Mode;
}) {
  const scheme = useColorScheme();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [onestLoaded] = useOnest({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    Onest_800ExtraBold,
  });
  const [scLoaded] = useScFonts({ NotoSansSC_500Medium, NotoSansSC_700Bold });
  const fontsReady = Boolean(onestLoaded && scLoaded);
  const name: ThemeName = mode === "system" ? (scheme === "dark" ? "dark" : "light") : mode;
  const theme = name === "dark" ? darkTheme : lightTheme;

  const type = useMemo(
    () => ({
      body: fontsReady ? "Onest_400Regular" : undefined,
      medium: fontsReady ? "Onest_500Medium" : undefined,
      semi: fontsReady ? "Onest_600SemiBold" : undefined,
      bold: fontsReady ? "Onest_700Bold" : undefined,
      display: fontsReady ? "Onest_800ExtraBold" : undefined,
      zh: fontsReady ? "NotoSansSC_700Bold" : undefined,
    }),
    [fontsReady],
  );

  const value = useMemo(() => ({ theme, mode, setMode, fontsReady, type }), [theme, mode, fontsReady, type]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme");
  return ctx;
}

export function useSetThemeFromStore(mode: Mode | null) {
  const { setMode } = useTheme();
  const apply = useCallback(
    (next: Mode) => {
      setMode(next);
    },
    [setMode],
  );
  useEffect(() => {
    if (mode) apply(mode);
  }, [mode, apply]);
}
