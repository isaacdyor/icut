use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct FileReference {
    path: String,
}

#[tauri::command]
#[specta::specta]
pub async fn save_file(app: AppHandle, file_path: String) -> Result<String, String> {
    let source_path = PathBuf::from(&file_path);

    if !source_path.exists() {
        return Err("File does not exist".to_string());
    }

    // Get the app data directory
    let app_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?;

    // Create .icut directory if it doesn't exist
    let icut_dir = app_dir.join(".icut");
    fs::create_dir_all(&icut_dir)
        .map_err(|e| format!("Failed to create .icut directory: {}", e))?;

    // Read existing references
    let refs_file = icut_dir.join("references.json");
    let mut references: Vec<FileReference> = if refs_file.exists() {
        let content = fs::read_to_string(&refs_file)
            .map_err(|e| format!("Failed to read references: {}", e))?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    // Add new reference if not already present
    let file_path_str = file_path.clone();
    if !references.iter().any(|r| r.path == file_path_str) {
        references.push(FileReference { path: file_path_str });

        // Save updated references
        let json = serde_json::to_string_pretty(&references)
            .map_err(|e| format!("Failed to serialize references: {}", e))?;
        fs::write(&refs_file, json)
            .map_err(|e| format!("Failed to write references: {}", e))?;
    }

    Ok(file_path)
}

#[tauri::command]
#[specta::specta]
pub async fn get_files(app: AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?;

    let icut_dir = app_dir.join(".icut");
    let refs_file = icut_dir.join("references.json");

    if !refs_file.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&refs_file)
        .map_err(|e| format!("Failed to read references: {}", e))?;

    let references: Vec<FileReference> = serde_json::from_str(&content)
        .unwrap_or_default();

    // Filter out files that no longer exist
    let files: Vec<String> = references
        .into_iter()
        .filter(|r| PathBuf::from(&r.path).exists())
        .map(|r| r.path)
        .collect();

    Ok(files)
}
