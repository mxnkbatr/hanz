export const categoryMeta = {
  course: { label: "Сургалт", a: "#C81E24", b: "#E8A0A3", ink: "#3B1020" },
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
  bg: "#F3F3F5",
  bg2: "#EFEFF2",
  ink: "#1C1C1E",
  muted: "#8A8A8E",
  seal: "#C81E24",
  sealDeep: "#9E1820",
  gold: "#C4842A",
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
  blobs: ["rgba(200,30,36,0.07)", "rgba(160,160,170,0.16)", "rgba(120,130,160,0.08)"],
};

export const darkTheme: Theme = {
  name: "dark",
  bg: "#000000",
  bg2: "#0C0C0E",
  ink: "#F5F5F7",
  muted: "#98989F",
  seal: "#E85A5F",
  sealDeep: "#C81E24",
  gold: "#E0B15A",
  line: "rgba(255,255,255,0.1)",
  glass: "rgba(28,28,30,0.45)",
  glassStrong: "rgba(28,28,30,0.72)",
  glassBorder: "rgba(255,255,255,0.16)",
  card: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.4)",
  good: "#3DDC97",
  bad: "#FF8A8E",
  warn: "#E0B15A",
  mesh: ["#050506", "#0A0A0C", "#08080A"],
  blobs: ["rgba(200,30,36,0.12)", "rgba(80,80,90,0.2)", "rgba(70,80,120,0.12)"],
};
