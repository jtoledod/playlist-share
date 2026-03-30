-- Add separate status fields for metadata enrichment and AI processing

-- metadata_status: tracks Genius enrichment
-- ai_status: tracks Gemini AI analysis

-- Add default value to metadata_provider (lost during rename in migration 004)
ALTER TABLE songs ALTER COLUMN metadata_provider SET DEFAULT 'genius';

ALTER TABLE songs ADD COLUMN IF NOT EXISTS metadata_status TEXT 
  NOT NULL DEFAULT 'pending';

ALTER TABLE songs ADD COLUMN IF NOT EXISTS ai_status TEXT 
  NOT NULL DEFAULT 'pending';

-- Add check constraints
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_metadata_status_check;
ALTER TABLE songs ADD CONSTRAINT songs_metadata_status_check 
  CHECK (metadata_status IN ('pending', 'enriching', 'completed', 'failed'));

ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_ai_status_check;
ALTER TABLE songs ADD CONSTRAINT songs_ai_status_check 
  CHECK (ai_status IN ('pending', 'processing', 'completed', 'failed'));

-- Indexes for efficient querying of pending items
CREATE INDEX IF NOT EXISTS idx_songs_metadata_status ON songs(metadata_status);
CREATE INDEX IF NOT EXISTS idx_songs_ai_status ON songs(ai_status);

-- Comments for documentation
COMMENT ON COLUMN songs.metadata_status IS 'Status of metadata enrichment: pending, enriching, completed, failed';
COMMENT ON COLUMN songs.ai_status IS 'Status of AI analysis: pending, processing, completed, failed';
