
-- 1. Add Partner Message columns to Couples table
-- We use a DO block to safely add columns only if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'couples' and column_name = 'partner_message') then
        alter table public.couples add column partner_message text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'couples' and column_name = 'partner_message_sender') then
        alter table public.couples add column partner_message_sender uuid references auth.users(id);
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'couples' and column_name = 'partner_message_at') then
        alter table public.couples add column partner_message_at timestamp with time zone;
    end if;
end $$;

-- 2. Create Push Subscriptions table (for future notifications)
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.push_subscriptions enable row level security;

-- 4. RLS Policy: Users can only manage their OWN subscriptions
drop policy if exists "Users manage own subscriptions" on public.push_subscriptions;
create policy "Users manage own subscriptions" on public.push_subscriptions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
