import type {
  CatalogSource,
  EnrollmentDraft,
  GuestProfile,
  LocalEnrollment,
  PaymentStatus,
  Program,
  QpayInvoice,
} from "../domain/types";

export interface CatalogService {
  source: CatalogSource;
  listPrograms(): Promise<Program[]>;
}

export interface EnrollmentService {
  /**
   * Inserts into public.enrollments when Supabase is live.
   * Returns remote:false when the insert did not happen (preview, or the request failed
   * and the caller kept a local copy).
   */
  create(draft: EnrollmentDraft): Promise<{ remote: boolean; error?: string }>;
}

/**
 * Payment boundary.
 *
 * Live mode calls the existing `qpay` edge function:
 *   POST { action: "create", id } → { amount, qr_image, short_url, urls }
 *   POST { action: "check", id }  → { paid }
 * Amounts are decided server-side from PRICES (intensive m1/m6, kids m9).
 *
 * Sandbox mode never talks to QPay. `sandboxSettle` / `sandboxFail` exist only there.
 */
export interface PaymentService {
  mode: "qpay" | "sandbox";
  createInvoice(draft: EnrollmentDraft): Promise<QpayInvoice | { unavailable: true; reason: string }>;
  check(enrollmentId: string): Promise<PaymentStatus>;
  sandboxSettle?(enrollmentId: string): Promise<void>;
  sandboxFail?(enrollmentId: string): Promise<void>;
}

export interface AuthService {
  configured: boolean;
  getSessionEmail(): Promise<string | null>;
  signIn(email: string, password: string): Promise<{ error?: string }>;
  signOut(): Promise<void>;
}

export type Services = {
  catalog: CatalogService;
  enrollment: EnrollmentService;
  payment: PaymentService;
  auth: AuthService;
};

export type StoredState = {
  enrollments: LocalEnrollment[];
  profile: GuestProfile;
  onboarded: boolean;
  theme: "light" | "dark" | "system";
};
