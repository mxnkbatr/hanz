/**
 * Deploy the qpay edge function + set secrets.
 * Needs: SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)
 *        and .env.local with QPAY_* + SUPABASE_PROJECT_REF
 *
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   node scripts/deploy-qpay.mjs
 */
import { spawnSync } from "child_process";
import fs from "fs";

const envFile = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Set SUPABASE_ACCESS_TOKEN first (Supabase → Account → Access Tokens).");
  process.exit(1);
}

const ref = envFile.SUPABASE_PROJECT_REF;
const secrets = {
  QPAY_CLIENT_ID: envFile.QPAY_CLIENT_ID,
  QPAY_CLIENT_SECRET: envFile.QPAY_CLIENT_SECRET,
  QPAY_INVOICE_CODE: envFile.QPAY_INVOICE_CODE,
  QPAY_BASE_URL: envFile.QPAY_BASE_URL || "https://merchant.qpay.mn",
};
for (const [k, v] of Object.entries(secrets)) {
  if (!v) {
    console.error(`Missing ${k} in .env.local`);
    process.exit(1);
  }
}

const run = (args) => {
  console.log(">", "npx supabase", args.join(" "));
  const r = spawnSync("npx", ["supabase", ...args], {
    stdio: "inherit",
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: token },
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run([
  "secrets",
  "set",
  ...Object.entries(secrets).map(([k, v]) => `${k}=${v}`),
  "--project-ref",
  ref,
]);
run(["functions", "deploy", "qpay", "--no-verify-jwt", "--project-ref", ref]);
console.log("qpay deployed");
