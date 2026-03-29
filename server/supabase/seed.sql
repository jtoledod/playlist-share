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

-- Insert sample songs
INSERT INTO songs (provider, title, artist, external_id, external_url, thumbnail, load_status, ai_data, created_at)
VALUES
  (
    'youtube',
    'Sample Song One',
    'Artist One',
    'dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg',
    'completed',
    '{"adjectives": ["energetic", "uplifting"], "meaning": "A song about perseverance", "trivia": ["Won Grammy in 2020"]}',
    NOW()
  ),
  (
    'youtube',
    'Sample Song Two',
    'Artist Two',
    'abc123def456',
    'https://www.youtube.com/watch?v=abc123def456',
    'https://i.ytimg.com/vi/abc123def456/sddefault.jpg',
    'pending',
    '{}',
    NOW()
  );

-- Link songs to playlist
INSERT INTO playlist_songs (playlist_id, song_id, created_at)
SELECT p.id, s.id, NOW()
FROM playlists p, songs s
WHERE p.external_id = 'PL1234567890abcdef'
AND s.external_id = 'dQw4w9WgXcQ';

INSERT INTO playlist_songs (playlist_id, song_id, created_at)
SELECT p.id, s.id, NOW()
FROM playlists p, songs s
WHERE p.external_id = 'PL1234567890abcdef'
AND s.external_id = 'abc123def456';
