use diesel::prelude::*;
use crate::models::{Asset, NewAsset};
use crate::schema::assets;
use crate::db;

// CRUD functions
pub fn add_asset(
    conn: &mut SqliteConnection,
    project_id: i32,
    file_path: String,
    asset_type: String,
    duration_ms: Option<i32>,
    width: Option<i32>,
    height: Option<i32>,
    file_size_bytes: i32,
) -> Result<Asset, diesel::result::Error> {
    let new_asset = NewAsset {
        project_id,
        file_path,
        asset_type,
        duration_ms,
        width,
        height,
        file_size_bytes,
    };

    diesel::insert_into(assets::table)
        .values(&new_asset)
        .returning(Asset::as_returning())
        .get_result(conn)
}

pub fn get_assets_by_project(
    conn: &mut SqliteConnection,
    project_id: i32,
) -> Result<Vec<Asset>, diesel::result::Error> {
    assets::table
        .filter(assets::project_id.eq(project_id))
        .select(Asset::as_select())
        .load(conn)
}

// Tauri commands
#[tauri::command]
#[specta::specta]
pub fn add_asset_command(
    app: tauri::AppHandle,
    project_id: i32,
    file_path: String,
    asset_type: String,
    duration_ms: Option<i32>,
    width: Option<i32>,
    height: Option<i32>,
    file_size_bytes: i32,
) -> Result<Asset, String> {
    let mut conn = db::establish_connection(&app);
    add_asset(
        &mut conn,
        project_id,
        file_path,
        asset_type,
        duration_ms,
        width,
        height,
        file_size_bytes,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub fn get_assets_command(app: tauri::AppHandle, project_id: i32) -> Result<Vec<Asset>, String> {
    let mut conn = db::establish_connection(&app);
    get_assets_by_project(&mut conn, project_id).map_err(|e| e.to_string())
}
