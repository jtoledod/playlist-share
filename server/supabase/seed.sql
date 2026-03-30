-- Seed data for testing the application
-- This file is applied when running `supabase db reset`

-- Insert a sample YouTube playlist
INSERT INTO playlists (provider, external_id, title, description, thumbnail, created_at)
VALUES (
  'youtube',
  'PL1234567890abcdef',
  'My Favorite Hits',
  'A collection of my favorite songs',
  'https://i.ytimg.com/vi/sample/maxresdefault.jpg',
  NOW()
);

-- Insert sample artists
INSERT INTO artists (metadata_provider, external_id, name, thumbnail, bio, created_at)
VALUES
  (
    'genius',
    '12345',
    'Artist One',
    'https://example.com/artist1.jpg',
    'A sample artist for testing',
    NOW()
  ),
  (
    'genius',
    '67890',
    'Artist Two',
    'https://example.com/artist2.jpg',
    'Another sample artist for testing',
    NOW()
  );

-- Insert sample songs
INSERT INTO songs (metadata_provider, title, artist, artist_id, external_id, thumbnail, metadata_status, ai_status, ai_data, created_at)
VALUES
  (
    'genius',
    'Sample Song One',
    'Artist One',
    1,
    'dQw4w9WgXcQ',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg',
    'completed',
    'completed',
    '{"adjectives": ["energetic", "uplifting"], "meaning": "A song about perseverance", "trivia": ["Won Grammy in 2020"]}',
    NOW()
  ),
  (
    'genius',
    'Sample Song Two',
    'Artist Two',
    2,
    'abc123def456',
    'https://i.ytimg.com/vi/abc123def456/sddefault.jpg',
    'completed',
    'pending',
    '{}',
    NOW()
  );

-- Link songs to playlist
INSERT INTO playlist_songs (playlist_id, song_id, music_provider, external_id, external_url, thumbnail, created_at)
SELECT p.id, s.id, 'youtube', s.external_id, 'https://www.youtube.com/watch?v=' || s.external_id, s.thumbnail, NOW()
FROM playlists p, songs s
WHERE p.external_id = 'PL1234567890abcdef'
AND s.external_id = 'dQw4w9WgXcQ';

INSERT INTO playlist_songs (playlist_id, song_id, music_provider, external_id, external_url, thumbnail, created_at)
SELECT p.id, s.id, 'youtube', s.external_id, 'https://www.youtube.com/watch?v=' || s.external_id, s.thumbnail, NOW()
FROM playlists p, songs s
WHERE p.external_id = 'PL1234567890abcdef'
AND s.external_id = 'abc123def456';
