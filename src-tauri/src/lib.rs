mod commands;
mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri_specta::Builder::<tauri::Wry>::new()
        .commands(tauri_specta::collect_commands![commands::save_file, commands::get_files]);

    #[cfg(debug_assertions)]
    builder
        .export(
            specta_typescript::Typescript::default(),
            "../src/bindings.ts"
        )
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(tauri_plugin_window_state::StateFlags::all())
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize database
            let _conn = db::establish_connection(app.handle());
            Ok(())
        })
        .invoke_handler(builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
