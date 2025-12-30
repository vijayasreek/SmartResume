/*
  # Initial Schema Setup for Smart Resume Builder

  ## Query Description:
  Sets up the `profiles` and `resumes` tables with Row Level Security (RLS) to ensure users can only access their own data.
  Includes a trigger to automatically create a profile when a user signs up via Supabase Auth.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - public.profiles: Stores user details (name, email) linked to auth.users
  - public.resumes: Stores resume JSON data (personal_info, experience, etc.)

  ## Security Implications:
  - RLS Enabled on all tables.
  - Policies restrict access to owner (auth.uid() = user_id).
*/

-- Create profiles table to extend auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Create resumes table
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  field text default 'General',
  personal_info jsonb default '{}'::jsonb,
  experience jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  skills text[] default array[]::text[],
  languages text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resumes enable row level security;

create policy "Users can view own resumes" 
  on public.resumes for select 
  using (auth.uid() = user_id);

create policy "Users can insert own resumes" 
  on public.resumes for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own resumes" 
  on public.resumes for update 
  using (auth.uid() = user_id);

create policy "Users can delete own resumes" 
  on public.resumes for delete 
  using (auth.uid() = user_id);

-- Function to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
