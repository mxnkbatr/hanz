# QPay online payment — one-time setup

Used by:

- **Enrol** (`/enroll`) — course plans (HSK month / 6-month)
- **Shop** (`/shop/:id` → Худалдан авах) — book orders (`shop_orders`)

Both create a row first, then ask the `qpay` edge function for an invoice.
Until QPay is set up the flow still finishes without a QR.

## What you need from QPay

Sign a merchant contract with QPay (qpay.mn). They give you:

- `client_id` and `client_secret` (API login)
- `invoice_code` (your merchant invoice template)
- the API address — production `https://merchant.qpay.mn`, or the sandbox
  `https://merchant-sandbox.qpay.mn` for testing

## Steps

1. Run (once) in SQL Editor or via scripts:
   - `supabase/enrollments-v2.sql`
   - `supabase/shop_orders.sql`
   - optional: `node scripts/set-qpay-secrets-sql.mjs` (stores creds in
     `public.qpay_secrets` for the function to read if env secrets are empty)
2. Create an access token: Supabase → Account → Access Tokens, then:

   ```bash
   set SUPABASE_ACCESS_TOKEN=sbp_...
   # put QPAY_CLIENT_ID / QPAY_CLIENT_SECRET / QPAY_INVOICE_CODE / QPAY_BASE_URL in .env.local
   node scripts/deploy-qpay.mjs
   ```

   Or manually:

   ```bash
   npx supabase secrets set QPAY_CLIENT_ID=... QPAY_CLIENT_SECRET=... QPAY_INVOICE_CODE=... QPAY_BASE_URL=https://merchant.qpay.mn --project-ref <ref>
   npx supabase functions deploy qpay --no-verify-jwt --project-ref <ref>
   ```

   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)
3. Test: buy a book in `/shop` or enrol with a paid plan — QR should appear;
   after payment the row status becomes `paid`.

## How payment is confirmed

- The amount is taken from the saved plan inside the function (`PRICES` in
  `supabase/functions/qpay/index.ts`), never from the browser. Keep it in step
  with the fees in `src/data/hsk.ts`.
- QPay calls the function back after payment; the function then asks QPay's
  `payment/check` API itself before marking the lead paid. The page also checks
  every 5 seconds while the QR is open.
