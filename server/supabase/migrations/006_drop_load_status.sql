-- Drop deprecated load_status column (replaced by metadata_status + ai_status)

ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_load_status_check;
ALTER TABLE songs DROP COLUMN IF EXISTS load_status;
