-- 1903 Originals customer address book.
-- Apply this migration in Supabase SQL Editor before using saved addresses.
-- Customers can only read and change rows belonging to their own auth account.

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home' check (char_length(label) between 1 and 40),
  recipient_name text not null check (char_length(recipient_name) between 1 and 120),
  phone text not null check (char_length(phone) between 7 and 20),
  address_line1 text not null check (char_length(address_line1) between 1 and 250),
  address_line2 text,
  city text not null check (char_length(city) between 1 and 100),
  state text not null check (char_length(state) between 1 and 100),
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_created_idx
  on public.customer_addresses(user_id, created_at desc);

create unique index if not exists customer_addresses_one_default_idx
  on public.customer_addresses(user_id) where is_default = true;

alter table public.customer_addresses enable row level security;

drop policy if exists "Customers read own addresses" on public.customer_addresses;
create policy "Customers read own addresses"
  on public.customer_addresses for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Customers add own addresses" on public.customer_addresses;
create policy "Customers add own addresses"
  on public.customer_addresses for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Customers update own addresses" on public.customer_addresses;
create policy "Customers update own addresses"
  on public.customer_addresses for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Customers delete own addresses" on public.customer_addresses;
create policy "Customers delete own addresses"
  on public.customer_addresses for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_customer_address_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_addresses_updated_at on public.customer_addresses;
create trigger customer_addresses_updated_at
before update on public.customer_addresses
for each row execute function public.set_customer_address_updated_at();


-- Authenticated customers may view only orders created while signed in.
-- Checkout already records the authenticated user's id in orders.user_id.
alter table public.orders enable row level security;

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);
