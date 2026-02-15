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
-- 3. RE-APPLY SAFE TRIGGER (Consistent with schema.sql)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_invite_code text;
  new_temp_password text;
begin
  begin
      -- Generate random credentials
      new_invite_code := upper(substring(md5(random()::text), 1, 6));
      new_temp_password := substring(md5(random()::text), 1, 8);

      -- Singleton Logic: If NO couple exists, create one with this user as owner.
      if not exists (select 1 from public.couples) then
          insert into public.couples (owner_user_id, status, invite_code, partner_temp_password, created_at)
          values (new.id, 'pending', new_invite_code, new_temp_password, now());
      end if;
      
  exception when others then
      -- Log warning but don't fail signup
      raise warning 'handle_new_user FAILED: %', SQLERRM;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. CONFIRMATION
select 'System Reset Complete. Ready for User 1 (Owner) Signup.' as status;
