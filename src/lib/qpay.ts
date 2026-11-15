import { getSupabase } from "./supabase";

export type QpayKind = "enroll" | "shop";

export type QpayInvoice = {
  amount: number;
  /** Base64 PNG of the QR code. */
  qr_image: string;
  short_url: string;
  /** Bank / wallet apps that open the invoice directly on a phone. */
  urls: { name: string; logo: string; link: string }[];
};

type InvokeFail = { invoice: null; error: string };
type InvokeOk = { invoice: QpayInvoice; error: null };

/**
 * Calls the `qpay` edge function (supabase/functions/qpay).
 * Returns a structured result so enroll/shop can show retry instead of a fake “saved” screen.
 */
export async function requestQpayInvoice(
  id: string,
  kind: QpayKind = "enroll",
): Promise<InvokeOk | InvokeFail> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("qpay", {
      body: { action: "create", id, kind },
    });
    if (error) {
      console.error("[qpay create]", error.message, data);
      return { invoice: null, error: error.message || "qpay" };
    }
    if (data?.paid) {
      return {
        invoice: null,
        error: "already_paid",
      };
    }
    if (!data?.qr_image) {
      console.error("[qpay create]", data?.error ?? "no qr", data);
      return { invoice: null, error: String(data?.error ?? "no_payment") };
    }
    return { invoice: data as QpayInvoice, error: null };
  } catch (e) {
    console.error("[qpay create]", e);
    return { invoice: null, error: "network" };
  }
}

/** @deprecated Prefer requestQpayInvoice — kept for call sites that only need the QR. */
export async function createQpayInvoice(
  id: string,
  kind: QpayKind = "enroll",
): Promise<QpayInvoice | null> {
  const r = await requestQpayInvoice(id, kind);
  return r.invoice;
}

export async function checkQpayPaid(
  id: string,
  kind: QpayKind = "enroll",
): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.functions.invoke("qpay", {
      body: { action: "check", id, kind },
    });
    return Boolean(data?.paid);
  } catch {
    return false;
  }
}
