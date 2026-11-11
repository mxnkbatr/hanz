export const categoryMeta = {
  course: { label: "Сургалт", a: "#C81E24", b: "#7A0C10", ink: "#111111" },
  scholarship: { label: "Тэтгэлэг", a: "#D4A84B", b: "#D4A84B", ink: "#111111" },
  tour: { label: "Аялал", a: "#C81E24", b: "#7A0C10", ink: "#111111" },
  quiz: { label: "Сорил", a: "#D4A84B", b: "#D4A84B", ink: "#111111" },
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
  bg2: "#F7F7F7",
  ink: "#111111",
  muted: "#6B6B6B",
  seal: "#C81E24",
  sealDeep: "#7A0C10",
  gold: "#D4A84B",
  line: "rgba(17,17,17,0.1)",
  glass: "rgba(255,255,255,0.46)",
  glassStrong: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.7)",
  card: "rgba(255,255,255,0.55)",
  shadow: "rgba(0,0,0,0.08)",
  good: "#D4A84B",
  bad: "#C81E24",
  warn: "#D4A84B",
  mesh: ["#FFFFFF", "#F7F7F7", "#FFFFFF"],
  blobs: ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)", "rgba(0,0,0,0.03)"],
};

export const darkTheme: Theme = {
  name: "dark",
  bg: "#111111",
  bg2: "#111111",
  ink: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
  seal: "#C81E24",
  sealDeep: "#7A0C10",
  gold: "#D4A84B",
  line: "rgba(255,255,255,0.12)",
  glass: "rgba(17,17,17,0.45)",
  glassStrong: "rgba(17,17,17,0.72)",
  glassBorder: "rgba(255,255,255,0.16)",
  card: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.4)",
  good: "#D4A84B",
  bad: "#C81E24",
  warn: "#D4A84B",
  mesh: ["#111111", "#111111", "#111111"],
  blobs: ["rgba(0,0,0,0)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"],
};
