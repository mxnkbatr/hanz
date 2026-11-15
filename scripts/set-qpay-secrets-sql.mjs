import fs from "fs";
import { Client } from "pg";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const ref = env.SUPABASE_PROJECT_REF;
const pass = env.SUPABASE_DB_PASSWORD;
const client = new Client({
  connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
await client.connect();

await client.query(`
create table if not exists public.qpay_secrets (
  id int primary key default 1 check (id = 1),
  client_id text not null,
  client_secret text not null,
  invoice_code text not null,
  base_url text not null default 'https://merchant.qpay.mn',
  updated_at timestamptz not null default now()
);
alter table public.qpay_secrets enable row level security;
`);

await client.query(
  `insert into public.qpay_secrets (id, client_id, client_secret, invoice_code, base_url)
   values (1, $1, $2, $3, $4)
   on conflict (id) do update set
     client_id = excluded.client_id,
     client_secret = excluded.client_secret,
     invoice_code = excluded.invoice_code,
     base_url = excluded.base_url,
     updated_at = now()`,
  [
    env.QPAY_CLIENT_ID,
    env.QPAY_CLIENT_SECRET,
    env.QPAY_INVOICE_CODE,
    env.QPAY_BASE_URL || "https://merchant.qpay.mn",
  ],
);

const { rows } = await client.query(
  `select client_id, invoice_code, base_url, length(client_secret) as secret_len from public.qpay_secrets where id = 1`,
);
console.log("qpay_secrets OK", rows[0]);
await client.end();
