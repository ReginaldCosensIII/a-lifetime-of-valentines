
-- 🚨 WARNING: This will delete existing plans. Since we are in dev/MVP, this is acceptable to fix the schema.
DROP TABLE IF EXISTS public.entries CASCADE;

-- 1. Re-create the table with ALL columns explicitly
CREATE TABLE public.entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  event_date date not null,
  location text,          -- Explicitly adding location
  notes text,             -- Explicitly adding notes
  year int generated always as (date_part('year', event_date)) stored
);

-- 2. Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- 3. Add the Policy
CREATE POLICY "Couple access entries" ON public.entries FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.couples c 
        WHERE c.id = entries.couple_id 
        AND (c.owner_user_id = auth.uid() OR c.partner_user_id = auth.uid())
    )
);

-- 4. Re-link Media table (since we dropped entries cascade, the FK might be gone or needs validating)
DO $$ 
BEGIN
    -- Ensure media table has the columns (in case they were missed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'entry_id') THEN
        ALTER TABLE public.media ADD COLUMN entry_id uuid references public.entries(id) on delete set null;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'event_year') THEN
        ALTER TABLE public.media ADD COLUMN event_year int;
    END IF;
END $$;

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
