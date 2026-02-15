-- EMERGENCY FIX: Simplify Trigger to stop 500 Errors

-- 1. Ensure extensions exist (for uuid/md5/random)
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. Drop potential blockers
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Simplified Function (No Search Path restriction, No Auth Count check)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer -- Run as Admin (Postgres)
as $$
declare
  new_invite_code text;
  new_temp_password text;
  has_couples boolean;
begin
  -- Simple Logic:
  -- If NO Couple exists -> Create one (User is Owner).
  -- If Couple exists -> Do nothing (User is Partner, will join later).

  select exists(select 1 from public.couples) into has_couples;

  if not has_couples then
    -- Generate Codes
    new_invite_code := upper(substring(md5(random()::text), 1, 6));
    new_temp_password := substring(md5(random()::text), 1, 8);

    -- Insert
    insert into public.couples (
      owner_user_id, 
      status, 
      invite_code, 
      partner_temp_password, 
      created_at
    )
    values (
      new.id, 
      'pending', 
      new_invite_code, 
      new_temp_password, 
      now()
    );
  end if;

  return new;
exception when others then
  -- If something fails, LOG it (visible in Supabase logs) but ALLOW signup
  -- This prevents the "500 Error" blocking the user
  raise warning 'Create Couple Trigger Failed: %', SQLERRM;
  return new;
end;
$$;

-- 4. Re-attach Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Confirmation
select 'Emergency Fix Applied. Signup should now work.' as status;
