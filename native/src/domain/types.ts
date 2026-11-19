export type Category = "course" | "scholarship" | "tour";

export type Stage = "beginner" | "intermediate" | "advanced";

export type PriceSource = "official" | "fixture" | "covered";

/** A payable plan. `qpayInterest` + `qpayPlan` match PRICES in supabase/functions/qpay. */
export type Plan = {
  id: string;
  label: string;
  amount: number;
  qpayInterest?: "intensive" | "kids";
  qpayPlan?: "m1" | "m6" | "m9";
};

export type Intake = {
  id: string;
  label: string;
  start: string;
  end: string;
  deadline: string;
  seats: number;
  schedule: string;
};

export type Program = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  image: string;
  hanzi: string;
  level?: string;
  stage?: Stage;
  city?: string;
  featured?: boolean;
  plans: Plan[];
  intakes: Intake[];
  included: string[];
  requirements: string[];
  priceSource: PriceSource;
};

export type EnrollmentStatus = "submitted" | "paid" | "accepted" | "failed";

export type PaymentState = "pending" | "paid" | "failed" | "none";

export type LocalEnrollment = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  programId: string;
  programTitle: string;
  category: Category;
  intakeId: string;
  intakeLabel: string;
  planId: string;
  planLabel: string;
  amount: number;
  status: EnrollmentStatus;
  payment: PaymentState;
  /** True when the invoice came from the sandbox, not QPay. */
  sandbox: boolean;
  /** Seeded sample row, not a user submission. */
  demo?: boolean;
  remote: boolean;
};

export type EnrollmentDraft = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  program: Program;
  intake: Intake;
  plan: Plan;
  documentsReady: string[];
};

export type QpayBankLink = {
  name: string;
  logo: string;
  link: string;
};

export type QpayInvoice = {
  amount: number;
  /** Base64 PNG (real QPay) or empty when the client draws a sandbox mark. */
  qrImage: string;
  shortUrl: string;
  urls: QpayBankLink[];
  sandbox: boolean;
  invoiceId: string;
};

export type PaymentStatus = "pending" | "paid" | "failed";

export type GuestProfile = {
  name: string;
  phone: string;
  email: string;
};

export type CatalogSource = "fixture" | "supabase";
