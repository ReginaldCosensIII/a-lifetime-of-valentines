-- RPC Function to safely link a partner to a couple
-- Bypasses RLS (Security Definer) because the new user cannot "see" the couple yet.

create or replace function public.link_partner(invite_code_input text, email_input text)
returns json
language plpgsql
security definer
as $$
declare
  target_couple_id uuid;
  success boolean;
begin
  -- 1. Find the couple pending this invite
  select id into target_couple_id
  from public.couples
  where invite_code = invite_code_input
    and partner_email = email_input
    and partner_user_id is null; -- Ensure not already claimed

  if target_couple_id is null then
    return json_build_object('success', false, 'error', 'Invalid invite code or email mismatch.');
  end if;

  -- 2. Update the record
  update public.couples
  set 
    partner_user_id = auth.uid(),
    partner_temp_password = null -- Clear temp password for security
  where id = target_couple_id;

  return json_build_object('success', true, 'couple_id', target_couple_id);
end;
$$;

grant execute on function public.link_partner(text, text) to authenticated;
