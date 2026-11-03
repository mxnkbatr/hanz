-- Enrollment anket: the academy's student form ("Суралцагчийн анкет 2026") as filled in
-- on the site — register number, gender, age, contacts, occupation, emergency
-- contacts, address, source, scholarship / language-prep answers, agreement.
-- Run once in Supabase SQL Editor after enrollments-v2.sql. Safe to re-run.
-- Until it is run the form still works: the answers stay readable in `message`.

alter table public.enrollments add column if not exists anket jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'enrollments_anket_size') then
    alter table public.enrollments
      add constraint enrollments_anket_size check (
        anket is null or (jsonb_typeof(anket) = 'object' and octet_length(anket::text) <= 8000)
      );
  end if;
end $$;
