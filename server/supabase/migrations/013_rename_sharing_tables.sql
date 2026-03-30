-- Rename sharing tables for better clarity
ALTER TABLE song_reactions RENAME TO share_song_reactions;
ALTER TABLE review_comments RENAME TO share_comments;

-- Rename indexes accordingly
ALTER INDEX idx_song_reactions_share_id RENAME TO idx_share_song_reactions_share_id;
ALTER INDEX idx_song_reactions_user_id RENAME TO idx_share_song_reactions_user_id;

ALTER INDEX idx_review_comments_share_id RENAME TO idx_share_comments_share_id;
ALTER INDEX idx_review_comments_song_id RENAME TO idx_share_comments_song_id;
ALTER INDEX idx_review_comments_parent_id RENAME TO idx_share_comments_parent_id;
ALTER INDEX idx_review_comments_user_id RENAME TO idx_share_comments_user_id;
