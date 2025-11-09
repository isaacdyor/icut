-- Drop tables in reverse order (respecting foreign keys)
DROP INDEX IF EXISTS idx_clips_asset_id;
DROP INDEX IF EXISTS idx_clips_track_id;
DROP INDEX IF EXISTS idx_tracks_project_id;
DROP INDEX IF EXISTS idx_assets_project_id;

DROP TABLE IF EXISTS clips;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS projects;
