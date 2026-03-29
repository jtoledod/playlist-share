-- Add Genius-related fields to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS genius_id INTEGER;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS album_name TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS album_art TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS release_date TEXT;

-- Index for faster Genius lookups
CREATE INDEX IF NOT EXISTS idx_songs_genius_id ON songs(genius_id);
