-- Make metadata columns nullable (no defaults)

-- Make external_id nullable in songs
ALTER TABLE songs ALTER COLUMN external_id DROP NOT NULL;

-- Make metadata_provider and external_id nullable in albums
ALTER TABLE albums ALTER COLUMN metadata_provider DROP NOT NULL;
ALTER TABLE albums ALTER COLUMN external_id DROP NOT NULL;

-- Drop unique constraint on albums (can't have unique on nullable columns)
ALTER TABLE albums DROP CONSTRAINT IF EXISTS albums_provider_external_id_key;

-- Set default values to NULL in songs/artists (remove defaults)
ALTER TABLE songs ALTER COLUMN metadata_provider DROP DEFAULT;
ALTER TABLE songs ALTER COLUMN metadata_provider SET NOT NULL;
ALTER TABLE artists ALTER COLUMN metadata_provider DROP DEFAULT;
ALTER TABLE artists ALTER COLUMN metadata_provider SET NOT NULL;
