-- 1. Function to check system status (for Frontend UI)
create or replace function public.get_system_status()
returns json
language plpgsql
security definer
as $$
declare
  couple_count int;
  user_count int;
  is_locked boolean;
begin
  select count(*) into couple_count from public.couples;
  select count(*) into user_count from auth.users;
  
  -- Lock signup if ANY couple exists
  is_locked := false; -- Legacy compatibility, maps to full lock
  
  if couple_count > 0 then
     -- Check if partner is linked for FULL lock
     if exists (select 1 from public.couples where partner_user_id is not null) then
        is_locked := true;
     end if;
  end if;

  return json_build_object(
    'is_locked', is_locked, -- Fully locked (Partner joined)
    'is_signup_locked', (couple_count > 0), -- Signup locked (Owner exists)
    'couple_count', couple_count
  );
end;
$$;

grant execute on function public.get_system_status() to anon, authenticated, service_role;

-- 2. Trigger to PREVENT new couples if one exists
-- This ensures only ONE couple record ever exists in this DB
create or replace function public.prevent_multiple_couples()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.couples) > 0 then
    raise exception 'System Locked: A couple already exists. This instance allows only one couple.';
  end if;
  return new;
end;
$$;

-- Drop trigger if exists to allow idempotency
drop trigger if exists check_singleton_couple on public.couples;

create trigger check_singleton_couple
before insert on public.couples
for each row
execute function public.prevent_multiple_couples();
