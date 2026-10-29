// Supabase Edge Function: QPay payment for an enrollment.
//
//   POST { action: "create", id }  → invoice for that enrollment (QR + bank app links)
//   POST { action: "check",  id }  → { paid } after asking QPay; marks the lead paid
//   GET/POST ?action=callback&id=… → QPay's callback; re-checks with QPay, never trusts the body
//
// The amount always comes from the saved plan (PRICES below), never from the browser.
// Deploy with --no-verify-jwt (QPay's callback carries no Supabase token). See
// supabase/QPAY_SETUP.md for the secrets.
import { createClient } from "jsr:@supabase/supabase-js@2";

/** ₮ per programme and plan; keep in step with src/data/hsk.ts. */
const PRICES: Record<string, Record<string, number>> = {
  intensive: { m1: 1_800_000, m6: 4_800_000 },
  kids: { m9: 4_800_000 },
};

const env = (k: string) => Deno.env.get(k) ?? "";
const QPAY = env("QPAY_BASE_URL") || "https://merchant.qpay.mn";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

async function qpayToken(): Promise<string> {
  const res = await fetch(`${QPAY}/v2/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${env("QPAY_CLIENT_ID")}:${env("QPAY_CLIENT_SECRET")}`)}` },
  });
  if (!res.ok) throw new Error(`qpay auth ${res.status}`);
  return (await res.json()).access_token;
}

type Row = {
  id: string;
  name: string;
  interest: string;
  plan: string | null;
  status: string;
  qpay_invoice_id: string | null;
};

async function loadRow(id: string): Promise<Row | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db
    .from("enrollments")
    .select("id,name,interest,plan,status,qpay_invoice_id")
    .eq("id", id)
    .maybeSingle();
  return (data as Row) ?? null;
}

/** Ask QPay whether the invoice is paid; record it on the lead if so. */
async function checkPaid(row: Row): Promise<boolean> {
  if (!row.qpay_invoice_id) return false;
  if (row.status === "paid" || row.status === "enrolled") return true;
  const token = await qpayToken();
  const res = await fetch(`${QPAY}/v2/payment/check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: row.qpay_invoice_id,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });
  if (!res.ok) throw new Error(`qpay check ${res.status}`);
  const body = await res.json();
  const paidRow = (body.rows ?? []).find((r: { payment_status?: string }) => r.payment_status === "PAID");
  if (!paidRow) return false;
  await db
    .from("enrollments")
    .update({
      status: "paid",
      paid_amount: Math.round(Number(body.paid_amount ?? paidRow.payment_amount ?? 0)),
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  try {
    // QPay → us after a payment. Only the id in our own callback URL is used.
    if (url.searchParams.get("action") === "callback") {
      const row = await loadRow(url.searchParams.get("id") ?? "");
      if (row) await checkPaid(row);
      return new Response("SUCCESS", { headers: cors });
    }

    if (req.method !== "POST") return json({ error: "method" }, 405);
    const { action, id } = await req.json().catch(() => ({}));
    const row = await loadRow(String(id ?? ""));
    if (!row) return json({ error: "not_found" }, 404);

    if (action === "check") return json({ paid: await checkPaid(row) });

    if (action === "create") {
      const amount = PRICES[row.interest]?.[row.plan ?? ""];
      if (!amount) return json({ error: "no_payment" }, 400);
      if (row.status === "paid" || row.status === "enrolled") return json({ paid: true });

      const token = await qpayToken();
      const callback = `${env("SUPABASE_URL")}/functions/v1/qpay?action=callback&id=${row.id}`;
      const res = await fetch(`${QPAY}/v2/invoice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_code: env("QPAY_INVOICE_CODE"),
          sender_invoice_no: row.id.replace(/-/g, "").slice(0, 32),
          invoice_receiver_code: "terminal",
          invoice_description: `Hanz Academy · ${row.interest} · ${row.plan} · ${row.name}`.slice(0, 255),
          amount,
          callback_url: callback,
        }),
      });
      if (!res.ok) {
        console.error("qpay invoice", res.status, await res.text());
        return json({ error: "qpay_invoice" }, 502);
      }
      const inv = await res.json();
      await db.from("enrollments").update({ qpay_invoice_id: inv.invoice_id }).eq("id", row.id);
      return json({
        amount,
        qr_image: inv.qr_image as string,
        short_url: inv.qPay_shortUrl as string,
        urls: (inv.urls ?? []).map((u: { name: string; description: string; logo: string; link: string }) => ({
          name: u.description || u.name,
          logo: u.logo,
          link: u.link,
        })),
      });
    }

    return json({ error: "action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
});
