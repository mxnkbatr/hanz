# Enrollment step 1 — one-time setup

## 1. Database (structured fields + new statuses)

Supabase → **SQL Editor** → paste and run `supabase/enrollments-v2.sql`.

Until this runs, the site still saves every enrollment (all choices are in the
message text); the admin's new statuses (Түвшин тогтоосон, Төлбөр төлсөн,
Ангид орсон, Татгалзсан) can only be saved after it.

## 2. E-mail on every new enrollment

1. Create a free account at <https://resend.com>, add and verify your domain
   (or use Resend's test sender while trying it), and create an API key.
2. Deploy the function (Supabase CLI, from the project folder):

   ```bash
   npx supabase login
   npx supabase link --project-ref <SUPABASE_PROJECT_REF>
   npx supabase functions deploy notify-enrollment --no-verify-jwt
   npx supabase secrets set RESEND_API_KEY=<key> NOTIFY_TO=surgalthanz@gmail.com NOTIFY_FROM="Hanz Academy <leads@your-domain.mn>" WEBHOOK_SECRET=<long random string>
   ```

3. Supabase → **Database → Webhooks → Create a new hook**
   - Table: `enrollments`, Events: **Insert**
   - Type: **Supabase Edge Functions** → `notify-enrollment`, method POST
   - HTTP headers: add `x-webhook-secret` = the same WEBHOOK_SECRET

4. Send a test enrollment on the site; the e-mail should arrive within a minute.
   Logs: Supabase → Edge Functions → notify-enrollment → Logs.
