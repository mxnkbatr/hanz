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

/**
 * Calls the `qpay` edge function (supabase/functions/qpay). Returns null when
 * QPay is not set up yet or fails, so the flow can finish without it.
 */
export async function createQpayInvoice(
  id: string,
  kind: QpayKind = "enroll",
): Promise<QpayInvoice | null> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("qpay", {
      body: { action: "create", id, kind },
    });
    if (error || !data?.qr_image) return null;
    return data as QpayInvoice;
  } catch {
    return null;
  }
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
