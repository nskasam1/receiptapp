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
