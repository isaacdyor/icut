use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tauri::Manager;

// Embed migrations at compile time
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

pub fn establish_connection(app: &tauri::AppHandle) -> SqliteConnection {
    // Get app data directory
    let app_data = app.path().app_data_dir()
        .expect("Failed to get app data dir");

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&app_data)
        .expect("Failed to create app data dir");

    // Build database path
    let db_path = app_data.join("icut.db");
    let db_url = db_path.to_str().expect("Invalid path");

    println!("Connecting to database at: {}", db_url);

    // Connect to database (creates file if it doesn't exist)
    let mut conn = SqliteConnection::establish(db_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", db_url));

    // Run pending migrations
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Failed to run migrations");

    println!("Database initialized successfully");

    conn
}
