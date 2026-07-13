-- Run this once in your Supabase project's SQL Editor
-- (Dashboard > SQL Editor > New query > paste > Run).

create table if not exists known_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists known_people_user_id_idx on known_people (user_id);

alter table known_people enable row level security;

create policy "Users can view their own known people"
  on known_people for select
  using (auth.uid() = user_id);

create policy "Users can add their own known people"
  on known_people for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own known people"
  on known_people for delete
  using (auth.uid() = user_id);

-- Payment handles (Venmo/Cash App/PayPal username, or Zelle email/phone) used
-- to generate "pay me" links on the Share step.
create table if not exists payment_handles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('venmo', 'cashapp', 'paypal', 'zelle')),
  handle text not null,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists payment_handles_user_id_idx on payment_handles (user_id);

alter table payment_handles enable row level security;

create policy "Users can view their own payment handles"
  on payment_handles for select
  using (auth.uid() = user_id);

create policy "Users can add their own payment handles"
  on payment_handles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own payment handles"
  on payment_handles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own payment handles"
  on payment_handles for delete
  using (auth.uid() = user_id);

-- Named groups of recurring people (e.g. "Roommates", "Poker night") so a
-- whole group can be added to a split in one tap instead of one name at a time.
create table if not exists people_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  member_names text[] not null,
  created_at timestamptz not null default now()
);

create index if not exists people_groups_user_id_idx on people_groups (user_id);

alter table people_groups enable row level security;

create policy "Users can view their own groups"
  on people_groups for select
  using (auth.uid() = user_id);

create policy "Users can add their own groups"
  on people_groups for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own groups"
  on people_groups for delete
  using (auth.uid() = user_id);
