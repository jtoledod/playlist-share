-- Create review_comments table for user comments on songs in shared playlists
CREATE TABLE IF NOT EXISTS review_comments (
  id SERIAL PRIMARY KEY,
  share_id INTEGER NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES review_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying comments
CREATE INDEX IF NOT EXISTS idx_review_comments_share_id ON review_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_song_id ON review_comments(song_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_parent_id ON review_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON review_comments(user_id);
