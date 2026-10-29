-- Enrollment v2: structured fields + admission pipeline statuses.
-- Run once in Supabase SQL Editor after enrollments.sql and admin.sql. Safe to re-run.

-- What the applicant picked in the form (the readable summary stays in `message`)
alter table public.enrollments add column if not exists hsk_level text;   -- hsk1…hsk6, unknown, or a kids level id
alter table public.enrollments add column if not exists schedule text;    -- e.g. kids_a_am, intensive
alter table public.enrollments add column if not exists plan text;        -- e.g. m1, m6, m9
alter table public.enrollments add column if not exists plan_price integer; -- ₮ at the time of the request
alter table public.enrollments add column if not exists child_name text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_v2_len') then
    alter table public.enrollments
      add constraint enrollments_v2_len check (
        char_length(coalesce(hsk_level, '')) <= 40
        and char_length(coalesce(schedule, '')) <= 40
        and char_length(coalesce(plan, '')) <= 40
        and char_length(coalesce(child_name, '')) <= 80
        and coalesce(plan_price, 0) between 0 and 100000000
      );
  end if;
end $$;

-- Pipeline: new → contacted → placed (level tested) → paid → enrolled, or declined / spam.
-- "done" stays valid for older leads.
alter table public.enrollments drop constraint if exists enrollments_status_check;
alter table public.enrollments
  add constraint enrollments_status_check
  check (status in ('new', 'contacted', 'placed', 'paid', 'enrolled', 'declined', 'done', 'spam'));

-- QPay: the invoice for this enrollment and what was paid (written only by the qpay edge function)
alter table public.enrollments add column if not exists qpay_invoice_id text;
alter table public.enrollments add column if not exists paid_amount integer;
alter table public.enrollments add column if not exists paid_at timestamptz;

-- The public form may insert, but never pre-set the pipeline or payment fields.
create or replace function public.enrollments_insert_guard()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), 'anon') <> 'service_role' then
    new.status := 'new';
    new.admin_note := null;
    new.qpay_invoice_id := null;
    new.paid_amount := null;
    new.paid_at := null;
  end if;
  return new;
end $$;

drop trigger if exists enrollments_insert_guard on public.enrollments;
create trigger enrollments_insert_guard
  before insert on public.enrollments
  for each row execute function public.enrollments_insert_guard();
