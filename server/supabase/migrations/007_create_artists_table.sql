-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  metadata_provider TEXT NOT NULL DEFAULT 'genius',
  external_id TEXT,
  name TEXT NOT NULL,
  thumbnail TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metadata_provider, external_id)
);

-- Add artist_id foreign key to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS artist_id INTEGER REFERENCES artists(id);

-- Create index for artist lookups
CREATE INDEX IF NOT EXISTS idx_artists_metadata_provider_external_id ON artists(metadata_provider, external_id);
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
