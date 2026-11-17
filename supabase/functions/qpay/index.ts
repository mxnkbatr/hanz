// Supabase Edge Function: QPay for enrollments and shop orders.
//
//   POST { action: "create", id, kind? }  → invoice (QR + bank app links)
//   POST { action: "check",  id, kind? }  → { paid }
//   GET/POST ?action=callback&id=…&kind=… → QPay callback
//
// Amount never comes from the browser: enrollments use PRICES;
// shop orders use public.products.price (fallback FALLBACK_SHOP).
// Deploy with --no-verify-jwt. See supabase/QPAY_SETUP.md.
import { createClient } from "jsr:@supabase/supabase-js@2";

/** ₮ per programme and plan; keep in step with src/data/content.ts → hskFees. */
const PRICES: Record<string, Record<string, number>> = {
  intensive: { m1: 1_800_000, m6: 4_800_000 },
  kids: { m9: 4_800_000 },
};

/** Fallback if the products row is missing (matches content.ts shopProductsMeta). */
const FALLBACK_SHOP: Record<string, number> = {
  prod5: 25_000,
  prod6: 15_000,
};

const env = (k: string) => Deno.env.get(k) ?? "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

type QpayCreds = {
  client_id: string;
  client_secret: string;
  invoice_code: string;
  base_url: string;
};

/** Env secrets first; falls back to public.qpay_secrets (service role only / no RLS policies). */
async function qpayCreds(): Promise<QpayCreds> {
  const fromEnv = {
    client_id: env("QPAY_CLIENT_ID"),
    client_secret: env("QPAY_CLIENT_SECRET"),
    invoice_code: env("QPAY_INVOICE_CODE"),
    base_url: env("QPAY_BASE_URL") || "https://merchant.qpay.mn",
  };
  if (fromEnv.client_id && fromEnv.client_secret && fromEnv.invoice_code) return fromEnv;
  const { data } = await db.from("qpay_secrets").select("*").eq("id", 1).maybeSingle();
  if (!data?.client_id || !data?.client_secret || !data?.invoice_code) {
    throw new Error("qpay credentials missing");
  }
  return {
    client_id: data.client_id,
    client_secret: data.client_secret,
    invoice_code: data.invoice_code,
    base_url: data.base_url || "https://merchant.qpay.mn",
  };
}

async function qpayToken(creds: QpayCreds): Promise<string> {
  const res = await fetch(`${creds.base_url}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${creds.client_id}:${creds.client_secret}`)}`,
    },
  });
  if (!res.ok) throw new Error(`qpay auth ${res.status}`);
  return (await res.json()).access_token;
}

type Kind = "enroll" | "shop";

type EnrollRow = {
  id: string;
  name: string;
  interest: string;
  plan: string | null;
  plan_price: number | null;
  status: string;
  qpay_invoice_id: string | null;
};

type ShopRow = {
  id: string;
  name: string;
  product_id: string;
  product_title: string;
  amount: number;
  status: string;
  qpay_invoice_id: string | null;
};

type Target =
  | { kind: "enroll"; row: EnrollRow }
  | { kind: "shop"; row: ShopRow };

function uuidOk(id: string) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

async function loadTarget(id: string, prefer?: Kind): Promise<Target | null> {
  if (!uuidOk(id)) return null;
  const tryShop = async (): Promise<Target | null> => {
    const { data } = await db
      .from("shop_orders")
      .select("id,name,product_id,product_title,amount,status,qpay_invoice_id")
      .eq("id", id)
      .maybeSingle();
    return data ? { kind: "shop", row: data as ShopRow } : null;
  };
  const tryEnroll = async (): Promise<Target | null> => {
    const { data } = await db
      .from("enrollments")
      .select("id,name,interest,plan,plan_price,status,qpay_invoice_id")
      .eq("id", id)
      .maybeSingle();
    return data ? { kind: "enroll", row: data as EnrollRow } : null;
  };
  if (prefer === "shop") return (await tryShop()) ?? (await tryEnroll());
  if (prefer === "enroll") return (await tryEnroll()) ?? (await tryShop());
  return (await tryEnroll()) ?? (await tryShop());
}

async function shopCatalogPrice(productId: string): Promise<number | null> {
  const { data } = await db
    .from("products")
    .select("price,hidden,in_stock")
    .eq("slug", productId)
    .maybeSingle();
  if (data && !data.hidden && data.in_stock !== false) {
    const n = Math.round(Number(data.price));
    if (n > 0) return n;
  }
  return FALLBACK_SHOP[productId] ?? null;
}

async function checkPaid(target: Target): Promise<boolean> {
  const row = target.row;
  if (!row.qpay_invoice_id) return false;
  if (row.status === "paid" || row.status === "enrolled" || row.status === "shipped") {
    return true;
  }
  const creds = await qpayCreds();
  const token = await qpayToken(creds);
  const res = await fetch(`${creds.base_url}/v2/payment/check`, {
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
  const paidRow = (body.rows ?? []).find(
    (r: { payment_status?: string }) => r.payment_status === "PAID",
  );
  if (!paidRow) return false;
  const paidAmount = Math.round(Number(body.paid_amount ?? paidRow.payment_amount ?? 0));
  const patch = {
    status: "paid",
    paid_amount: paidAmount,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (target.kind === "enroll") {
    await db.from("enrollments").update(patch).eq("id", row.id);
  } else {
    await db.from("shop_orders").update(patch).eq("id", row.id);
  }
  return true;
}

async function createInvoice(target: Target) {
  let amount = 0;
  let description = "";
  if (target.kind === "enroll") {
    const r = target.row;
    // Always the list price: the academy runs no discounts (2026-11-17), and a price
    // saved by the browser must never decide what is charged.
    amount = PRICES[r.interest]?.[r.plan ?? ""] ?? 0;
    if (!amount) return json({ error: "no_payment" }, 400);
    description = `Hanz Academy · ${r.interest} · ${r.plan} · ${r.name}`;
  } else {
    const r = target.row;
    const catalog = await shopCatalogPrice(r.product_id);
    if (!catalog) return json({ error: "no_payment" }, 400);
    amount = catalog;
    if (r.amount !== catalog) {
      await db.from("shop_orders").update({ amount: catalog }).eq("id", r.id);
    }
    description = `Hanz Shop · ${r.product_title || r.product_id} · ${r.name}`;
  }
  if (!amount) return json({ error: "no_payment" }, 400);

  const row = target.row;
  if (row.status === "paid" || row.status === "enrolled" || row.status === "shipped") {
    return json({ paid: true });
  }

  const creds = await qpayCreds();
  const token = await qpayToken(creds);
  const kindQ = target.kind === "shop" ? "&kind=shop" : "";
  const callback =
    `${env("SUPABASE_URL")}/functions/v1/qpay?action=callback&id=${row.id}${kindQ}`;
  const res = await fetch(`${creds.base_url}/v2/invoice`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      invoice_code: creds.invoice_code,
      sender_invoice_no: row.id.replace(/-/g, "").slice(0, 32),
      invoice_receiver_code: "terminal",
      invoice_description: description.slice(0, 255),
      amount,
      callback_url: callback,
    }),
  });
  if (!res.ok) {
    console.error("qpay invoice", res.status, await res.text());
    return json({ error: "qpay_invoice" }, 502);
  }
  const inv = await res.json();
  const table = target.kind === "shop" ? "shop_orders" : "enrollments";
  await db.from(table).update({ qpay_invoice_id: inv.invoice_id }).eq("id", row.id);
  return json({
    amount,
    qr_image: inv.qr_image as string,
    short_url: inv.qPay_shortUrl as string,
    urls: (inv.urls ?? []).map(
      (u: { name: string; description: string; logo: string; link: string }) => ({
        name: u.description || u.name,
        logo: u.logo,
        link: u.link,
      }),
    ),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  try {
    if (url.searchParams.get("action") === "callback") {
      const prefer = url.searchParams.get("kind") === "shop" ? "shop" : "enroll";
      const target = await loadTarget(url.searchParams.get("id") ?? "", prefer as Kind);
      if (target) await checkPaid(target);
      return new Response("SUCCESS", { headers: cors });
    }

    if (req.method !== "POST") return json({ error: "method" }, 405);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const id = String(body.id ?? "");
    const prefer: Kind | undefined =
      body.kind === "shop" ? "shop" : body.kind === "enroll" ? "enroll" : undefined;
    const target = await loadTarget(id, prefer);
    if (!target) return json({ error: "not_found" }, 404);

    if (action === "check") return json({ paid: await checkPaid(target) });
    if (action === "create") return await createInvoice(target);
    return json({ error: "action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
});
