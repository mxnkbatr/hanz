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
  `postgresql://postgres:${encodeURIComponent(pass)}@db.${ref}.supabase.co:5432/postgres`,
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

await client.query(fs.readFileSync("supabase/enrollments-anket.sql", "utf8"));
console.log("anket SQL OK");

const cols = await client.query(
  `select column_name, data_type
   from information_schema.columns
   where table_schema = 'public'
     and table_name = 'enrollments'
     and column_name in ('anket','hsk_level','schedule','plan','plan_price','child_name')
   order by 1`,
);
console.log(cols.rows);
await client.end();
