-- Migration: 001_initial_schema
-- Description: Create playlists, songs, and playlist_songs tables for multi-provider support

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'youtube',
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'youtube',
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT NOT NULL,
  thumbnail TEXT,
  load_status TEXT NOT NULL DEFAULT 'pending',
  ai_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_playlists_provider ON playlists(provider);
CREATE INDEX IF NOT EXISTS idx_playlists_external_id ON playlists(external_id);
CREATE INDEX IF NOT EXISTS idx_songs_provider ON songs(provider);
CREATE INDEX IF NOT EXISTS idx_songs_title_artist ON songs(title, artist);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);

-- Add comments for documentation
COMMENT ON TABLE playlists IS 'Stores imported playlists from various music providers';
COMMENT ON TABLE songs IS 'Stores songs from various music providers with AI analysis data';
COMMENT ON TABLE playlist_songs IS 'Junction table linking playlists to songs';
