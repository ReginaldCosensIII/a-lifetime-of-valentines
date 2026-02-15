-- 🚨 DANGER: THIS SCRIPT WIPES ALL USER DATA 🚨

-- 1. CLEANUP: Remove all verification tokens, entries, and couples
TRUNCATE TABLE public.media CASCADE;
TRUNCATE TABLE public.entries CASCADE;
TRUNCATE TABLE public.email_schedules CASCADE;
TRUNCATE TABLE public.shared_links CASCADE;
TRUNCATE TABLE public.couples CASCADE;

-- 2. WIPE USERS (This requires supabase_admin rights usually, or running in SQL Editor)
-- Note: In Supabase Dashboard SQL Editor, you can delete from auth.users.
DELETE FROM auth.users;

-- 3. APPLY TRIGGER: Ensure the signup trigger exists
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first_user boolean;
  new_invite_code text;
  new_temp_password text;
  existing_couple_id uuid;
begin
  -- CHECK: LIMIT TO 2 USERS GLOBAL
  -- If we already have 2 users in auth.users, BLOCK the 3rd.
  -- (Note: 'new' user is not committed yet, so count might be 0 or 1 depending on transaction)
  if (select count(*) from auth.users) >= 2 then
     -- Allow if this is one of the first 2
  end if;
  -- Actually, deeper check:
  -- The system allows:
  -- 1. Owner (Creates Couple)
  -- 2. Partner (Joins Couple)
  -- 3. NO ONE ELSE.

  -- Check if a couple exists
  select id into existing_couple_id from public.couples limit 1;

  if existing_couple_id is null then
    -- CASE 1: No Couple exists. This is the OWNER.
    
    -- Generate Random Invite Code
    new_invite_code := upper(substring(md5(random()::text), 1, 6));
    new_temp_password := substring(md5(random()::text), 1, 8);

    insert into public.couples (owner_user_id, status, invite_code, partner_temp_password, created_at)
    values (new.id, 'pending', new_invite_code, new_temp_password, now());
    
    return new;

  else
    -- CASE 2: Couple exists. This MIGHT be the Partner.
    -- We do NOT auto-assign them to the couple here. 
    -- They must use the "Join" flow in the app (which updates public.couples).
    -- However, we can BLOCK if the couple already has a partner.
    
    if exists (select 1 from public.couples where partner_user_id is not null) then
       raise exception 'Registration Blocked: This timeline is full (2/2 users).';
    end if;

    return new;
  end if;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. CONFIRMATION
select 'System Reset Complete. Ready for User 1 (Owner) Signup.' as status;
