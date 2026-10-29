export const academy = {
  brand: "ХАНЗ",
  /** From client deck — totals since founding */
  graduates: "7300+",
  scholarshipStudents: "1080+",
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
  registerUrl: "https://forms.gle/xFXQ1u7c6qnkJYhE8",
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
};

/** The team on the About page: director, teachers (with the HSK levels they teach), manager. */
export const teachersMeta: readonly TeacherMeta[] = [
  {
    id: "otgonjargal",
    nameKey: "teacher_otgonjargal",
    roleKey: "teacher_role_director",
    levelKey: "teacher_lvl_adv",
    hsk: [5, 6],
    photo: "/images/teachers/otgonjargal.jpg",
  },
  {
    id: "dagula",
    nameKey: "teacher_dagula",
    levelKey: "teacher_lvl_adv",
    hsk: [4, 5, 6],
    photo: "/images/teachers/dagula.jpg",
  },
  {
    id: "michidmaa",
    nameKey: "teacher_michidmaa",
    roleKey: "teacher_role_trainee",
    levelKey: "teacher_lvl_beg_mid",
    hsk: [1, 2, 3],
    photo: "/images/teachers/michidmaa.jpg",
  },
  {
    id: "tsetsenbileg",
    nameKey: "teacher_tsetsenbileg",
    roleKey: "teacher_role_trainee",
    levelKey: "teacher_lvl_beg",
    hsk: [1, 2],
    photo: "/images/teachers/tsetsenbileg.jpg",
  },
  {
    id: "sarantuya",
    nameKey: "teacher_sarantuya",
    roleKey: "teacher_role_manager",
    photo: "/images/teachers/sarantuya.jpg",
  },
];

/** Real programs from client deck (Taniltsuulga Hanz.pptx) */
export const coursesMeta = [
  {
    id: "classroom",
    titleKey: "course_classroom_t",
    descKey: "course_classroom_d",
    bodyKey: "course_classroom_b",
    tagKey: "tag_classroom",
    unitKey: "course_classroom_u",
    icon: "堂",
    filter: "classroom" as const,
    image: "/courses/image12.webp",
    highlights: [
      "course_classroom_h1",
      "course_classroom_h2",
      "course_classroom_h3",
    ] as const,
    /** Classroom covers HSK 1–6, so every teaching member of the team. */
    teacherIds: ["otgonjargal", "dagula", "michidmaa", "tsetsenbileg"] as const,
  },
  {
    id: "online",
    titleKey: "course_online_t",
    descKey: "course_online_d",
    bodyKey: "course_online_b",
    tagKey: "tag_online",
    unitKey: "course_online_u",
    icon: "网",
    filter: "online" as const,
    image: "/courses/image14.webp",
    highlights: [
      "course_online_h1",
      "course_online_h2",
      "course_online_h3",
    ] as const,
  },
  {
    id: "corporate",
    titleKey: "course_corporate_t",
    descKey: "course_corporate_d",
    bodyKey: "course_corporate_b",
    tagKey: "tag_corporate",
    unitKey: "course_corporate_u",
    icon: "企",
    filter: "corporate" as const,
    image: "/courses/image15.webp",
    highlights: [
      "course_corporate_h1",
      "course_corporate_h2",
      "course_corporate_h3",
    ] as const,
  },
  {
    id: "short",
    titleKey: "course_short_t",
    descKey: "course_short_d",
    bodyKey: "course_short_b",
    tagKey: "tag_short",
    unitKey: "course_short_u",
    icon: "暑",
    filter: "short" as const,
    image: "/courses/image16.webp",
    highlights: [
      "course_short_h1",
      "course_short_h2",
      "course_short_h3",
    ] as const,
  },
  {
    id: "year",
    titleKey: "course_year_t",
    descKey: "course_year_d",
    bodyKey: "course_year_b",
    tagKey: "tag_intensive",
    unitKey: "course_year_u",
    icon: "年",
    filter: "classroom" as const,
    image: "/courses/image4.webp",
    highlights: ["course_year_h1", "course_year_h2", "course_year_h3"] as const,
  },
  {
    id: "hsk",
    titleKey: "course_hsk_t",
    descKey: "course_hsk_d",
    bodyKey: "course_hsk_b",
    tagKey: "tag_hsk",
    unitKey: "course_hsk_u",
    icon: "汉",
    filter: "classroom" as const,
    image: "/courses/image8.webp",
    highlights: ["course_hsk_h1", "course_hsk_h2", "course_hsk_h3"] as const,
  },
  {
    id: "speak",
    titleKey: "course_speak_t",
    descKey: "course_speak_d",
    bodyKey: "course_speak_b",
    tagKey: "tag_speak",
    unitKey: "course_speak_u",
    icon: "说",
    filter: "classroom" as const,
    image: "/courses/image11.webp",
    highlights: [
      "course_speak_h1",
      "course_speak_h2",
      "course_speak_h3",
    ] as const,
  },
  {
    id: "english",
    titleKey: "course_english_t",
    descKey: "course_english_d",
    bodyKey: "course_english_b",
    tagKey: "tag_english",
    unitKey: "course_english_u",
    icon: "英",
    filter: "classroom" as const,
    image: "/courses/image20.webp",
    highlights: [
      "course_english_h1",
      "course_english_h2",
      "course_english_h3",
    ] as const,
  },
  {
    id: "kids",
    titleKey: "course_kids_t",
    descKey: "course_kids_d",
    bodyKey: "course_kids_b",
    tagKey: "tag_kids",
    unitKey: "course_kids_u",
    icon: "童",
    filter: "kids" as const,
    image: "/courses/image21.webp",
    highlights: [
      "kids_detail_h1",
      "kids_detail_h2",
      "kids_detail_h3",
      "kids_detail_h4",
    ] as const,
  },
] as const;

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
  { id: "classroom", kind: "course" as const, labelKey: "course_classroom_t" },
  { id: "online", kind: "course" as const, labelKey: "course_online_t" },
  { id: "corporate", kind: "course" as const, labelKey: "course_corporate_t" },
  { id: "short", kind: "course" as const, labelKey: "course_short_t" },
  { id: "year", kind: "course" as const, labelKey: "course_year_t" },
  { id: "hsk", kind: "course" as const, labelKey: "course_hsk_t" },
  { id: "speak", kind: "course" as const, labelKey: "course_speak_t" },
  { id: "english", kind: "course" as const, labelKey: "course_english_t" },
  { id: "kids", kind: "course" as const, labelKey: "course_kids_t" },
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
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=72",
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
    image:
      "https://images.unsplash.com/photo-1467269204594-59904b4cbaba?auto=format&fit=crop&w=1000&q=72",
    enrollWindows: [
      {
        id: "now" as const,
        labelKey: "uni_enroll_now",
        dateKey: "uni_enroll_poland_now_d",
        status: "open" as UniEnrollStatus,
      },
      {
        id: "spring" as const,
        labelKey: "uni_enroll_spring",
        dateKey: "uni_enroll_poland_spring_d",
        status: "closed" as UniEnrollStatus,
      },
      {
        id: "autumn" as const,
        labelKey: "uni_enroll_autumn",
        dateKey: "uni_enroll_poland_autumn_d",
        status: "soon" as UniEnrollStatus,
      },
      {
        id: "start" as const,
        labelKey: "uni_enroll_start",
        dateKey: "uni_enroll_poland_start_d",
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

export const formatPrice = (n: number, lang: "mn" | "en" | "zh" = "mn") => {
  const locale = lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "mn-MN";
  return `${n.toLocaleString(locale)}₮`;
};

export function getNewsById(id: string) {
  return newsIds.find((n) => n.id === id);
}

export function getProductById(id: string) {
  return shopProductsMeta.find((p) => p.id === id);
}

/**
 * Chinese universities from the academy's list (deduplicated, A–Z). Shown as a
 * searchable list on the University page. Names stay in English in every language.
 */
export const partnerUniversities = [
  "Anhui Jianzhu University",
  "Anhui Normal University",
  "Beihang University",
  "Beihua University",
  "Beijing Forestry University",
  "Beijing Institute of Technology",
  "Beijing Language and Culture University",
  "Beijing Normal University",
  "Beijing University of Chemical Technology",
  "Beijing University of Posts and Telecommunications",
  "Belt and Road School",
  "Capital University of Economics and Business",
  "Changsha University of Science and Technology",
  "Chongqing University",
  "Dalian University",
  "Dalian University of Foreign Languages",
  "Dalian University of Technology",
  "Donghua University",
  "East China Normal University",
  "Fudan University",
  "Guangdong Ocean University",
  "Guangxi Medical University",
  "Guangxi Normal University",
  "Guizhou Normal University",
  "Hainan University",
  "Hangzhou Dianzi University",
  "Harbin Institute of Technology",
  "Harbin International School",
  "Harbin Normal University",
  "Hebei Normal University",
  "Heilongjiang University",
  "Henan University",
  "Hohai University",
  "Hunan University",
  "Inner Mongolia University",
  "Jiamusi University",
  "Jiangsu University",
  "Jiaxing University",
  "Jilin University",
  "Jinan University",
  "Lanzhou Jiaotong University",
  "Lanzhou University",
  "Lanzhou University of Technology",
  "Liaoning Petrochemical University",
  "Minzu University",
  "Nanchang Medical College",
  "Nanchang University",
  "Nanjing University",
  "Nanjing University of Aeronautics and Astronautics",
  "Ningbo University",
  "Northeast Normal University",
  "Northwestern Polytechnical University",
  "Peking University",
  "Qingdao University",
  "Qufu Normal University",
  "Renmin University",
  "Shandong University",
  "Shanghai Jiao Tong University",
  "Shanghai Ocean University",
  "Shanghai University",
  "Shantou University",
  "Shanxi Normal University",
  "Shenyang Normal University",
  "Shenzhen University",
  "Sichuan University",
  "Sichuan Vocational College of Cultural Industries",
  "Soochow University",
  "South China University of Technology",
  "Southeast University",
  "Southwest Jiaotong University",
  "Sun Yat-sen University",
  "Taiyuan University of Technology",
  "Tianjin University",
  "Tongji University",
  "Tsinghua Shenzhen International Graduate School",
  "Tsinghua University",
  "University of International Business and Economics",
  "Wenzhou University",
  "Wuhan University",
  "Xi’an Jiaotong University",
  "Xi’an Shiyou University",
  "Xiamen University",
  "Xinjiang University",
  "Yangzhou University",
  "Zhejiang International Studies University",
  "Zhejiang Normal University",
  "Zhejiang Sci-Tech University",
  "Zhejiang University of Science and Technology",
  "Zhengzhou University",
] as const;
