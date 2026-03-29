-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT,
  cover_art TEXT,
  release_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, external_id)
);

-- Add album_id foreign key to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS album_id INTEGER REFERENCES albums(id);

-- Create index for album lookups
CREATE INDEX IF NOT EXISTS idx_albums_provider_external_id ON albums(provider, external_id);

-- Remove old genius-related columns from songs
ALTER TABLE songs DROP COLUMN IF EXISTS genius_id;
ALTER TABLE songs DROP COLUMN IF EXISTS album_name;
ALTER TABLE songs DROP COLUMN IF EXISTS album_art;
ALTER TABLE songs DROP COLUMN IF EXISTS release_date;
