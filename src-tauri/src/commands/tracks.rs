use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use specta::Type;
use crate::models::{Asset};
use crate::schema::{tracks, clips, assets};
use crate::db;

#[derive(Queryable, Selectable, Serialize, Deserialize, Type)]
#[diesel(table_name = tracks)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Track {
    pub id: i32,
    pub project_id: i32,
    pub track_type: String,
    pub order_index: i32,
    pub is_locked: bool,
    pub is_muted: bool,
}

#[derive(Insertable)]
#[diesel(table_name = tracks)]
pub struct NewTrack {
    pub project_id: i32,
    pub track_type: String,
    pub order_index: i32,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Type)]
#[diesel(table_name = clips)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Clip {
    pub id: i32,
    pub track_id: i32,
    pub asset_id: Option<i32>,
    pub start_time_ms: i32,
    pub duration_ms: i32,
    pub asset_start_offset_ms: i32,
    pub asset_end_offset_ms: i32,
    pub volume: f32,
    pub is_muted: bool,
}

#[derive(Insertable)]
#[diesel(table_name = clips)]
pub struct NewClip {
    pub track_id: i32,
    pub asset_id: Option<i32>,
    pub start_time_ms: i32,
    pub duration_ms: i32,
    pub asset_start_offset_ms: i32,
    pub asset_end_offset_ms: i32,
}

#[derive(Serialize, Deserialize, Type)]
pub struct TrackWithClip {
    pub track: Track,
    pub clip: Clip,
}

// CRUD functions
pub fn create_track_with_clip(
    conn: &mut SqliteConnection,
    project_id: i32,
    asset_id: i32,
    track_type: String,
    start_time_ms: i32,
) -> Result<TrackWithClip, diesel::result::Error> {
    // Get asset to determine duration
    let asset = assets::table
        .find(asset_id)
        .select(Asset::as_select())
        .first::<Asset>(conn)?;

    let duration_ms = asset.duration_ms.unwrap_or(0);

    // Get the next order_index for this project
    let max_order: Option<i32> = tracks::table
        .filter(tracks::project_id.eq(project_id))
        .select(diesel::dsl::max(tracks::order_index))
        .first(conn)?;

    let order_index = max_order.map(|o| o + 1).unwrap_or(0);

    // Create track
    let new_track = NewTrack {
        project_id,
        track_type,
        order_index,
    };

    let track = diesel::insert_into(tracks::table)
        .values(&new_track)
        .returning(Track::as_returning())
        .get_result(conn)?;

    // Create clip on the track
    let new_clip = NewClip {
        track_id: track.id,
        asset_id: Some(asset_id),
        start_time_ms,
        duration_ms,
        asset_start_offset_ms: 0,
        asset_end_offset_ms: 0,
    };

    let clip = diesel::insert_into(clips::table)
        .values(&new_clip)
        .returning(Clip::as_returning())
        .get_result(conn)?;

    Ok(TrackWithClip { track, clip })
}

pub fn get_tracks_by_project(
    conn: &mut SqliteConnection,
    project_id: i32,
) -> Result<Vec<Track>, diesel::result::Error> {
    tracks::table
        .filter(tracks::project_id.eq(project_id))
        .select(Track::as_select())
        .order(tracks::order_index.asc())
        .load(conn)
}

pub fn get_clips_by_track(
    conn: &mut SqliteConnection,
    track_id: i32,
) -> Result<Vec<Clip>, diesel::result::Error> {
    clips::table
        .filter(clips::track_id.eq(track_id))
        .select(Clip::as_select())
        .order(clips::start_time_ms.asc())
        .load(conn)
}

// Tauri commands
#[tauri::command]
#[specta::specta]
pub fn create_track_with_clip_command(
    app: tauri::AppHandle,
    project_id: i32,
    asset_id: i32,
    track_type: String,
    start_time_ms: i32,
) -> Result<TrackWithClip, String> {
    let mut conn = db::establish_connection(&app);
    create_track_with_clip(&mut conn, project_id, asset_id, track_type, start_time_ms)
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub fn get_tracks_command(app: tauri::AppHandle, project_id: i32) -> Result<Vec<Track>, String> {
    let mut conn = db::establish_connection(&app);
    get_tracks_by_project(&mut conn, project_id).map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub fn get_clips_command(app: tauri::AppHandle, track_id: i32) -> Result<Vec<Clip>, String> {
    let mut conn = db::establish_connection(&app);
    get_clips_by_track(&mut conn, track_id).map_err(|e| e.to_string())
}
