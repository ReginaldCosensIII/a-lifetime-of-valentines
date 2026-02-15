
-- 1. Explicitly notify PostgREST to reload schema (by toggling a comment or reloading)
NOTIFY pgrst, 'reload config';

-- 2. Ensure the column exists (Idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'entries' 
        AND column_name = 'event_date'
    ) THEN
        ALTER TABLE public.entries ADD COLUMN event_date date not null default CURRENT_DATE;
    END IF;
END $$;

-- 3. Verify the Year generated column exists, or create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'entries' 
        AND column_name = 'year'
    ) THEN
        ALTER TABLE public.entries ADD COLUMN year int generated always as (date_part('year', event_date)) stored;
    END IF;
END $$;
