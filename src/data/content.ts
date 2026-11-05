import { universities } from "./universities";
export const academy = {
  brand: "ХАНЗ",
  /** From the academy's page copy (khanz_mn_huudasnii_tekst.docx) */
  graduates: "8000+",
  scholarshipStudents: "1000+",
  yearsExp: "12",
  polandUnis: "35",
  partnerUniversities: "300+",
  colleges: "70+",
  tianjinStudents: "250+",
  phone: ["9990-7748", "9999-1573"],
  phoneRaw: ["99907748", "99991573"],
  email: "surgalthanz@gmail.com",
  facebook: "https://www.facebook.com/HanzAcademy",
  instagram: "https://www.instagram.com/khanzacademy/",
  messenger: "https://m.me/HanzAcademy",
  shopUrl: "https://bumtankhanz.mn",
  founded: "2014",
  address:
    "СБД, 1-р хороо, Замын цагдаагийн зүүн талд, Union Building, А блок, 12 давхар, 1204",
  hours: "Даваа–Бямба · 10:00–18:00 (цайны цаг 13:00–14:00)",
  whatsapp: "https://wa.me/97699907748",
};

/** Class day: lessons 10:00–18:00 with a lunch break 13:00–14:00. */
export const classDay = {
  start: "10:00",
  end: "18:00",
  lunchStart: "13:00",
  lunchEnd: "14:00",
} as const;

type TeacherMeta = {
  id: string;
  nameKey: string;
  /** Defaults to "teacher_role" (Багш). */
  roleKey?: string;
  /** Teaching level and HSK classes; left out for staff who don't teach. */
  levelKey?: string;
  hsk?: readonly number[];
  /** Portrait under public/; until the file exists the card shows the name's initial. */
  photo?: string;
  /** Short introduction under the name on /about. */
  bio?: { mn: string; en: string; zh: string };
};

/** The team on the About page: director, teachers (with the HSK levels they teach), manager. */
export const teachersMeta: readonly TeacherMeta[] = [
  {
    id: "otgonjargal",
    nameKey: "teacher_otgonjargal",
    roleKey: "teacher_role_director",
    levelKey: "teacher_lvl_adv",
    hsk: [5, 6],
    photo: "/images/teachers/otgonjargal.webp",
    // Her own wording, from her profile (2026-11-05).
    bio: {
      mn: "Ханз академийн үүсгэн байгуулагч, багш, орчуулагч, эрх зүйч. Боловсрол судлалын доктор эрдмийн зэрэгтэй.",
      en: "Founder of Hanz Academy, teacher, translator and lawyer, with a doctorate in education.",
      zh: "汉兹学院创始人，教师、翻译、法律工作者，教育学博士。",
    },
  },
  {
    id: "dagula",
    nameKey: "teacher_dagula",
    levelKey: "teacher_lvl_beg_mid",
    hsk: [1, 2, 3],
    photo: "/images/teachers/dagula.webp",
  },
  {
    id: "michidmaa",
    nameKey: "teacher_michidmaa",
    roleKey: "teacher_role_trainee",
    levelKey: "teacher_lvl_beg_mid",
    hsk: [1, 2, 3],
    photo: "/images/teachers/michidmaa.webp",
  },
  {
    id: "tsetsenbileg",
    nameKey: "teacher_tsetsenbileg",
    roleKey: "teacher_role_trainee",
    levelKey: "teacher_lvl_beg",
    hsk: [1, 2],
    photo: "/images/teachers/tsetsenbileg.webp",
  },
  {
    id: "sarantuya",
    nameKey: "teacher_sarantuya",
    roleKey: "teacher_role_manager",
    photo: "/images/teachers/sarantuya.webp",
  },
];

/** Fee per level and for the 6-month HSK 1–5 class (page copy, "Үнэ / Төлбөр"). */
export const hskFees = { month: 1_800_000, sixMonth: 4_800_000 } as const;

export type HskStage = "beginner" | "intermediate" | "advanced";

/** `drop`: point numbers the academy took off the page, kept in the copy files. */
function hskCourse(level: number, filter: HskStage, image: string, points: number, drop: number[] = []) {
  return {
    id: `hsk${level}`,
    level,
    titleKey: `course_hsk${level}_t`,
    descKey: `course_hsk${level}_b`,
    /** One line for cards and the levels list. */
    sumKey: `course_hsk${level}_sum`,
    /** Headline after the level name ("Хятад хэлний бат суурийг тавина"). */
    unitKey: `course_hsk${level}_head`,
    /** Closing line above the enrol button. */
    ctaKey: `course_hsk${level}_cta`,
    tagKey: `tag_${filter}`,
    icon: "一二三四五六"[level - 1],
    filter,
    image,
    highlights: Array.from({ length: points }, (_, i) => i + 1)
      .filter((n) => !drop.includes(n))
      .map((n) => `course_hsk${level}_h${n}`),
    teacherIds: teachersMeta.filter((m) => m.hsk?.includes(level)).map((m) => m.id),
    /** HSK 6 is not part of the 6-month HSK 1–5 class. */
    sixMonth: level <= 5,
  };
}

/** HSK 1–6, one course page per level (khanz_mn_huudasnii_tekst.docx). */
export const coursesMeta = [
  hskCourse(1, "beginner", "/courses/image12.webp", 7),
  hskCourse(2, "beginner", "/courses/image14.webp", 6, [2]),
  hskCourse(3, "intermediate", "/courses/image8.webp", 10, [2, 3, 4, 5, 6, 8]),
  hskCourse(4, "intermediate", "/courses/image15.webp", 8, [5, 6, 7, 8]),
  hskCourse(5, "advanced", "/courses/image4.webp", 8, [5, 6, 7]),
  hskCourse(6, "advanced", "/courses/image11.webp", 9, [7, 8, 9]),
];

export type CourseProgram = (typeof coursesMeta)[number];
export type CourseProgramFilter = CourseProgram["filter"] | "all";

export function getCourseById(id: string) {
  return coursesMeta.find((c) => c.id === id);
}

/** Kids course levels for online enrollment cards */
export const kidsLevels = [
  {
    id: "beginner",
    labelKey: "kids_lvl_beginner",
    ageKey: "kids_lvl_beginner_age",
    descKey: "kids_lvl_beginner_d",
    mark: "①",
    teacherIds: ["saraa", "nomin"] as const,
  },
  {
    id: "elementary",
    labelKey: "kids_lvl_elementary",
    ageKey: "kids_lvl_elementary_age",
    descKey: "kids_lvl_elementary_d",
    mark: "②",
    teacherIds: ["bold", "saraa"] as const,
  },
  {
    id: "intermediate",
    labelKey: "kids_lvl_intermediate",
    ageKey: "kids_lvl_intermediate_age",
    descKey: "kids_lvl_intermediate_d",
    mark: "③",
    teacherIds: ["tuya", "bold"] as const,
  },
] as const;

/** Kids teachers shown on course cards */
export const kidsTeachers = [
  {
    id: "saraa",
    nameKey: "kids_teacher_saraa",
    photo:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    id: "bold",
    nameKey: "kids_teacher_bold",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    id: "nomin",
    nameKey: "kids_teacher_nomin",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    id: "tuya",
    nameKey: "kids_teacher_tuya",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&h=240&q=80",
  },
] as const;

/** Weekly schedule options for kids classes */
export const kidsSchedules = [
  {
    id: "wd_afternoon",
    labelKey: "kids_sch_wd_afternoon",
    metaKey: "kids_sch_wd_afternoon_m",
    dayGroup: "weekday" as const,
    time: "16:00–17:30",
    daysKey: "kids_sch_days_wd",
  },
  {
    id: "wd_evening",
    labelKey: "kids_sch_wd_evening",
    metaKey: "kids_sch_wd_evening_m",
    dayGroup: "weekday" as const,
    time: "18:00–19:30",
    daysKey: "kids_sch_days_wd",
  },
  {
    id: "weekend_am",
    labelKey: "kids_sch_weekend_am",
    metaKey: "kids_sch_weekend_am_m",
    dayGroup: "weekend" as const,
    time: "10:00–11:30",
    daysKey: "kids_sch_days_we",
  },
  {
    id: "weekend_pm",
    labelKey: "kids_sch_weekend_pm",
    metaKey: "kids_sch_weekend_pm_m",
    dayGroup: "weekend" as const,
    time: "14:00–15:30",
    daysKey: "kids_sch_days_we",
  },
] as const;

export type KidsScheduleId = (typeof kidsSchedules)[number]["id"];
export type KidsDayGroup = (typeof kidsSchedules)[number]["dayGroup"];

/** Concrete kids class slots: level × schedule (for filterable browse) */
export const kidsClassSlots = kidsLevels.flatMap((level) =>
  kidsSchedules.map((sch) => ({
    id: `${level.id}__${sch.id}`,
    levelId: level.id,
    scheduleId: sch.id,
    titleKey: level.labelKey,
    descKey: level.descKey,
    ageKey: level.ageKey,
    mark: level.mark,
    teacherIds: level.teacherIds,
    dayGroup: sch.dayGroup,
    time: sch.time,
    daysKey: sch.daysKey,
    scheduleLabelKey: sch.labelKey,
    scheduleMetaKey: sch.metaKey,
  })),
);

export function kidsTeachersByIds(ids: readonly string[]) {
  return ids
    .map((id) => kidsTeachers.find((t) => t.id === id))
    .filter((t): t is (typeof kidsTeachers)[number] => Boolean(t));
}

export function getKidsClassSlotById(id: string) {
  return kidsClassSlots.find((slot) => slot.id === id);
}

export const kidsClassHighlights = [
  "kids_detail_h1",
  "kids_detail_h2",
  "kids_detail_h3",
  "kids_detail_h4",
] as const;

export const travelPackagesMeta = [
  {
    id: "china",
    titleKey: "travel_china_t",
    descKey: "travel_china_d",
    bodyKey: "travel_china_b",
    tagKey: "travel_tag_tour",
    highlights: [
      "travel_china_h1",
      "travel_china_h2",
      "travel_china_h3",
    ] as const,
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=72",
    enrollWindows: [
      {
        id: "now" as const,
        labelKey: "travel_enroll_now",
        dateKey: "travel_enroll_china_now_d",
        status: "open" as UniEnrollStatus,
      },
      {
        id: "spring" as const,
        labelKey: "travel_enroll_spring",
        dateKey: "travel_enroll_china_spring_d",
        status: "closed" as UniEnrollStatus,
      },
      {
        id: "autumn" as const,
        labelKey: "travel_enroll_autumn",
        dateKey: "travel_enroll_china_autumn_d",
        status: "soon" as UniEnrollStatus,
      },
      {
        id: "start" as const,
        labelKey: "travel_enroll_start",
        dateKey: "travel_enroll_china_start_d",
        status: "soon" as UniEnrollStatus,
      },
    ],
  },
  {
    id: "poland",
    titleKey: "travel_poland_t",
    descKey: "travel_poland_d",
    bodyKey: "travel_poland_b",
    tagKey: "travel_tag_europe",
    highlights: [
      "travel_poland_h1",
      "travel_poland_h2",
      "travel_poland_h3",
    ] as const,
    image:
      "https://images.unsplash.com/photo-1467269204594-59904b4cbaba?auto=format&fit=crop&w=1000&q=72",
    enrollWindows: [
      {
        id: "now" as const,
        labelKey: "travel_enroll_now",
        dateKey: "travel_enroll_poland_now_d",
        status: "open" as UniEnrollStatus,
      },
      {
        id: "spring" as const,
        labelKey: "travel_enroll_spring",
        dateKey: "travel_enroll_poland_spring_d",
        status: "closed" as UniEnrollStatus,
      },
      {
        id: "autumn" as const,
        labelKey: "travel_enroll_autumn",
        dateKey: "travel_enroll_poland_autumn_d",
        status: "soon" as UniEnrollStatus,
      },
      {
        id: "start" as const,
        labelKey: "travel_enroll_start",
        dateKey: "travel_enroll_poland_start_d",
        status: "soon" as UniEnrollStatus,
      },
    ],
  },
] as const;

export function getTravelById(id: string) {
  return travelPackagesMeta.find((p) => p.id === id);
}

export const enrollInterests = [
  { id: "hsk", kind: "course" as const, labelKey: "program_intensive" },
  { id: "university", kind: "consult" as const, labelKey: "program_university" },
  { id: "travel_china", kind: "travel" as const, labelKey: "travel_china_t" },
  { id: "travel_poland", kind: "travel" as const, labelKey: "travel_poland_t" },
  { id: "consult", kind: "consult" as const, labelKey: "enroll_interest_consult" },
] as const;

export const chinaProgramsMeta = [
  {
    id: "bjfu",
    titleKey: "prog_bjfu_t",
    descKey: "prog_bjfu_d",
    nameMnKey: "prog_bjfu_mn",
    nameZhKey: "prog_bjfu_zh",
    cityKey: "map_beijing" as const,
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=72",
  },
  {
    id: "cq",
    titleKey: "prog_cq_t",
    descKey: "prog_cq_d",
    nameMnKey: "prog_cq_mn",
    nameZhKey: "prog_cq_zh",
    cityKey: "map_chongqing" as const,
    image:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1000&q=72",
  },
  {
    id: "nuaa",
    titleKey: "prog_nuaa_t",
    descKey: "prog_nuaa_d",
    nameMnKey: "prog_nuaa_mn",
    nameZhKey: "prog_nuaa_zh",
    cityKey: "map_nanjing" as const,
    image:
      "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1000&q=72",
  },
  {
    id: "sc",
    titleKey: "prog_sc_t",
    descKey: "prog_sc_d",
    nameMnKey: "prog_sc_mn",
    nameZhKey: "prog_sc_zh",
    cityKey: "map_chengdu" as const,
    image:
      "https://images.unsplash.com/photo-1537531383496-f4749b8032eb?auto=format&fit=crop&w=1000&q=72",
  },
] as const;

/** Why Hanz — from client introduction deck */
export const whyHanzMeta = [
  { id: "why1", icon: "汉", titleKey: "why_1_t", descKey: "why_1_d" },
  { id: "why2", icon: "书", titleKey: "why_2_t", descKey: "why_2_d" },
  { id: "why3", icon: "听", titleKey: "why_3_t", descKey: "why_3_d" },
  { id: "why4", icon: "时", titleKey: "why_4_t", descKey: "why_4_d" },
  { id: "why5", icon: "试", titleKey: "why_5_t", descKey: "why_5_d" },
  { id: "why6", icon: "校", titleKey: "why_6_t", descKey: "why_6_d" },
] as const;

/** Services on the home page (page copy, "Үйлчилгээ"). */
export const servicesMeta = [
  { id: "svc1", icon: "汉", titleKey: "svc_1_t", descKey: "svc_1_d", to: "/courses" },
  { id: "svc2", icon: "奖", titleKey: "svc_2_t", descKey: "svc_2_d", to: "/university" },
  { id: "svc3", icon: "译", titleKey: "svc_3_t", descKey: "svc_3_d", to: "/translation" },
  { id: "svc4", icon: "旅", titleKey: "svc_4_t", descKey: "svc_4_d", to: "/travel" },
] as const;

export const branchesMeta = [
  {
    id: "ub",
    titleKey: "branch_ub_t",
    addrKey: "branch_ub_a",
    phones: ["99907748", "99991573"],
    phoneDisplay: ["9990-7748", "9999-1573"],
  },
  {
    id: "gs",
    titleKey: "branch_gs_t",
    addrKey: "branch_gs_a",
    phones: ["99870840"],
    phoneDisplay: ["9987-0840"],
  },
  {
    id: "nl",
    titleKey: "branch_nl_t",
    addrKey: "branch_nl_a",
    phones: ["90963996", "99798438"],
    phoneDisplay: ["9096-3996", "9979-8438"],
  },
  {
    id: "bo",
    titleKey: "branch_bo_t",
    addrKey: "branch_bo_a",
    phones: ["95874848"],
    phoneDisplay: ["9587-4848"],
  },
] as const;

export const newsIds = [
  {
    id: "tips",
    date: "2026.03.01",
    tagKey: "tag_course" as const,
    titleKey: "news1_t",
    excerptKey: "news1_e",
    bodyKey: "news1_b",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=72",
    href: "https://www.instagram.com/khanzacademy/",
  },
  {
    id: "scholarship",
    date: "2026.02.20",
    tagKey: "tag_study" as const,
    titleKey: "news2_t",
    excerptKey: "news2_e",
    bodyKey: "news2_b",
    image: "/images/news-scholarship.webp",
    href: "https://www.instagram.com/khanzacademy/",
  },
  {
    id: "agent",
    date: "2026.02.10",
    tagKey: "tag_academy" as const,
    titleKey: "news3_t",
    excerptKey: "news3_e",
    bodyKey: "news3_b",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=72",
    href: "https://www.instagram.com/khanzacademy/",
  },
  {
    id: "kids",
    date: "2026.01.28",
    tagKey: "tag_study" as const,
    titleKey: "news4_t",
    excerptKey: "news4_e",
    bodyKey: "news4_b",
    image:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1000&q=72",
    href: "https://www.instagram.com/khanzacademy/",
  },
];

export type NewsTag = (typeof newsIds)[number]["tagKey"] | "all";

export type UniEnrollStatus = "open" | "soon" | "closed";

export type UniEnrollWindow = {
  id: "now" | "spring" | "autumn" | "start";
  labelKey: string;
  dateKey: string;
  status: UniEnrollStatus;
};

export const universitiesMeta = [
  {
    id: "china",
    countryKey: "china",
    titleKey: "china_title",
    descKey: "china_desc",
    bodyKey: "china_b",
    points: ["p1", "p2", "p3"] as const,
    image:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1000&q=72",
    enrollWindows: [
      {
        id: "now" as const,
        labelKey: "uni_enroll_now",
        dateKey: "uni_enroll_now_d",
        status: "open" as UniEnrollStatus,
      },
      {
        id: "spring" as const,
        labelKey: "uni_enroll_spring",
        dateKey: "uni_enroll_spring_d",
        status: "closed" as UniEnrollStatus,
      },
      {
        id: "autumn" as const,
        labelKey: "uni_enroll_autumn",
        dateKey: "uni_enroll_autumn_d",
        status: "soon" as UniEnrollStatus,
      },
      {
        id: "start" as const,
        labelKey: "uni_enroll_start",
        dateKey: "uni_enroll_start_d",
        status: "soon" as UniEnrollStatus,
      },
    ],
  },
  {
    id: "poland",
    countryKey: "poland",
    titleKey: "poland_title",
    descKey: "poland_desc",
    bodyKey: "poland_b",
    points: ["p4", "p5", "p6"] as const,
    image: "/images/poland/warsaw.webp",
    /** Two intakes a year (Think Poland webinar): late February and early October. */
    enrollWindows: [
      {
        id: "spring" as const,
        labelKey: "uni_enroll_spring",
        dateKey: "uni_enroll_poland_spring_d",
        status: "open" as UniEnrollStatus,
      },
      {
        id: "autumn" as const,
        labelKey: "uni_enroll_autumn",
        dateKey: "uni_enroll_poland_autumn_d",
        status: "soon" as UniEnrollStatus,
      },
    ],
  },
];

export function getUniversityById(id: string) {
  return universitiesMeta.find((u) => u.id === id);
}

export function uniEnrollStatusKey(status: UniEnrollStatus) {
  if (status === "open") return "uni_status_open";
  if (status === "soon") return "uni_status_soon";
  return "uni_status_closed";
}

export const shopProductsMeta = [
  {
    id: "prod1",
    titleKey: "prod1",
    unitKey: "unit1",
    tagKey: "tag_brand",
    cat: "porcelain" as const,
    price: 100000,
    image: "/images/shop-1.webp",
    href: "https://bumtankhanz.mn",
    descKey: "prod1_d",
    bodyKey: "prod1_b",
    specs: ["prod1_s1", "prod1_s2", "prod1_s3"] as const,
    inStock: true,
  },
  {
    id: "prod2",
    titleKey: "prod2",
    unitKey: "unit4",
    tagKey: "tag_best",
    cat: "porcelain" as const,
    price: 350000,
    image: "/images/shop-2.webp",
    href: "https://bumtankhanz.mn",
    descKey: "prod2_d",
    bodyKey: "prod2_b",
    specs: ["prod2_s1", "prod2_s2", "prod2_s3"] as const,
    inStock: true,
  },
  {
    id: "prod3",
    titleKey: "prod3",
    unitKey: "unit_book",
    tagKey: "tag_course",
    cat: "books" as const,
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    href: "https://www.facebook.com/HanzAcademy",
    descKey: "prod3_d",
    bodyKey: "prod3_b",
    specs: ["prod3_s1", "prod3_s2", "prod3_s3"] as const,
    inStock: true,
  },
  {
    id: "prod4",
    titleKey: "prod4",
    unitKey: "unit_drill",
    tagKey: "tag_brand",
    cat: "books" as const,
    price: 15000,
    image: "/images/hanzi-placeholder.svg",
    href: "https://www.facebook.com/HanzAcademy",
    descKey: "prod4_d",
    bodyKey: "prod4_b",
    specs: ["prod4_s1", "prod4_s2", "prod4_s3"] as const,
    inStock: true,
  },
  {
    id: "prod5",
    titleKey: "prod5",
    unitKey: "unit_book",
    tagKey: "tag_brand",
    cat: "books" as const,
    price: 25000,
    image: "/images/shop-grammar-1.webp",
    href: "https://www.facebook.com/HanzAcademy",
    descKey: "prod5_d",
    bodyKey: "prod5_b",
    specs: ["prod5_s1", "prod5_s2", "prod5_s3"] as const,
    inStock: true,
  },
];

export type ShopCat = "all" | "porcelain" | "books";

/**
 * "1 800 000 ₮": thin spaces between thousands and a space before the sign read calmer
 * than "1,800,000₮" (the academy found the comma form looked cheap). Non-breaking, so a
 * price never wraps. `lang` is kept for callers; every language uses this form.
 */
export const formatPrice = (n: number, _lang: "mn" | "en" | "zh" = "mn") =>
  `${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₮`;

export function getNewsById(id: string) {
  return newsIds.find((n) => n.id === id);
}

export function getProductById(id: string) {
  return shopProductsMeta.find((p) => p.id === id);
}

/** Names of the academy's Chinese universities (A–Z); details live in data/universities.ts. */
export const partnerUniversities: string[] = universities.map((u) => u.name);

/** Six well-known names from partnerUniversities, shown on Home and About. */
export const featuredUniversities = [
  "Peking University",
  "Tsinghua University",
  "Fudan University",
  "Shanghai Jiao Tong University",
  "Beijing Language and Culture University",
  "Renmin University",
] as const;
