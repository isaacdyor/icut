-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    frame_rate INTEGER NOT NULL DEFAULT 30,
    resolution_width INTEGER NOT NULL DEFAULT 1920,
    resolution_height INTEGER NOT NULL DEFAULT 1080,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Assets table (imported media files)
CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK(asset_type IN ('video', 'audio', 'image')),
    duration_ms INTEGER,
    width INTEGER,
    height INTEGER,
    file_size_bytes INTEGER NOT NULL,
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Tracks table (video/audio layers)
CREATE TABLE tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    track_type TEXT NOT NULL CHECK(track_type IN ('video', 'audio')),
    order_index INTEGER NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT 0,
    is_muted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Clips table (instances of assets placed on tracks)
CREATE TABLE clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    asset_id INTEGER,
    start_time_ms INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    asset_start_offset_ms INTEGER NOT NULL DEFAULT 0,
    asset_end_offset_ms INTEGER NOT NULL DEFAULT 0,
    volume REAL NOT NULL DEFAULT 1.0,
    is_muted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_tracks_project_id ON tracks(project_id);
CREATE INDEX idx_clips_track_id ON clips(track_id);
CREATE INDEX idx_clips_asset_id ON clips(asset_id);
