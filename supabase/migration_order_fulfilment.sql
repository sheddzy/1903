create table if not exists public.order_fulfillments (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null unique references public.orders(id) on delete cascade,
 status text not null default 'unfulfilled' check(status in ('unfulfilled','processing','packed','shipped','delivered','returned','cancelled')),
 courier text,
 tracking_number text,
 tracking_url text,
 staff_note text,
 shipped_at timestamptz,
 delivered_at timestamptz,
 updated_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists order_fulfillments_status_idx on public.order_fulfillments(status);
alter table public.order_fulfillments enable row level security;
