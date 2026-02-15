-- DANGER: This script will delete ALL user data (couples, entries, media).
-- Use this to reset the application for a fresh test run.

-- 1. Delete all media records (and cascade to storage if set up, but usually storage needs manual cleaning or bucket policy)
DELETE FROM media;

-- 2. Delete all timeline entries
DELETE FROM entries;

-- 4. CLEAN UP STORAGE (Optional but recommended)
-- This deletes actual files from the 'memories' bucket.
-- Only run this if you want to wipe all uploaded images/videos.
-- NOTE: To wipe files, please go to the Storage section in Supabase Dashboard and delete manually.
-- The SQL command below is often restricted:
-- DELETE FROM storage.objects WHERE bucket_id = 'memories';

-- 5. Note on Users:
-- You cannot easily delete users from 'auth.users' via simple SQL in the editor due to permissions.
-- To completely reset:
-- Go to Supabase Dashboard -> Authentication -> Users.
-- Select all users and click "Delete".
-- OR use the "Reset Database" button in Database Settings for a full wipe.

-- After running this, the "Demo Mode" should activate automatically for any new visitor.
