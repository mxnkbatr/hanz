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
const urls = [
  `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
];

let client;
for (const connectionString of urls) {
  const c = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await c.connect();
    client = c;
    console.log("CONNECTED");
    break;
  } catch (e) {
    console.log("fail", String(e.message).slice(0, 140));
  }
}
if (!client) {
  console.error("NO_CONN");
  process.exit(1);
}

await client.query(fs.readFileSync("supabase/shop_orders.sql", "utf8"));
console.log("shop_orders SQL OK");
const cols = await client.query(
  `select column_name from information_schema.columns
   where table_schema='public' and table_name='shop_orders' order by 1`,
);
console.log(cols.rows.map((r) => r.column_name).join(", "));
await client.end();
