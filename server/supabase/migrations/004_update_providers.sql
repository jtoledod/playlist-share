-- Rename provider to metadata_provider in songs table
ALTER TABLE songs RENAME COLUMN provider TO metadata_provider;

-- Remove external_url from songs (moved to playlist_songs)
ALTER TABLE songs DROP COLUMN IF EXISTS external_url;

-- Add music provider fields to playlist_songs
ALTER TABLE playlist_songs ADD COLUMN IF NOT EXISTS music_provider TEXT NOT NULL DEFAULT 'youtube';
ALTER TABLE playlist_songs ADD COLUMN IF NOT EXISTS external_id TEXT NOT NULL;
ALTER TABLE playlist_songs ADD COLUMN IF NOT EXISTS external_url TEXT NOT NULL;
ALTER TABLE playlist_songs ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Drop old unique constraint and create new one
ALTER TABLE playlist_songs DROP CONSTRAINT IF EXISTS playlist_songs_playlist_id_song_id_key;
ALTER TABLE playlist_songs ADD CONSTRAINT playlist_songs_playlist_id_song_id_music_provider_key UNIQUE(playlist_id, song_id, music_provider);

-- Create index for music provider lookups
CREATE INDEX IF NOT EXISTS idx_playlist_songs_music_provider ON playlist_songs(music_provider);

-- Rename provider to metadata_provider in albums table
ALTER TABLE albums RENAME COLUMN provider TO metadata_provider;

-- Convert release_date to TIMESTAMP without time zone
ALTER TABLE albums ALTER COLUMN release_date TYPE TIMESTAMP USING release_date::timestamp;
