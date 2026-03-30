-- SkillTrack initial schema
-- Run this in the Supabase SQL editor or via supabase migrations

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'UTC',
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now()
);

-- Skills table
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text not null default '#059669',
  goal_type text check (goal_type is null or goal_type in ('weekly', 'total')),
  goal_target_hours numeric check (goal_target_hours is null or goal_target_hours > 0),
  created_at timestamptz default now()
);

-- Sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes >= 1),
  date date not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_skills_user on public.skills(user_id);
create index idx_sessions_user_date on public.sessions(user_id, date desc);
create index idx_sessions_user_skill on public.sessions(user_id, skill_id);
create index idx_sessions_skill on public.sessions(skill_id);

-- Unique constraint: no duplicate skill names per user
create unique index idx_skills_user_name on public.skills(user_id, lower(name));

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.sessions enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Skills policies
create policy "Users can read own skills"
  on public.skills for select
  using (auth.uid() = user_id);

create policy "Users can insert own skills"
  on public.skills for insert
  with check (auth.uid() = user_id);

create policy "Users can update own skills"
  on public.skills for update
  using (auth.uid() = user_id);

create policy "Users can delete own skills"
  on public.skills for delete
  using (auth.uid() = user_id);

-- Sessions policies
create policy "Users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on sessions
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute procedure public.update_updated_at();
