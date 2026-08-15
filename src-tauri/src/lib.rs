// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::Path;

#[tauri::command]
fn load_journal(date: String) -> String {
    let folder = "journals";

    if !Path::new(folder).exists() {
        fs::create_dir_all(folder).ok();
    }

    let file_path = format!("{}/{}.txt", folder, date);

    fs::read_to_string(file_path).unwrap_or_default()
}

#[tauri::command]
fn save_journal(date: String, content: String) -> Result<(), String> {
    let folder = "journals";

    if !Path::new(folder).exists() {
        fs::create_dir_all(folder).map_err(|e| e.to_string())?;
    }

    let file_path = format!("{}/{}.txt", folder, date);

    fs::write(file_path, content).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn list_journals() -> Vec<String> {
    let folder = "journals";

    if !Path::new(folder).exists() {
        fs::create_dir_all(folder).ok();
    }

    let mut journals = Vec::new();

    if let Ok(entries) = fs::read_dir(folder) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                journals.push(name.to_string());
            }
        }
    }

    journals.sort();
    journals.reverse();

    journals
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_journal,
            save_journal,
            list_journals
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}