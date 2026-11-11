import type { EnrollmentDraft, Intake, PaymentStatus, Plan, Program, QpayInvoice } from "../domain/types";
import { getSupabase, hasSupabase } from "../lib/env";
import type { AuthService, CatalogService, EnrollmentService, PaymentService } from "./types";
import { fixturePrograms } from "../data/fixtures";

type JsonText = { mn?: string; en?: string; zh?: string } | string | null;

function textOf(value: JsonText, fallback = ""): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.mn || value.en || value.zh || fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : textOf(item as JsonText)))
    .filter(Boolean);
}

function fallbackIntake(schedule: string): Intake {
  return {
    id: "open",
    label: "Нээлттэй элсэлт",
    start: "2026-12-01",
    end: "2027-01-31",
    deadline: "2026-12-20",
    seats: 12,
    schedule,
  };
}

function num(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function planFromMeta(meta: Record<string, unknown>, amount: number, category: Program["category"]): Plan {
  const id = String(meta.planId ?? meta.plan ?? (category === "course" ? "m1" : "tour"));
  const qpayPlan = meta.qpayPlan === "m1" || meta.qpayPlan === "m6" || meta.qpayPlan === "m9" ? meta.qpayPlan : undefined;
  const qpayInterest = meta.qpayInterest === "intensive" || meta.qpayInterest === "kids" ? meta.qpayInterest : undefined;
  return {
    id,
    label: String(meta.planLabel ?? "Элсэлт"),
    amount,
    qpayPlan,
    qpayInterest,
  };
}

function mapCourse(row: Record<string, unknown>): Program | null {
  const slug = String(row.slug ?? "");
  if (!slug) return null;
  const meta = (row.meta ?? {}) as Record<string, unknown>;
  const known = fixturePrograms.find((p) => p.id === slug);
  const amount = num(meta.price ?? meta.amount, known?.plans[0]?.amount ?? 1_800_000);
  const plan = known?.plans[0]
    ? { ...known.plans[0], amount: amount || known.plans[0].amount }
    : planFromMeta(meta, amount, "course");
  if (plan.qpayInterest == null && (plan.id === "m1" || plan.id === "m6")) {
    plan.qpayInterest = "intensive";
    plan.qpayPlan = plan.id;
  }
  return {
    id: slug,
    category: "course",
    title: textOf(row.title as JsonText, known?.title ?? slug),
    subtitle: textOf(row.tag as JsonText, known?.subtitle ?? "Сургалт"),
    summary: known?.summary ?? textOf(row.body as JsonText).slice(0, 140),
    body: textOf(row.body as JsonText, known?.body ?? ""),
    image: String(row.image_url || known?.image || ""),
    hanzi: known?.hanzi ?? "汉",
    level: known?.level,
    stage: known?.stage,
    city: "Улаанбаатар",
    featured: known?.featured,
    plans: [plan],
    intakes: known?.intakes?.length ? known.intakes : [fallbackIntake("Даваа–Бямба · 10:00–18:00")],
    included: known?.included ?? asStringArray(meta.included),
    requirements: known?.requirements ?? asStringArray(meta.requirements),
    priceSource: "official",
  };
}

function mapTravel(row: Record<string, unknown>): Program | null {
  const slug = String(row.slug ?? "");
  if (!slug) return null;
  const known = fixturePrograms.find((p) => p.id === slug || p.id === `travel-${slug}`);
  const amount = num(row.price, known?.plans[0]?.amount ?? 0);
  return {
    id: slug,
    category: "tour",
    title: textOf(row.title as JsonText, known?.title ?? slug),
    subtitle: textOf(row.duration as JsonText, known?.subtitle ?? "Аялал"),
    summary: known?.summary ?? textOf(row.body as JsonText).slice(0, 140),
    body: textOf(row.body as JsonText, known?.body ?? ""),
    image: String(row.image_url || known?.image || ""),
    hanzi: known?.hanzi ?? "旅",
    city: known?.city,
    featured: known?.featured ?? true,
    plans: [{ id: "tour", label: "Багц", amount }],
    intakes: known?.intakes?.length ? known.intakes : [fallbackIntake("Аяллын хуваарь")],
    included: asStringArray(row.highlights).length ? asStringArray(row.highlights) : known?.included ?? [],
    requirements: known?.requirements ?? ["Гадаад паспорт"],
    priceSource: amount > 0 ? "fixture" : "covered",
  };
}

function mapUniversity(row: Record<string, unknown>): Program | null {
  const slug = String(row.slug ?? "");
  if (!slug) return null;
  const known = fixturePrograms.find((p) => p.id === slug);
  const meta = (row.meta ?? {}) as Record<string, unknown>;
  return {
    id: slug,
    category: "scholarship",
    title: textOf(row.title as JsonText, known?.title ?? slug),
    subtitle: textOf(row.city as JsonText, known?.subtitle ?? "Тэтгэлэг"),
    summary: known?.summary ?? textOf(row.body as JsonText).slice(0, 160),
    body: textOf(row.body as JsonText, known?.body ?? ""),
    image: String(row.image_url || known?.image || ""),
    hanzi: known?.hanzi ?? "奖",
    city: textOf(row.city as JsonText, known?.city),
    featured: known?.featured,
    plans: [{ id: "award", label: "Тэтгэлэг", amount: num(meta.price, 0) }],
    intakes: known?.intakes?.length ? known.intakes : [fallbackIntake("Хичээлийн жил")],
    included: known?.included ?? ["Элсэлтийн зөвлөгөө"],
    requirements: known?.requirements ?? ["Паспорт", "Боловсролын баримт"],
    priceSource: "covered",
  };
}

export const liveCatalog: CatalogService = {
  source: "supabase",
  async listPrograms() {
    const supabase = getSupabase();
    if (!supabase) return fixturePrograms;
    const [courses, travel, universities] = await Promise.all([
      supabase.from("courses").select("*").eq("hidden", false).order("sort_order"),
      supabase.from("travel_packages").select("*").eq("hidden", false).order("sort_order"),
      supabase.from("universities").select("*").eq("hidden", false).order("sort_order"),
    ]);
    if (courses.error && travel.error && universities.error) return fixturePrograms;
    const mapped = [
      ...((courses.data ?? []) as Record<string, unknown>[]).map(mapCourse),
      ...((universities.data ?? []) as Record<string, unknown>[]).map(mapUniversity),
      ...((travel.data ?? []) as Record<string, unknown>[]).map(mapTravel),
    ].filter((p): p is Program => Boolean(p && p.intakes.length && p.title));
    return mapped.length ? mapped : fixturePrograms;
  },
};

function kindOf(draft: EnrollmentDraft): "course" | "travel" | "consult" {
  if (draft.program.category === "course") return "course";
  if (draft.program.category === "tour") return "travel";
  return "consult";
}

export const liveEnrollment: EnrollmentService = {
  async create(draft) {
    const supabase = getSupabase();
    if (!supabase) return { remote: false, error: "Supabase тохируулаагүй" };
    const message = [
      `И-мэйл: ${draft.email}`,
      `Хөтөлбөр: ${draft.program.title}`,
      `Элсэлт: ${draft.intake.label}`,
      `Төлөвлөгөө: ${draft.plan.label} · ${draft.plan.amount}`,
      draft.documentsReady.length ? `Материал (тэмдэглэсэн): ${draft.documentsReady.join(", ")}` : "",
      draft.notes,
    ]
      .filter(Boolean)
      .join("\n");
    const base = {
      id: draft.id,
      name: draft.name.slice(0, 80),
      phone: draft.phone.slice(0, 20),
      kind: kindOf(draft),
      interest: (draft.plan.qpayInterest ?? draft.program.id).slice(0, 120),
      message,
    };
    const structured = {
      hsk_level: (draft.program.level ?? draft.program.id).slice(0, 40),
      schedule: draft.intake.id.slice(0, 40),
      plan: draft.plan.id.slice(0, 40),
      plan_price: Math.max(0, Math.round(draft.plan.amount)),
    };
    let { error } = await supabase.from("enrollments").insert({ ...base, ...structured });
    if (error && /hsk_level|schedule|plan_price|plan/.test(error.message)) {
      ({ error } = await supabase.from("enrollments").insert(base));
    }
    if (error) return { remote: false, error: error.message };
    return { remote: true };
  },
};

type QpayPayload = {
  amount?: number;
  qr_image?: string;
  short_url?: string;
  urls?: { name: string; logo: string; link: string }[];
  paid?: boolean;
  error?: string;
};

export const livePayment: PaymentService = {
  mode: "qpay",
  async createInvoice(draft) {
    const supabase = getSupabase();
    if (!supabase) return { unavailable: true, reason: "Supabase тохируулаагүй" };
    if (!draft.plan.qpayPlan || !draft.plan.qpayInterest) {
      return {
        unavailable: true,
        reason:
          "Энэ хөтөлбөр qpay функцын PRICES жагсаалтад байхгүй (одоо зөвхөн intensive m1/m6, kids m9). Нэхэмжлэх үүсгээгүй.",
      };
    }
    if (draft.plan.amount <= 0) {
      return { unavailable: true, reason: "Төлбөргүй хөтөлбөр. QPay нэхэмжлэх үүсэхгүй." };
    }
    const { data, error } = await supabase.functions.invoke<QpayPayload>("qpay", {
      body: { action: "create", id: draft.id },
    });
    if (error || !data?.qr_image) {
      return {
        unavailable: true,
        reason: "QPay нэхэмжлэх нээгдсэнгүй. Merchant эрх эсвэл функц тохируулаагүй байж болно. Хүсэлт хадгалагдсан.",
      };
    }
    const invoice: QpayInvoice = {
      amount: data.amount ?? draft.plan.amount,
      qrImage: data.qr_image,
      shortUrl: data.short_url ?? "",
      urls: data.urls ?? [],
      sandbox: false,
      invoiceId: draft.id,
    };
    return invoice;
  },
  async check(enrollmentId): Promise<PaymentStatus> {
    const supabase = getSupabase();
    if (!supabase) return "pending";
    try {
      const { data, error } = await supabase.functions.invoke<QpayPayload>("qpay", {
        body: { action: "check", id: enrollmentId },
      });
      if (error) return "failed";
      return data?.paid ? "paid" : "pending";
    } catch {
      return "failed";
    }
  },
};

export const liveAuth: AuthService = {
  configured: hasSupabase,
  async getSessionEmail() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.user.email ?? null;
  },
  async signIn(email, password) {
    const supabase = getSupabase();
    if (!supabase) return { error: "Supabase тохируулаагүй" };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: error.message } : {};
  },
  async signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
  },
};
