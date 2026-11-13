create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  source text,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
alter table public.newsletter_subscribers enable row level security;
create policy newsletter_staff_read on public.newsletter_subscribers
  for select to authenticated using (public.is_staff());
-- Inserts happen only through the server route using the service role.
