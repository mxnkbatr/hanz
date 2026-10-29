import {
  academy,
  branchesMeta,
  coursesMeta,
  newsIds,
  shopProductsMeta,
  travelPackagesMeta,
  chinaProgramsMeta,
  universitiesMeta,
  kidsTeachers,
  kidsLevels,
  kidsSchedules,
  teachersMeta,
} from "../data/content";
import { quizQuestions as defaultQuizQuestions } from "../data/quiz";
import type { CmsRow } from "./cmsApi";
import type { I18nText } from "./i18nText";

/** Admission pipeline; "done" is kept for leads from before enrollments-v2.sql. */
export type LeadStatus =
  | "new"
  | "contacted"
  | "placed"
  | "paid"
  | "enrolled"
  | "declined"
  | "done"
  | "spam";

export type EnrollmentRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  phone: string;
  kind: "course" | "travel" | "consult";
  interest: string;
  child_age: string | null;
  message: string | null;
  status: LeadStatus;
  admin_note: string | null;
  /** enrollments-v2.sql columns (absent on older rows). */
  hsk_level?: string | null;
  schedule?: string | null;
  plan?: string | null;
  plan_price?: number | null;
  child_name?: string | null;
};

export type ProductOverride = {
  price?: number;
  inStock?: boolean;
  hidden?: boolean;
  image?: string;
  href?: string;
};

export type NewsOverride = {
  date?: string;
  image?: string;
  hidden?: boolean;
};

export type SiteSettings = Partial<{
  phone: string[];
  phoneRaw: string[];
  email: string;
  facebook: string;
  instagram: string;
  messenger: string;
  shopUrl: string;
  address: string;
  whatsapp: string;
  hours: string;
  registerUrl: string;
  graduates: string;
  scholarshipStudents: string;
  partnerUniversities: string;
  branchCount: string;
}>;

export type BranchCms = {
  id: string;
  title: I18nText;
  address: I18nText;
  phones: string[];
  phoneDisplay: string[];
  /** fallback i18n keys when title/address empty */
  titleKey?: string;
  addrKey?: string;
};

export type EnrollWindowCms = {
  id: string;
  labelKey: string;
  dateKey: string;
  status: "open" | "soon" | "closed";
};

export type TranslationFeatureCms = {
  id: string;
  ico: string;
  title: I18nText;
  body: I18nText;
};

/** A member of the adult-program team (About page, course pages). */
export type TeamMemberCms = {
  id: string;
  name: I18nText;
  role: I18nText;
  level: I18nText;
  bio: I18nText;
  hsk: number[];
  photo: string;
  nameKey?: string;
  roleKey?: string;
  levelKey?: string;
};

export type KidsTeacherCms = {
  id: string;
  name: I18nText;
  photo: string;
  nameKey?: string;
};

export type KidsLevelCms = {
  id: string;
  label: I18nText;
  age: I18nText;
  desc: I18nText;
  mark: string;
  teacherIds: string[];
  labelKey?: string;
  ageKey?: string;
  descKey?: string;
};

export type KidsScheduleCms = {
  id: string;
  label: I18nText;
  meta: I18nText;
  dayGroup: "weekday" | "weekend";
  time: string;
  days: I18nText;
  labelKey?: string;
  metaKey?: string;
  daysKey?: string;
};

export type QuizQuestionCms = {
  id: string;
  level: "hsk1" | "hsk2" | "hsk3";
  kind: "meaning" | "pinyin";
  hanzi: string;
  pinyin: string;
  options: I18nText[];
  correct: number;
};

export type SiteBundle = {
  settings?: SiteSettings;
  products?: Record<string, ProductOverride>;
  news?: Record<string, NewsOverride>;
  hiddenCourses?: string[];
  hiddenTravel?: string[];
  hiddenUniversity?: string[];
  notes?: Record<string, string>;
  branches?: BranchCms[];
  enrollWindows?: {
    travel?: Record<string, EnrollWindowCms[]>;
    university?: Record<string, EnrollWindowCms[]>;
  };
  translationFeatures?: TranslationFeatureCms[];
  team?: TeamMemberCms[];
  kidsTeachers?: KidsTeacherCms[];
  kidsLevels?: KidsLevelCms[];
  kidsSchedules?: KidsScheduleCms[];
  quizQuestions?: QuizQuestionCms[];
};

export const emptyBundle = (): SiteBundle => ({
  settings: {},
  products: {},
  news: {},
  hiddenCourses: [],
  hiddenTravel: [],
  hiddenUniversity: [],
  notes: {},
  branches: [],
  enrollWindows: {},
  translationFeatures: [],
  team: [],
  kidsTeachers: [],
  kidsLevels: [],
  kidsSchedules: [],
  quizQuestions: [],
});

/** Unified live item — DB localized fields + optional i18n key fallbacks. */
export type NewsLive = {
  id: string;
  date: string;
  tagKey: string;
  titleKey?: string;
  excerptKey?: string;
  bodyKey?: string;
  title?: I18nText;
  excerpt?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  image: string;
  href?: string;
  fromDb?: boolean;
};

export type ProductLive = {
  id: string;
  titleKey?: string;
  descKey?: string;
  bodyKey?: string;
  unitKey?: string;
  tagKey?: string;
  cat?: "porcelain" | "books" | string;
  title?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  price: number;
  inStock: boolean;
  image: string;
  href?: string;
  specs?: readonly string[];
  fromDb?: boolean;
};

export type CourseLive = {
  id: string;
  titleKey: string;
  descKey: string;
  tagKey: string;
  unitKey: string;
  filter: string;
  image: string;
  highlights?: readonly string[];
  /** Team member ids who teach this course. */
  teacherIds?: readonly string[];
  /** Course poster (portrait flyer); shown instead of the photo when set. */
  poster?: string;
  title?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  fromDb?: boolean;
};

export type TravelLive = {
  id: string;
  titleKey: string;
  descKey: string;
  bodyKey: string;
  tagKey: string;
  image: string;
  highlights: readonly string[];
  title?: I18nText;
  body?: I18nText;
  tag?: I18nText;
  duration?: I18nText;
  fromDb?: boolean;
  enrollWindows?: readonly EnrollWindowCms[];
};

export type UniversityLive = {
  id: string;
  titleKey?: string;
  descKey?: string;
  nameMnKey?: string;
  nameZhKey?: string;
  cityKey?: string;
  title?: I18nText;
  body?: I18nText;
  city?: I18nText;
  image: string;
  fromDb?: boolean;
};

export function mergeAcademy(bundle: SiteBundle) {
  return { ...academy, ...bundle.settings };
}

export function mergeBranches(bundle: SiteBundle): BranchCms[] {
  if (bundle.branches && bundle.branches.length > 0) return bundle.branches;
  return branchesMeta.map((b) => ({
    id: b.id,
    title: {},
    address: {},
    phones: [...b.phones],
    phoneDisplay: [...b.phoneDisplay],
    titleKey: b.titleKey,
    addrKey: b.addrKey,
  }));
}

export function mergeEnrollWindows(
  bundle: SiteBundle,
  kind: "travel" | "university",
  id: string,
): EnrollWindowCms[] | undefined {
  const custom = bundle.enrollWindows?.[kind]?.[id];
  if (custom && custom.length > 0) return custom;
  if (kind === "travel") {
    const pack = travelPackagesMeta.find((p) => p.id === id);
    return pack?.enrollWindows
      ? pack.enrollWindows.map((w) => ({ ...w }))
      : undefined;
  }
  const uni = universitiesMeta.find((u) => u.id === id);
  return uni?.enrollWindows
    ? uni.enrollWindows.map((w) => ({ ...w }))
    : undefined;
}

export function mergeTranslationFeatures(
  bundle: SiteBundle,
): TranslationFeatureCms[] {
  if (bundle.translationFeatures && bundle.translationFeatures.length > 0) {
    return bundle.translationFeatures;
  }
  return [
    {
      id: "1",
      ico: "文",
      title: {},
      body: {},
      // keys resolved in UI via fallback
    },
    { id: "2", ico: "言", title: {}, body: {} },
    { id: "3", ico: "书", title: {}, body: {} },
    { id: "4", ico: "✓", title: {}, body: {} },
  ].map((f, i) => ({
    ...f,
    title: { mn: "", en: "", zh: "" },
    body: { mn: "", en: "", zh: "" },
    // store default key refs in title.mn empty — UI uses FEATURE_KEYS
    id: String(i + 1),
  }));
}

export const DEFAULT_TRANS_FEATURE_KEYS = [
  { id: "1", ico: "文", t: "trans_feat_1_t", d: "trans_feat_1_d" },
  { id: "2", ico: "言", t: "trans_feat_2_t", d: "trans_feat_2_d" },
  { id: "3", ico: "书", t: "trans_feat_3_t", d: "trans_feat_3_d" },
  { id: "4", ico: "✓", t: "trans_feat_4_t", d: "trans_feat_4_d" },
] as const;

export function mergeTeam(bundle: SiteBundle): TeamMemberCms[] {
  if (bundle.team && bundle.team.length > 0) return bundle.team;
  return teachersMeta.map((m) => ({
    id: m.id,
    name: {},
    role: {},
    level: {},
    bio: {},
    hsk: [...(m.hsk ?? [])],
    photo: m.photo ?? "",
    nameKey: m.nameKey,
    roleKey: m.roleKey ?? "teacher_role",
    levelKey: m.levelKey,
  }));
}

export function mergeKidsTeachers(bundle: SiteBundle): KidsTeacherCms[] {
  if (bundle.kidsTeachers && bundle.kidsTeachers.length > 0)
    return bundle.kidsTeachers;
  return kidsTeachers.map((t) => ({
    id: t.id,
    name: {},
    photo: t.photo,
    nameKey: t.nameKey,
  }));
}

export function mergeKidsLevels(bundle: SiteBundle): KidsLevelCms[] {
  if (bundle.kidsLevels && bundle.kidsLevels.length > 0) return bundle.kidsLevels;
  return kidsLevels.map((l) => ({
    id: l.id,
    label: {},
    age: {},
    desc: {},
    mark: l.mark,
    teacherIds: [...l.teacherIds],
    labelKey: l.labelKey,
    ageKey: l.ageKey,
    descKey: l.descKey,
  }));
}

export function mergeKidsSchedules(bundle: SiteBundle): KidsScheduleCms[] {
  if (bundle.kidsSchedules && bundle.kidsSchedules.length > 0)
    return bundle.kidsSchedules;
  return kidsSchedules.map((s) => ({
    id: s.id,
    label: {},
    meta: {},
    dayGroup: s.dayGroup,
    time: s.time,
    days: {},
    labelKey: s.labelKey,
    metaKey: s.metaKey,
    daysKey: s.daysKey,
  }));
}

export function mergeQuizQuestions(bundle: SiteBundle): QuizQuestionCms[] {
  if (bundle.quizQuestions && bundle.quizQuestions.length > 0)
    return bundle.quizQuestions;
  return defaultQuizQuestions.map((q) => ({
    id: q.id,
    level: q.level,
    kind: q.kind,
    hanzi: q.hanzi,
    pinyin: q.pinyin,
    options: q.options.map((o) => ({ mn: o.mn, en: o.en, zh: o.zh })),
    correct: q.correct,
  }));
}

function dateFromDb(d?: string | null) {
  if (!d) return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  return d.slice(0, 10).replace(/-/g, ".");
}

export function mergeNews(bundle: SiteBundle, dbRows: CmsRow[] = []): NewsLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => ({
        id: r.slug || r.id,
        date: dateFromDb(r.published_at),
        tagKey: r.filter_key || "tag_academy",
        title: r.title,
        excerpt: r.excerpt,
        body: r.body,
        tag: r.tag,
        image: r.image_url || "",
        fromDb: true,
      }));
  }

  return newsIds
    .map((n) => {
      const o = bundle.news?.[n.id];
      if (!o) return { ...n } as NewsLive;
      return {
        ...n,
        date: o.date ?? n.date,
        image: o.image ?? n.image,
        hidden: o.hidden ?? false,
      } as NewsLive & { hidden?: boolean };
    })
    .filter((n) => !("hidden" in n && n.hidden));
}

export function mergeProducts(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): ProductLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base = shopProductsMeta.find((p) => p.id === r.slug);
        const cat = r.filter_key || base?.cat || "";
        return {
          id: r.slug || r.id,
          title: r.title,
          body: r.body,
          tag: r.tag,
          cat: cat || undefined,
          price: Number(r.price ?? 0),
          inStock: r.in_stock ?? true,
          image: r.image_url || base?.image || "",
          href:
            (typeof r.meta?.href === "string" ? r.meta.href : undefined) ||
            bundle.products?.[r.slug]?.href ||
            base?.href,
          specs: base?.specs,
          titleKey: base?.titleKey,
          descKey: base?.descKey,
          bodyKey: base?.bodyKey,
          unitKey: base?.unitKey,
          tagKey: base?.tagKey,
          fromDb: true,
        };
      });
  }

  return shopProductsMeta
    .map((p) => {
      const o = bundle.products?.[p.id];
      if (!o) return { ...p } as ProductLive;
      return {
        ...p,
        price: o.price ?? p.price,
        inStock: o.inStock ?? p.inStock,
        image: o.image ?? p.image,
        hidden: o.hidden ?? false,
      } as ProductLive & { hidden?: boolean };
    })
    .filter((p) => !("hidden" in p && p.hidden));
}

export function mergeCourses(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): CourseLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base = coursesMeta.find((c) => c.id === r.slug) ?? coursesMeta[0];
        const metaHl = Array.isArray(r.meta?.highlights)
          ? (r.meta.highlights as string[])
          : undefined;
        const metaTeachers = Array.isArray(r.meta?.teacherIds)
          ? (r.meta.teacherIds as string[])
          : undefined;
        const metaPoster =
          typeof r.meta?.poster === "string" ? r.meta.poster : undefined;
        return {
          ...base,
          id: r.slug || r.id,
          filter: r.filter_key || base.filter,
          image: r.image_url || base.image,
          title: r.title,
          body: r.body,
          tag: r.tag,
          highlights: metaHl?.length ? metaHl : base.highlights,
          teacherIds:
            metaTeachers ??
            ("teacherIds" in base ? (base.teacherIds as readonly string[]) : undefined),
          poster: metaPoster || undefined,
          fromDb: true,
        };
      });
  }
  const hidden = new Set(bundle.hiddenCourses ?? []);
  return coursesMeta
    .filter((c) => !hidden.has(c.id))
    .map((c) => ({ ...c }) as CourseLive);
}

export function mergeTravel(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): TravelLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base =
          travelPackagesMeta.find((t) => t.id === r.slug) ??
          travelPackagesMeta[0];
        const hl = Array.isArray(r.highlights)
          ? (r.highlights as string[])
          : base.highlights;
        const custom = bundle.enrollWindows?.travel?.[r.slug || r.id];
        const windows: readonly EnrollWindowCms[] | undefined = custom?.length
          ? custom
          : base.enrollWindows
            ? base.enrollWindows.map((w) => ({ ...w }))
            : undefined;
        return {
          id: r.slug || r.id,
          titleKey: base.titleKey,
          descKey: base.descKey,
          bodyKey: base.bodyKey,
          tagKey: base.tagKey,
          image: r.image_url || base.image,
          title: r.title,
          body: r.body,
          tag: r.tag,
          duration: r.duration,
          highlights: hl,
          enrollWindows: windows,
          fromDb: true,
        } satisfies TravelLive;
      });
  }
  const hidden = new Set(bundle.hiddenTravel ?? []);
  return travelPackagesMeta
    .filter((t) => !hidden.has(t.id))
    .map((t) => {
      const custom = bundle.enrollWindows?.travel?.[t.id];
      return {
        id: t.id,
        titleKey: t.titleKey,
        descKey: t.descKey,
        bodyKey: t.bodyKey,
        tagKey: t.tagKey,
        image: t.image,
        highlights: t.highlights,
        enrollWindows: custom?.length
          ? custom
          : t.enrollWindows.map((w) => ({ ...w })),
      } satisfies TravelLive;
    });
}

export function mergeUniversities(
  bundle: SiteBundle,
  dbRows: CmsRow[] = [],
): UniversityLive[] {
  if (dbRows.length > 0) {
    return dbRows
      .filter((r) => !r.hidden)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => {
        const base = chinaProgramsMeta.find((u) => u.id === r.slug);
        const metaCity =
          typeof r.meta?.cityKey === "string" ? r.meta.cityKey : "";
        const cityFromDb =
          typeof r.city === "object" && r.city
            ? (r.city.mn || r.city.en || r.city.zh || "").trim()
            : "";
        const cityKey =
          (metaCity.startsWith("map_") ? metaCity : undefined) ||
          base?.cityKey ||
          (cityFromDb.startsWith("map_") ? cityFromDb : undefined);
        return {
          id: r.slug || r.id,
          title: r.title,
          body: r.body,
          city: r.city,
          cityKey,
          titleKey: base?.titleKey,
          descKey: base?.descKey,
          nameMnKey: base?.nameMnKey,
          nameZhKey: base?.nameZhKey,
          image: r.image_url || base?.image || "",
          fromDb: true,
        };
      });
  }
  // The old built-in sample schools are retired: the public list is now
  // partnerUniversities (data/content.ts). Only schools added in admin show here.
  void bundle;
  return [];
}

export const ADMIN_PAGES = [
  { id: "home", to: "/", key: "nav_home", adminTo: "/admin/pages/home" },
  { id: "courses", to: "/courses", key: "nav_courses", adminTo: "/admin/courses" },
  { id: "news", to: "/medee", key: "nav_news", adminTo: "/admin/news" },
  { id: "university", to: "/university", key: "nav_uni", adminTo: "/admin/universities" },
  { id: "travel", to: "/travel", key: "nav_travel", adminTo: "/admin/travel" },
  { id: "shop", to: "/shop", key: "nav_shop", adminTo: "/admin/products" },
  { id: "quiz", to: "/quiz", key: "nav_quiz", adminTo: "/admin/quiz" },
  { id: "about", to: "/about", key: "nav_about", adminTo: "/admin/pages/about" },
  { id: "contact", to: "/contact", key: "nav_contact", adminTo: "/admin/pages/contact" },
  {
    id: "translation",
    to: "/translation",
    key: "nav_translation",
    adminTo: "/admin/translation",
  },
  { id: "enroll", to: "/enroll", key: "register_cta", adminTo: "/admin/leads" },
] as const;
