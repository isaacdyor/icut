#[tauri::command]
#[specta::specta]
pub fn my_custom_command(name: String) -> String {
  format!("Hello, {}! I was invoked from JavaScript!", name)
}