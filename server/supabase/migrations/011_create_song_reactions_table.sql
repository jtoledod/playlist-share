-- Create song_reactions table for user reactions to songs in shared playlists
CREATE TABLE IF NOT EXISTS song_reactions (
  id SERIAL PRIMARY KEY,
  share_id INTEGER NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT CHECK (reaction IN ('do_not_like', 'like', 'love')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(share_id, song_id, user_id)
);

-- Index for querying reactions
CREATE INDEX IF NOT EXISTS idx_song_reactions_share_id ON song_reactions(share_id);
CREATE INDEX IF NOT EXISTS idx_song_reactions_user_id ON song_reactions(user_id);

-- Add check constraint for reaction
ALTER TABLE song_reactions DROP CONSTRAINT IF EXISTS song_reactions_reaction_check;
ALTER TABLE song_reactions ADD CONSTRAINT song_reactions_reaction_check 
  CHECK (reaction IN ('do_not_like', 'like', 'love', NULL));
