-- Clean up duplicate roleplay sessions, keeping only the most recent one per pack
DELETE FROM public.roleplay_sessions
WHERE id NOT IN (
  SELECT DISTINCT ON (pack_id) id
  FROM public.roleplay_sessions
  ORDER BY pack_id, created_at DESC
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE public.roleplay_sessions 
ADD CONSTRAINT unique_pack_session 
UNIQUE (pack_id);