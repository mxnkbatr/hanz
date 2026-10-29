/** Shared admin navigation + CMS hub groups (dark / mobile friendly). */

export type AdminNavItem = {
  id: string;
  to: string;
  key: string;
  ico: string;
  /** Public preview path */
  preview?: string;
  /** Opens create flow on collection pages */
  canAdd?: boolean;
  end?: boolean;
};

export const ADMIN_MAIN: AdminNavItem[] = [
  { id: "dash", to: "/admin", key: "admin_dash", ico: "▣", end: true },
  { id: "leads", to: "/admin/leads", key: "admin_leads", ico: "☎" },
  { id: "pages", to: "/admin/pages", key: "admin_cms", ico: "▦" },
  { id: "settings", to: "/admin/settings", key: "admin_settings", ico: "⚙" },
  { id: "staff", to: "/admin/staff", key: "admin_staff", ico: "人" },
];

export const ADMIN_TABBAR: AdminNavItem[] = [
  { id: "dash", to: "/admin", key: "admin_dash", ico: "▣", end: true },
  { id: "leads", to: "/admin/leads", key: "admin_leads", ico: "☎" },
  { id: "pages", to: "/admin/pages", key: "admin_cms", ico: "▦" },
  { id: "settings", to: "/admin/settings", key: "admin_settings", ico: "⚙" },
];

export type AdminHubGroup = {
  id: string;
  titleKey: string;
  hintKey: string;
  items: AdminNavItem[];
};

/** Grouped so staff know where to edit — content / site / tools */
export const ADMIN_HUB_GROUPS: AdminHubGroup[] = [
  {
    id: "content",
    titleKey: "admin_group_content",
    hintKey: "admin_group_content_d",
    items: [
      {
        id: "news",
        to: "/admin/news",
        key: "nav_news",
        ico: "新",
        preview: "/medee",
        canAdd: true,
      },
      {
        id: "products",
        to: "/admin/products",
        key: "nav_shop",
        ico: "店",
        preview: "/shop",
        canAdd: true,
      },
      {
        id: "courses",
        to: "/admin/courses",
        key: "nav_courses",
        ico: "汉",
        preview: "/courses",
        canAdd: true,
      },
      {
        id: "travel",
        to: "/admin/travel",
        key: "nav_travel",
        ico: "✈",
        preview: "/travel",
        canAdd: true,
      },
      {
        id: "universities",
        to: "/admin/universities",
        key: "nav_uni",
        ico: "学",
        preview: "/university",
        canAdd: true,
      },
      {
        id: "team",
        to: "/admin/team",
        key: "admin_team",
        ico: "师",
        preview: "/about",
      },
      {
        id: "kids",
        to: "/admin/kids",
        key: "admin_kids",
        ico: "童",
        preview: "/courses/kids",
      },
      {
        id: "quiz",
        to: "/admin/quiz",
        key: "admin_quiz",
        ico: "测",
        preview: "/quiz",
        canAdd: true,
      },
      {
        id: "translation",
        to: "/admin/translation",
        key: "admin_translation",
        ico: "译",
        preview: "/translation",
      },
    ],
  },
  {
    id: "site",
    titleKey: "admin_group_site",
    hintKey: "admin_group_site_d",
    items: [
      {
        id: "settings",
        to: "/admin/settings",
        key: "admin_settings",
        ico: "⚙",
        preview: "/contact",
      },
      {
        id: "branches",
        to: "/admin/branches",
        key: "admin_branches",
        ico: "址",
        preview: "/about",
        canAdd: true,
      },
      {
        id: "windows",
        to: "/admin/windows",
        key: "admin_windows",
        ico: "日",
        preview: "/travel",
      },
      {
        id: "about",
        to: "/admin/pages/about",
        key: "nav_about",
        ico: "院",
        preview: "/about",
      },
      {
        id: "contact",
        to: "/admin/pages/contact",
        key: "nav_contact",
        ico: "☎",
        preview: "/contact",
      },
      {
        id: "home",
        to: "/admin/pages/home",
        key: "nav_home",
        ico: "汉",
        preview: "/",
      },
    ],
  },
  {
    id: "tools",
    titleKey: "admin_group_tools",
    hintKey: "admin_group_tools_d",
    items: [
      {
        id: "media",
        to: "/admin/media",
        key: "admin_media",
        ico: "图",
        canAdd: true,
      },
      {
        id: "leads",
        to: "/admin/leads",
        key: "admin_leads",
        ico: "☎",
      },
      {
        id: "staff",
        to: "/admin/staff",
        key: "admin_staff",
        ico: "人",
        canAdd: true,
      },
    ],
  },
];

/** Flat CMS sidebar links (content editors) */
export const ADMIN_CMS_SIDE: AdminNavItem[] = ADMIN_HUB_GROUPS.flatMap(
  (g) => g.items,
).filter(
  (item, i, arr) =>
    arr.findIndex((x) => x.to === item.to) === i &&
    !["/admin/settings", "/admin/leads", "/admin/staff"].includes(item.to),
);

export const ADMIN_QUICK_ADD: AdminNavItem[] = ADMIN_HUB_GROUPS.flatMap((g) =>
  g.items.filter((i) => i.canAdd),
).slice(0, 6);

export function isAdminCmsPath(pathname: string) {
  if (pathname.startsWith("/admin/pages")) return true;
  return ADMIN_CMS_SIDE.some(
    (n) => pathname === n.to || pathname.startsWith(`${n.to}/`),
  );
}
