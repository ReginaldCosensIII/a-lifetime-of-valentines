-- FAIL-SAFE TRIGGER: Guaranteed not to block Signup

-- 1. Ensure extensions
create extension if not exists "pgcrypto";

-- 2. Drop existing
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Create Function with EXCEPTION HANDLING
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_invite_code text;
  new_temp_password text;
  safe_invite_code text;
begin
  -- START SAFE BLOCK
  begin
      -- Generate safe random strings (using basic postgres functions if pgcrypto fails)
      -- md5(random()::text) is standard postgres, very safe.
      new_invite_code := upper(substring(md5(random()::text), 1, 6));
      new_temp_password := substring(md5(random()::text), 1, 8);

      -- Check if couple exists (Singleton Logic)
      -- If NO couple exists, create one using this new user as owner.
      if not exists (select 1 from public.couples) then
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
      
  exception when others then
      -- 🚨 CATCH ALL ERRORS 🚨
      -- If ANYTHING goes wrong (permissions, constraints, logic), 
      -- we LOG it but RETURN NEW so the Signup process SUCCEEDS.
      raise warning 'handle_new_user FAILED: %', SQLERRM;
  end;
  
  return new;
end;
$$;

-- 4. Attach Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
