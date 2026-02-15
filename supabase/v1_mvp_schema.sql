
-- 1. Create the Entries table (if it doesn't exist)
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

-- 2. Update Media table to include entry_id (if not exists)
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'entry_id') then
        alter table public.media add column entry_id uuid references public.entries(id) on delete set null;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'event_year') then
        alter table public.media add column event_year int;
    end if;
end $$;

-- 3. Enable RLS on new table
alter table public.entries enable row level security;

-- 4. Drop existing policies to avoid "already exists" errors
drop policy if exists "Couple access entries" on public.entries;

-- 5. Re-create the policy
create policy "Couple access entries" on public.entries for all to authenticated
using (
    exists (
        select 1 from public.couples c 
        where c.id = entries.couple_id 
        and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
    )
);

-- Note: The conflicting policies on 'couples' don't need to be run again if they already exist and work.
-- We only strictly needed the new 'entries' table and its policy.
