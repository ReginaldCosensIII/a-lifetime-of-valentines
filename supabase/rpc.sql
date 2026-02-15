
-- Function to securely verify an invite code without exposing the table
create or replace function public.verify_invite(invite_code_input text)
returns table (
  id uuid,
  partner_email text,
  partner_temp_password text,
  partner_user_id uuid
) 
language plpgsql
security definer -- Runs with the privileges of the creator (postgres/admin)
as $$
begin
  return query
  select 
    c.id,
    c.partner_email,
    c.partner_temp_password,
    c.partner_user_id
  from public.couples c
  where c.invite_code = invite_code_input;
end;
$$;

-- Grant access to anon (unauthenticated) users so they can verify before signing up
grant execute on function public.verify_invite(text) to anon, authenticated;
