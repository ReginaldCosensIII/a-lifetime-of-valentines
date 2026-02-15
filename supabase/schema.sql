
-- Clean up existing tables (Optional: Comment out if you want to preserve data, but strictly required if changing structure deeply)
-- DROP TABLE IF EXISTS public.media CASCADE;
-- DROP TABLE IF EXISTS public.couples CASCADE;

-- Create a table for couples (Existing)
create table if not exists public.couples (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_user_id uuid references auth.users(id) not null,
  partner_user_id uuid references auth.users(id),
  partner_email text,
  invite_code text unique not null,
  partner_temp_password text,
  constraint unique_owner unique (owner_user_id),
  constraint unique_partner unique (partner_user_id)
);

-- Create a table for Valentine's Plans (Entries)
create table if not exists public.entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null, -- e.g. "Dinner at Luigi's"
  event_date date not null, -- e.g. 2024-02-14
  location text,
  notes text,
  year int generated always as (date_part('year', event_date)) stored
);

-- Create a table for media (Existing - updated with year/entry link optional)
create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  type text check (type in ('image', 'video')) not null,
  storage_path text not null,
  caption text,
  entry_id uuid references public.entries(id) on delete set null, -- Link to a specific plan
  event_year int -- Manual override if not linked to an entry
);

-- Enable RLS
alter table public.couples enable row level security;
alter table public.media enable row level security;
alter table public.entries enable row level security;

-- COUPLES POLICIES (Existing)
create policy "Enable read access for members" on public.couples for select to authenticated
using ( auth.uid() = owner_user_id OR auth.uid() = partner_user_id );

create policy "Enable insert for new owners" on public.couples for insert to authenticated
with check (auth.uid() = owner_user_id);

create policy "Enable update for members" on public.couples for update to authenticated
using (auth.uid() = owner_user_id OR auth.uid() = partner_user_id OR partner_user_id IS NULL)
with check (auth.uid() = owner_user_id OR (partner_user_id = auth.uid()));

-- ENTRIES POLICIES
create policy "Couple access entries" on public.entries for all to authenticated
using (
    exists (
        select 1 from public.couples c 
        where c.id = entries.couple_id 
        and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
    )
);

-- MEDIA POLICIES (Existing)
create policy "Enable full access for couple members" on public.media for all to authenticated
using (
    exists (
        select 1 from public.couples c 
        where c.id = media.couple_id 
        and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
    )
);

-- STORAGE (Existing)
insert into storage.buckets (id, name, public) values ('memories', 'memories', true)
on conflict (id) do nothing;

DROP POLICY IF EXISTS "Couple Access" ON storage.objects;
create policy "Couple Access" on storage.objects for all to authenticated
using ( bucket_id = 'memories' )
with check ( bucket_id = 'memories' );
