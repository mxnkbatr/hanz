import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

/** Shares the one theme state from Layout with pages and sheets (Profile, menu). */
export const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeContext);

const KEY = "hanz-theme";
const BAR = { light: "#f5f5f7", dark: "#0a0a0c" } as const;

function stored(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * Light is the default; dark is an opt-in remembered per visitor.
 * Applies `.site` + `data-theme` on <html> while the public layout is mounted.
 */
export function useSiteTheme() {
  const [theme, setTheme] = useState<Theme>(stored);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("site");
    return () => {
      root.classList.remove("site");
      root.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", BAR[theme]);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode: theme just isn't remembered */
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return useMemo(() => ({ theme, toggle }), [theme, toggle]);
}
