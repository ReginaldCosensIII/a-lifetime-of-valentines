
-- 1. Create Email Schedules Table
create table if not exists public.email_schedules (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  send_at timestamp with time zone not null,
  subject text,
  content text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed'))
);

-- 2. Create Shared Links Table (for public access)
create table if not exists public.shared_links (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone not null, -- Links should have an expiration
  is_active boolean default true
);

-- 3. Enable RLS
alter table public.email_schedules enable row level security;
alter table public.shared_links enable row level security;

-- 4. RLS Policies for Email Schedules (Only Couple can see/edit)
drop policy if exists "Couple access email_schedules" on public.email_schedules;
create policy "Couple access email_schedules" on public.email_schedules for all to authenticated
using (
    exists (
        select 1 from public.couples c 
        where c.id = email_schedules.couple_id 
        and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
    )
);

-- 5. RLS Policies for Shared Links (Couple can manage them)
drop policy if exists "Couple manage shared_links" on public.shared_links;
create policy "Couple manage shared_links" on public.shared_links for all to authenticated
using (
    exists (
        select 1 from public.couples c 
        where c.id = shared_links.couple_id 
        and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
    )
);

-- 6. Public Access Policy for Shared Links (Anyone with the token can READ the link metadata)
-- This allows the app to check if the link is valid.
drop policy if exists "Public read shared_links" on public.shared_links;
create policy "Public read shared_links" on public.shared_links for select to anon, authenticated
using ( true );

-- 7. Secure Function to get Public Timeline Data (Bypassing RLS for valid tokens)
drop function if exists public.get_shared_timeline(text);
create or replace function public.get_shared_timeline(limit_token text)
returns json
language plpgsql
security definer
as $$
declare
  target_couple_id uuid;
  media_data json;
  plans_data json;
  couple_names json;
begin
  -- 1. Verify Token and Expiry
  select couple_id into target_couple_id
  from public.shared_links
  where token = limit_token 
  and is_active = true 
  and expires_at > now();

  if target_couple_id is null then
    return null; -- Invalid or Expired
  end if;

  -- 2. Fetch Media
  select json_agg(
    json_build_object(
      'id', m.id,
      'type', m.type,
      'url', m.storage_path, -- Frontend will need to sign this or key needs to be public for this bucket
      'caption', m.caption,
      'year', m.event_year,
      'created_at', m.created_at
    ) order by m.created_at desc
  ) into media_data
  from public.media m
  where m.couple_id = target_couple_id;

  -- 3. Fetch Plans
  select json_agg(
    json_build_object(
      'id', e.id,
      'title', e.title,
      'date', e.event_date,
      'location', e.location,
      'notes', e.notes,
      'created_at', e.created_at
    ) order by e.event_date asc
  ) into plans_data
  from public.entries e
  where e.couple_id = target_couple_id;

  -- 4. Return Combined Data
  return json_build_object(
    'media', coalesce(media_data, '[]'::json),
    'plans', coalesce(plans_data, '[]'::json)
  );
end;
$$;

grant execute on function public.get_shared_timeline(text) to anon, authenticated;
