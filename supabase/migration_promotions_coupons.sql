create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  banner_text text,
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_valid_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index if not exists promotions_active_dates_idx on public.promotions (is_active, starts_at, ends_at);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value integer not null check (discount_value > 0),
  minimum_order_minor bigint not null default 0 check (minimum_order_minor >= 0),
  maximum_discount_minor bigint,
  usage_limit integer,
  usage_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_code_unique unique (code),
  constraint coupons_valid_dates check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint coupons_valid_usage check (usage_limit is null or usage_limit >= 1),
  constraint coupons_valid_max_discount check (maximum_discount_minor is null or maximum_discount_minor > 0),
  constraint coupons_percentage_range check (discount_type <> 'percentage' or discount_value <= 100)
);
create index if not exists coupons_active_code_idx on public.coupons (code, is_active);

alter table public.promotions enable row level security;
alter table public.coupons enable row level security;
