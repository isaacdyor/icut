use diesel::prelude::*;
use crate::models::{Project, NewProject};
use crate::schema::projects;
use crate::db;

// CRUD functions
pub fn create_project(
    conn: &mut SqliteConnection,
    name: String,
    frame_rate: i32,
    resolution_width: i32,
    resolution_height: i32,
) -> Result<Project, diesel::result::Error> {
    let new_project = NewProject {
        name,
        frame_rate,
        resolution_width,
        resolution_height,
    };

    diesel::insert_into(projects::table)
        .values(&new_project)
        .returning(Project::as_returning())
        .get_result(conn)
}

pub fn get_all_projects(conn: &mut SqliteConnection) -> Result<Vec<Project>, diesel::result::Error> {
    projects::table
        .select(Project::as_select())
        .load(conn)
}

pub fn get_project_by_id(conn: &mut SqliteConnection, project_id: i32) -> Result<Project, diesel::result::Error> {
    projects::table
        .find(project_id)
        .select(Project::as_select())
        .first(conn)
}

// Tauri commands
#[tauri::command]
#[specta::specta]
pub fn create_project_command(
    app: tauri::AppHandle,
    name: String,
    frame_rate: Option<i32>,
    resolution_width: Option<i32>,
    resolution_height: Option<i32>,
) -> Result<Project, String> {
    let mut conn = db::establish_connection(&app);
    create_project(
        &mut conn,
        name,
        frame_rate.unwrap_or(30),
        resolution_width.unwrap_or(1920),
        resolution_height.unwrap_or(1080),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub fn get_all_projects_command(app: tauri::AppHandle) -> Result<Vec<Project>, String> {
    let mut conn = db::establish_connection(&app);
    get_all_projects(&mut conn).map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub fn get_project_command(app: tauri::AppHandle, project_id: i32) -> Result<Project, String> {
    let mut conn = db::establish_connection(&app);
    get_project_by_id(&mut conn, project_id).map_err(|e| e.to_string())
}
