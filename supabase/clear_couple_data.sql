-- Secure function to clear all data for a specific couple
-- Only callable by the owner or partner of that couple

create or replace function clear_couple_data(target_couple_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- 1. Security Check: verify the executing user belongs to this couple
  if not exists (
    select 1 from couples c
    where c.id = target_couple_id
    and (c.owner_user_id = auth.uid() or c.partner_user_id = auth.uid())
  ) then
    raise exception 'Access Denied: You are not a member of this couple.';
  end if;

  -- 2. Delete all entries (timeline items)
  delete from entries where couple_id = target_couple_id;

  -- 3. Delete all media metadata
  -- Note: This does NOT delete files from Storage.
  -- Ideally, you would trigger a Storage delete from the client or an Edge Function.
  -- For now, we clear the DB record so they disappear from the UI.
  delete from media where couple_id = target_couple_id;

  -- 4. Delete all valentine plans (if separate table exists, otherwise covered by entries?)
  -- Removing to avoid error as 'entries' seems to be the main table
  -- delete from valentine_plans where couple_id = target_couple_id;

end;
$$;
