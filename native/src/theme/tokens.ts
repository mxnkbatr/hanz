export const categoryMeta = {
  course: { label: "Сургалт", a: "#C81E24", b: "#7A0C10", ink: "#1C1C1E" },
  scholarship: { label: "Тэтгэлэг", a: "#C81E24", b: "#7A0C10", ink: "#1C1C1E" },
  tour: { label: "Аялал", a: "#C81E24", b: "#7A0C10", ink: "#1C1C1E" },
  quiz: { label: "Сорил", a: "#C81E24", b: "#7A0C10", ink: "#1C1C1E" },
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
  bg: "#F5F5F7",
  bg2: "#F5F5F7",
  ink: "#1C1C1E",
  muted: "#8E8E93",
  seal: "#C81E24",
  sealDeep: "#7A0C10",
  line: "#E5E5EA",
  glass: "rgba(255,255,255,0.46)",
  glassStrong: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(255,255,255,0.7)",
  card: "rgba(255,255,255,0.55)",
  shadow: "rgba(0,0,0,0.08)",
  good: "#248A3D",
  bad: "#C81E24",
  warn: "#C47B1A",
  mesh: ["#F5F5F7", "#FFFFFF", "#F5F5F7"],
  blobs: ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)", "rgba(0,0,0,0.03)"],
};

export const darkTheme: Theme = {
  name: "dark",
  bg: "#0A0A0B",
  bg2: "#0A0A0B",
  ink: "#FFFFFF",
  muted: "#8E8E93",
  seal: "#C81E24",
  sealDeep: "#7A0C10",
  line: "#3A3A3C",
  glass: "rgba(17,17,17,0.45)",
  glassStrong: "rgba(17,17,17,0.72)",
  glassBorder: "rgba(255,255,255,0.16)",
  card: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.4)",
  good: "#3D9A62",
  bad: "#C81E24",
  warn: "#D4923A",
  mesh: ["#0A0A0B", "#0A0A0B", "#0A0A0B"],
  blobs: ["rgba(0,0,0,0)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.03)"],
};
