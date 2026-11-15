-- Shop orders paid with QPay. Run once in Supabase SQL Editor (after cms.sql).
-- Safe to re-run.

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product_id text not null,
  product_title text not null default '',
  amount integer not null check (amount > 0 and amount <= 100000000),
  name text not null,
  phone text not null,
  note text,
  status text not null default 'new'
    check (status in ('new', 'paid', 'shipped', 'cancelled', 'spam')),
  qpay_invoice_id text,
  paid_amount integer,
  paid_at timestamptz,
  admin_note text
);

alter table public.shop_orders enable row level security;

drop policy if exists "anon_insert_shop_orders" on public.shop_orders;
create policy "anon_insert_shop_orders"
  on public.shop_orders
  for insert
  to public
  with check (true);

-- Public may insert only; payment fields are cleared by the trigger below.
create or replace function public.shop_orders_insert_guard()
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
end;
$$;

drop trigger if exists shop_orders_insert_guard on public.shop_orders;
create trigger shop_orders_insert_guard
  before insert on public.shop_orders
  for each row execute function public.shop_orders_insert_guard();

-- Admins can read / update (needs public.is_admin from admin.sql).
drop policy if exists "admin_select_shop_orders" on public.shop_orders;
create policy "admin_select_shop_orders"
  on public.shop_orders for select to authenticated
  using (public.is_admin());

drop policy if exists "admin_update_shop_orders" on public.shop_orders;
create policy "admin_update_shop_orders"
  on public.shop_orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
