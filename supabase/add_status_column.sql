-- Add status column to couples table
ALTER TABLE public.couples 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing records to have a status (optional, but good for consistency)
UPDATE public.couples 
SET status = 'pending' 
WHERE status IS NULL;

-- Optional: Create an index if we query by status often (not strictly needed for this scale yet)
-- CREATE INDEX IF NOT EXISTS idx_couples_status ON public.couples(status);
