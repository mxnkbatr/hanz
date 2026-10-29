# QPay online payment — one-time setup

The enroll flow (/enroll) creates the lead first, then asks the `qpay` edge
function for an invoice. Until QPay is set up the flow still finishes: the
applicant sees "we will send you the payment link" and the lead is in
Admin → Хүсэлтүүд as usual.

## What you need from QPay

Sign a merchant contract with QPay (qpay.mn). They give you:

- `client_id` and `client_secret` (API login)
- `invoice_code` (your merchant invoice template)
- the API address — production `https://merchant.qpay.mn`, or the sandbox
  `https://merchant-sandbox.qpay.mn` for testing

## Steps

1. Run `supabase/enrollments-v2.sql` in the Supabase SQL Editor (adds the
   payment columns and the guard that stops anyone posting a lead as "paid").
2. Deploy and configure the function (from the project folder):

   ```bash
   npx supabase functions deploy qpay --no-verify-jwt
   npx supabase secrets set QPAY_CLIENT_ID=<id> QPAY_CLIENT_SECRET=<secret> QPAY_INVOICE_CODE=<code> QPAY_BASE_URL=https://merchant-sandbox.qpay.mn
   ```

   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function
   automatically.)
3. Test with the sandbox: enrol in the intensive or kids class, pay the QR in
   the QPay sandbox app, and watch the lead turn "Төлбөр төлсөн" in admin.
4. Switch to production: set `QPAY_BASE_URL=https://merchant.qpay.mn` and the
   production credentials.

## How payment is confirmed

- The amount is taken from the saved plan inside the function (`PRICES` in
  `supabase/functions/qpay/index.ts`), never from the browser. Keep it in step
  with the fees in `src/data/hsk.ts`.
- QPay calls the function back after payment; the function then asks QPay's
  `payment/check` API itself before marking the lead paid. The page also checks
  every 5 seconds while the QR is open.
