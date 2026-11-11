export const categoryMeta = {
  course: { label: "Сургалт", a: "#C81E24", b: "#E4575D", ink: "#3B1020" },
  scholarship: { label: "Тэтгэлэгт хөтөлбөр", a: "#0E9F8A", b: "#5EEAD4", ink: "#042E2A" },
  tour: { label: "Аялал", a: "#E09A2B", b: "#F6C56B", ink: "#3A2504" },
  quiz: { label: "Сорил", a: "#7C5CFF", b: "#C084FC", ink: "#1E1040" },
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
  bg: "#FFF6F1",
  bg2: "#F4EEFF",
  ink: "#1A1214",
  muted: "#6E6166",
  seal: "#C81E24",
  sealDeep: "#8E1218",
  gold: "#C9842A",
  line: "rgba(26,18,20,0.08)",
  glass: "rgba(255,255,255,0.62)",
  glassStrong: "rgba(255,255,255,0.82)",
  glassBorder: "rgba(255,255,255,0.92)",
  card: "rgba(255,255,255,0.78)",
  shadow: "rgba(120, 30, 50, 0.16)",
  good: "#0F9F6E",
  bad: "#D1243A",
  warn: "#C47B09",
  mesh: ["#FFE4EA", "#FFF4E0", "#E7FBF6"],
  blobs: ["rgba(255,92,122,0.45)", "rgba(245,165,36,0.38)", "rgba(124,92,255,0.28)"],
};

export const darkTheme: Theme = {
  name: "dark",
  bg: "#120C10",
  bg2: "#1A1030",
  ink: "#F8F1EA",
  muted: "#B7A8AE",
  seal: "#FF4D57",
  sealDeep: "#C81E24",
  gold: "#F0C36A",
  line: "rgba(255,241,234,0.1)",
  glass: "rgba(28,18,24,0.62)",
  glassStrong: "rgba(28,18,24,0.82)",
  glassBorder: "rgba(255,255,255,0.14)",
  card: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.45)",
  good: "#3DDC97",
  bad: "#FF6B7A",
  warn: "#FFC46B",
  mesh: ["#2A1018", "#241808", "#10241F"],
  blobs: ["rgba(200,30,36,0.55)", "rgba(245,165,36,0.28)", "rgba(124,92,255,0.4)"],
};
