
-- ==========================================
-- A LIFETIME OF VALENTINES - COMPLETE SCHEMA
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. TABLES

-- Couples Table (Core)
create table if not exists public.couples (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_user_id uuid references auth.users(id) not null,
  partner_user_id uuid references auth.users(id),
  partner_email text,
  invite_code text unique not null,
  partner_temp_password text,
  status text default 'pending', -- 'pending' (Demo Mode), 'active' (Journey Started)
  partner_message text,
  partner_message_sender uuid references auth.users(id),
  partner_message_at timestamp with time zone,
  constraint unique_owner unique (owner_user_id),
  constraint unique_partner unique (partner_user_id)
);

-- Entries Table (Timeline Plans)
create table if not exists public.entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  event_date date not null,
  location text,
  notes text,
  year int generated always as (date_part('year', event_date)) stored
);

-- Media Table (Photos/Videos)
create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  type text check (type in ('image', 'video')) not null,
  storage_path text not null,
  caption text,
  entry_id uuid references public.entries(id) on delete set null,
  event_year int
);

-- Email Schedules (Future Feature)
create table if not exists public.email_schedules (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  send_at timestamp with time zone not null,
  subject text,
  content text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed'))
);

-- Shared Links (Public View)
create table if not exists public.shared_links (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone not null,
  is_active boolean default true
);

-- 3. ROW LEVEL SECURITY (RLS)

alter table public.couples enable row level security;
alter table public.media enable row level security;
alter table public.entries enable row level security;
alter table public.email_schedules enable row level security;
alter table public.shared_links enable row level security;

-- Couples Policies
create policy "Enable read access for members" on public.couples for select to authenticated
using ( auth.uid() = owner_user_id OR auth.uid() = partner_user_id );

create policy "Enable insert for new owners" on public.couples for insert to authenticated
with check (auth.uid() = owner_user_id);

create policy "Enable update for members" on public.couples for update to authenticated
using (auth.uid() = owner_user_id OR auth.uid() = partner_user_id OR partner_user_id IS NULL)
with check (auth.uid() = owner_user_id OR (partner_user_id = auth.uid()));

-- Entries Policies
create policy "Couple access entries" on public.entries for all to authenticated
using (exists (select 1 from public.couples c where c.id = entries.couple_id and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())));

-- Media Policies
create policy "Enable full access for couple members" on public.media for all to authenticated
using (exists (select 1 from public.couples c where c.id = media.couple_id and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())));

-- Email Schedules Policies
create policy "Couple access email_schedules" on public.email_schedules for all to authenticated
using (exists (select 1 from public.couples c where c.id = email_schedules.couple_id and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())));

-- Shared Links Policies
create policy "Couple manage shared_links" on public.shared_links for all to authenticated
using (exists (select 1 from public.couples c where c.id = shared_links.couple_id and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())));

create policy "Public read shared_links" on public.shared_links for select to anon, authenticated
using ( true );


-- 4. STORAGE POLICIES

insert into storage.buckets (id, name, public) values ('memories', 'memories', true)
on conflict (id) do nothing;

DROP POLICY IF EXISTS "Couple Access" ON storage.objects;
create policy "Couple Access" on storage.objects for all to authenticated
using ( bucket_id = 'memories' )
with check ( bucket_id = 'memories' );


-- 5. FUNCTIONS & RPCs

-- Check System Status (Lock status)
create or replace function public.get_system_status()
returns json language plpgsql security definer as $$
declare
  couple_count int;
  is_locked boolean;
begin
  select count(*) into couple_count from public.couples;
  is_locked := false;
  if couple_count > 0 then
     if exists (select 1 from public.couples where partner_user_id is not null) then
        is_locked := true;
     end if;
  end if;
  return json_build_object('is_locked', is_locked, 'is_signup_locked', (couple_count > 0), 'couple_count', couple_count);
end;
$$;
grant execute on function public.get_system_status() to anon, authenticated, service_role;

-- Prevent Multiple Couples (Singleton Enforcement)
create or replace function public.prevent_multiple_couples()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.couples) > 0 then
    raise exception 'System Locked: A couple already exists. This instance allows only one couple.';
  end if;
  return new;
end;
$$;

drop trigger if exists check_singleton_couple on public.couples;
create trigger check_singleton_couple
before insert on public.couples
for each row execute function public.prevent_multiple_couples();

-- Link Partner (Secure RPC)
create or replace function public.link_partner(invite_code_input text, email_input text)
returns json language plpgsql security definer as $$
declare
  target_couple_id uuid;
begin
  select id into target_couple_id
  from public.couples
  where invite_code = invite_code_input
    and partner_email = email_input
    and partner_user_id is null;

  if target_couple_id is null then
    return json_build_object('success', false, 'error', 'Invalid invite code or email mismatch.');
  end if;

  update public.couples
  set partner_user_id = auth.uid(), partner_temp_password = null, status = 'active'
  where id = target_couple_id;

  return json_build_object('success', true, 'couple_id', target_couple_id);
end;
$$;
grant execute on function public.link_partner(text, text) to authenticated;

-- Get Shared Timeline (Public Access)
create or replace function public.get_shared_timeline(limit_token text)
returns json language plpgsql security definer as $$
declare
  target_couple_id uuid;
  media_data json;
  plans_data json;
begin
  select couple_id into target_couple_id from public.shared_links where token = limit_token and is_active = true and expires_at > now();
  if target_couple_id is null then return null; end if;

  select json_agg(json_build_object('id', m.id, 'type', m.type, 'url', m.storage_path, 'caption', m.caption, 'year', m.event_year, 'created_at', m.created_at) order by m.created_at desc) into media_data from public.media m where m.couple_id = target_couple_id;
  select json_agg(json_build_object('id', e.id, 'title', e.title, 'date', e.event_date, 'location', e.location, 'notes', e.notes, 'created_at', e.created_at) order by e.event_date asc) into plans_data from public.entries e where e.couple_id = target_couple_id;

  return json_build_object('media', coalesce(media_data, '[]'::json), 'plans', coalesce(plans_data, '[]'::json));
end;
$$;
grant execute on function public.get_shared_timeline(text) to anon, authenticated;


-- 6. FAIL-SAFE USER CREATION TRIGGER

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_invite_code text;
  new_temp_password text;
begin
  begin
      new_invite_code := upper(substring(md5(random()::text), 1, 6));
      new_temp_password := substring(md5(random()::text), 1, 8);

      if not exists (select 1 from public.couples) then
          insert into public.couples (owner_user_id, status, invite_code, partner_temp_password, created_at)
          values (new.id, 'pending', new_invite_code, new_temp_password, now());
      end if;
  exception when others then
      raise warning 'handle_new_user FAILED: %', SQLERRM;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. UTILITY FUNCTIONS

-- Secure function to clear all data for a specific couple
-- Only callable by the owner or partner of that couple
create or replace function public.clear_couple_data(target_couple_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- 1. Security Check: verify the executing user belongs to this couple
  if not exists (
    select 1 from public.couples c
    where c.id = target_couple_id
    and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
  ) then
    raise exception 'Access Denied: You are not a member of this couple.';
  end if;

  -- 2. Delete all entries (timeline items)
  delete from public.entries where couple_id = target_couple_id;

  -- 3. Delete all media metadata
  delete from public.media where couple_id = target_couple_id;
end;
$$;
grant execute on function public.clear_couple_data(uuid) to authenticated;
