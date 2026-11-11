import { fixturePrograms } from "../data/fixtures";
import type { EnrollmentDraft, PaymentStatus, QpayInvoice } from "../domain/types";
import type { AuthService, CatalogService, EnrollmentService, PaymentService } from "./types";

const sandboxPaid = new Set<string>();
const sandboxFailed = new Set<string>();

const banks = [
  { name: "QPay", logo: "", link: (id: string) => `qpay://sandbox/invoice/${id}` },
  { name: "Хаан банк", logo: "", link: (id: string) => `khanbank://qpay-sandbox/${id}` },
  { name: "Голомт", logo: "", link: (id: string) => `golomtbank://qpay-sandbox/${id}` },
  { name: "Худалдаа хөгжил", logo: "", link: (id: string) => `tdbbank://qpay-sandbox/${id}` },
  { name: "Төрийн банк", logo: "", link: (id: string) => `statebank://qpay-sandbox/${id}` },
];

export const fixtureCatalog: CatalogService = {
  source: "fixture",
  async listPrograms() {
    return fixturePrograms;
  },
};

export const fixtureEnrollment: EnrollmentService = {
  async create() {
    return { remote: false };
  },
};

export function sandboxInvoice(draft: EnrollmentDraft): QpayInvoice {
  return {
    amount: draft.plan.amount,
    qrImage: "",
    shortUrl: `sandbox://hanz/invoice/${draft.id}`,
    urls: banks.map((b) => ({ name: b.name, logo: b.logo, link: b.link(draft.id) })),
    sandbox: true,
    invoiceId: `sandbox-${draft.id.slice(0, 8)}`,
  };
}

export const sandboxPayment: PaymentService = {
  mode: "sandbox",
  async createInvoice(draft) {
    if (draft.plan.amount <= 0) {
      return {
        unavailable: true,
        reason: "Энэ хөтөлбөрийн сургалтын төлбөр үнэгүй. QPay нэхэмжлэх үүсэхгүй.",
      };
    }
    return sandboxInvoice(draft);
  },
  async check(id): Promise<PaymentStatus> {
    if (sandboxFailed.has(id)) return "failed";
    if (sandboxPaid.has(id)) return "paid";
    return "pending";
  },
  async sandboxSettle(id) {
    sandboxFailed.delete(id);
    sandboxPaid.add(id);
  },
  async sandboxFail(id) {
    sandboxPaid.delete(id);
    sandboxFailed.add(id);
  },
};

export const guestAuth: AuthService = {
  configured: false,
  async getSessionEmail() {
    return null;
  },
  async signIn() {
    return { error: "Supabase auth тохируулаагүй. Зочин горимоор утсаараа элсэнэ." };
  },
  async signOut() {},
};
