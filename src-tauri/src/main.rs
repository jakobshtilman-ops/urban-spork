#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;

fn get_storage_path() -> PathBuf {
    let base_dir = std::env::var("APPDATA")
        .map(PathBuf::from)
        .or_else(|_| std::env::var("HOME").map(|h| PathBuf::from(h).join(".config")))
        .unwrap_or_else(|_| PathBuf::from("."));

    let app_dir = base_dir.join("Tactic");
    let _ = fs::create_dir_all(&app_dir);
    app_dir.join("tactic-tasks.json")
}

#[tauri::command]
fn save_tasks_to_disk(tasks_json: String) -> Result<String, String> {
    let path = get_storage_path();
    fs::write(&path, tasks_json).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn load_tasks_from_disk() -> Result<String, String> {
    let path = get_storage_path();
    if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        Ok(content)
    } else {
        Err("File not found".to_string())
    }
}

#[tauri::command]
fn get_storage_file_path() -> Result<String, String> {
    let path = get_storage_path();
    Ok(path.to_string_lossy().to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_tasks_to_disk,
            load_tasks_from_disk,
            get_storage_file_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
