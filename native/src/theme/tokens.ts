export const categoryMeta = {
  course: { label: "Сургалт", a: "#A3141A", b: "#7A0C10", ink: "#3B1020" },
  scholarship: { label: "Тэтгэлэгт хөтөлбөр", a: "#1A8F7A", b: "#B7E4DA", ink: "#042E2A" },
  tour: { label: "Аялал", a: "#C4842A", b: "#F0D7B0", ink: "#3A2504" },
  quiz: { label: "Сорил", a: "#6E59E6", b: "#D4CCF8", ink: "#1E1040" },
} as const;

export type ThemeName = "light" | "dark";

export type Theme = {
  name: ThemeName;
  bg: string;
  bg2: string;
  ink: string;
  muted: string;
  seal: string;
  sealDeep: string;
  gold: string;
  line: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  card: string;
  shadow: string;
  good: string;
  bad: string;
  warn: string;
  mesh: [string, string, string];
  blobs: [string, string, string];
};

export const lightTheme: Theme = {
  name: "light",
  bg: "#FFFFFF",
  bg2: "#EFEFF2",
  ink: "#1C1C1E",
  muted: "#8A8A8E",
  seal: "#C81E24",
  sealDeep: "#7A0C10",
  gold: "#D4A84B",
  line: "rgba(28,28,30,0.08)",
  glass: "rgba(255,255,255,0.46)",
  glassStrong: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.7)",
  card: "rgba(255,255,255,0.55)",
  shadow: "rgba(0,0,0,0.08)",
  good: "#1F8A5B",
  bad: "#C81E24",
  warn: "#C4842A",
  mesh: ["#F6F6F8", "#F3F2F4", "#F4F3F6"],
  blobs: ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)", "rgba(0,0,0,0.03)"],
};

export const darkTheme: Theme = {
  name: "dark",
  bg: "#000000",
  bg2: "#0C0C0E",
  ink: "#F5F5F7",
  muted: "#98989F",
  seal: "#C81E24",
  sealDeep: "#7A0C10",
  gold: "#D4A84B",
  line: "rgba(255,255,255,0.1)",
  glass: "rgba(28,28,30,0.45)",
  glassStrong: "rgba(28,28,30,0.72)",
  glassBorder: "rgba(255,255,255,0.16)",
  card: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.4)",
  good: "#3DDC97",
  bad: "#C81E24",
  warn: "#E0B15A",
  mesh: ["#050506", "#0A0A0C", "#08080A"],
  blobs: ["rgba(0,0,0,0)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"],
};
