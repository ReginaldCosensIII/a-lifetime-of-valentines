-- NUCLEAR CLEANUP SCRIPT ☢️
-- This script explicitly deletes data from all known tables in the correct dependency order.
-- Use this to clear ANY blocking references preventing user deletion.

BEGIN;

-- 1. Shared Links (References Couples)
DELETE FROM public.shared_links;

-- 2. Email Schedules (References Couples)
DELETE FROM public.email_schedules;

-- 3. Media (References Couples AND Users)
-- We explicitly delete this to clear the user_id references.
DELETE FROM public.media;

-- 4. Entries (References Couples)
DELETE FROM public.entries;

-- 5. Couples (References Users)
DELETE FROM public.couples;

COMMIT;

-- 6. USER DELETION ATTEMPT (Via SQL)
-- If the Dashboard fails, try running this line with the specific email.
-- Replace 'user@example.com' with the actual email you want to delete.

-- delete from auth.users where email = 'user@example.com';

-- IF THIS FAILS, the error message will be much more specific about WHICH table is blocking it.
-- Look for "violates foreign key constraint... on table X".
