-- Create shares table for playlist sharing between users
CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, sender_id, receiver_id)
);

-- Index for querying shares
CREATE INDEX IF NOT EXISTS idx_shares_sender_id ON shares(sender_id);
CREATE INDEX IF NOT EXISTS idx_shares_receiver_id ON shares(receiver_id);
CREATE INDEX IF NOT EXISTS idx_shares_playlist_id ON shares(playlist_id);
