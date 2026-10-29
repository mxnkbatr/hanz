// Supabase Edge Function: e-mail the academy when a new enrollment arrives.
//
// Called by a Database Webhook on INSERT into public.enrollments (see
// supabase/NOTIFY_SETUP.md). Sends through Resend (https://resend.com).
//
// Secrets (supabase secrets set …):
//   RESEND_API_KEY   Resend API key
//   NOTIFY_TO        where to send, e.g. surgalthanz@gmail.com (comma-separated for several)
//   NOTIFY_FROM      sender, e.g. "Hanz Academy <leads@your-domain.mn>" (a domain verified in Resend)
//   WEBHOOK_SECRET   random string; the webhook sends it in the x-webhook-secret header

type Enrollment = {
  name?: string;
  phone?: string;
  kind?: string;
  interest?: string;
  message?: string | null;
  child_age?: string | null;
  created_at?: string;
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  let record: Enrollment | undefined;
  try {
    const body = await req.json();
    if (body?.type !== "INSERT" || body?.table !== "enrollments") {
      return new Response("ignored", { status: 200 });
    }
    record = body.record as Enrollment;
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const key = Deno.env.get("RESEND_API_KEY");
  const to = (Deno.env.get("NOTIFY_TO") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = Deno.env.get("NOTIFY_FROM");
  if (!key || !to.length || !from) return new Response("not configured", { status: 500 });

  const subject = `Шинэ бүртгэл: ${record.name ?? ""} · ${record.interest ?? ""}`.slice(0, 150);
  const html = `
    <h2 style="font-family:sans-serif">Шинэ бүртгэлийн хүсэлт</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#666">Нэр</td><td><b>${esc(record.name)}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Утас</td><td><a href="tel:${esc(record.phone)}">${esc(record.phone)}</a></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Төрөл</td><td>${esc(record.kind)} · ${esc(record.interest)}</td></tr>
      ${record.child_age ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Хүүхдийн нас</td><td>${esc(record.child_age)}</td></tr>` : ""}
    </table>
    <pre style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;background:#f6f3ef;padding:12px;border-radius:8px">${esc(record.message)}</pre>
    <p style="font-family:sans-serif;font-size:13px;color:#666">Admin → Хүсэлтүүд хэсгээс төлөвийг шинэчлээрэй.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error("resend failed", res.status, await res.text());
    return new Response("send failed", { status: 502 });
  }
  return new Response("ok", { status: 200 });
});
