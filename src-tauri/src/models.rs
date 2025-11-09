use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use specta::Type;

// Project models
#[derive(Queryable, Selectable, Serialize, Deserialize, Type)]
#[diesel(table_name = crate::schema::projects)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Project {
    pub id: i32,
    pub name: String,
    pub duration_ms: i32,
    pub frame_rate: i32,
    pub resolution_width: i32,
    pub resolution_height: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::projects)]
pub struct NewProject {
    pub name: String,
    pub frame_rate: i32,
    pub resolution_width: i32,
    pub resolution_height: i32,
}

// Asset models
#[derive(Queryable, Selectable, Serialize, Deserialize, Type)]
#[diesel(table_name = crate::schema::assets)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Asset {
    pub id: i32,
    pub project_id: i32,
    pub file_path: String,
    pub asset_type: String,
    pub duration_ms: Option<i32>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub file_size_bytes: i32,
    pub imported_at: String,
}

#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::assets)]
pub struct NewAsset {
    pub project_id: i32,
    pub file_path: String,
    pub asset_type: String,
    pub duration_ms: Option<i32>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub file_size_bytes: i32,
}
