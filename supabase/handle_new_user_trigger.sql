-- Trigger to automatically create a couple record when a NEW user signs up.
-- This handles the "Owner" creation.
-- The "Partner" joins later via the invite link, which updates this same record.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first_user boolean;
  new_invite_code text;
  new_temp_password text;
begin
  -- 1. Check if this is the FIRST user (The Owner)
  -- The system is designed for ONE couple per instance.
  select count(*) = 0 into is_first_user from public.couples;

  if is_first_user then
    -- Generate Random Invite Code (6 chars, uppercase)
    new_invite_code := upper(substring(md5(random()::text), 1, 6));
    
    -- Generate Random Temp Password (8 chars)
    new_temp_password := substring(md5(random()::text), 1, 8);

    -- Insert the new couple record
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
    
    return new;
  else
    -- If a couple already exists, we do NOT create a new one.
    -- The second user (Partner) will be handled by the application logic (joining via invite code),
    -- which UPDATES the existing record.
    return new;
  end if;
end;
$$;

-- Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
