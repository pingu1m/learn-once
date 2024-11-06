use crate::state::AppState;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize, Deserialize, Clone, FromRow, Debug)]
pub struct AppSettings {
    pub id: i32,
    pub db_location: String,
    pub github_gist_token: String,
    pub dark_mode: bool,
    pub editor_font: String,
    pub editor_font_size: u8,
    pub editor_theme: String,
    pub vim_mode: bool,
}

#[tauri::command]
pub async fn get_settings(state: tauri::State<'_, AppState>) -> Result<AppSettings, String> {
    let db = &state.db;
    let settings = sqlx::query_as::<_, AppSettings>("SELECT * FROM settings LIMIT 1")
        .fetch_one(db)
        .await;

    dbg!(&settings);

    let settings = settings.map_err(|_| "Failed to fetch settings".to_string())?;

    Ok(settings)
}

#[tauri::command]
pub async fn save_settings(
    state: tauri::State<'_, AppState>,
    settings: AppSettings,
) -> Result<(), String> {
    let db = &state.db;
    sqlx::query(
        r#"
        INSERT INTO settings (id, db_location, github_gist_token, dark_mode, editor_font, editor_font_size, editor_theme, vim_mode)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        ON CONFLICT(id) DO UPDATE SET
            db_location = excluded.db_location,
            github_gist_token = excluded.github_gist_token,
            dark_mode = excluded.dark_mode,
            editor_font = excluded.editor_font,
            editor_font_size = excluded.editor_font_size,
            editor_theme = excluded.editor_theme,
            vim_mode = excluded.vim_mode
        "#,
    )
        .bind(&settings.id)
        .bind(&settings.db_location)
        .bind(&settings.github_gist_token)
        .bind(settings.dark_mode)
        .bind(&settings.editor_font)
        .bind(settings.editor_font_size)
        .bind(&settings.editor_theme)
        .bind(settings.vim_mode)
        .execute(db)
        .await
        .map_err(|_| "Failed to save settings".to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn export_database(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    // First, close the database connection
    let db = &state.db;

    // Get the path to your current database
    let mut path = app_handle
        .path()
        .app_data_dir()
        .expect("could not get data_dir");
    match std::fs::create_dir_all(path.clone()) {
        Ok(_) => {}
        Err(err) => {
            return Err(format!("Error creating directory: {}", err));
        }
    };
    path.push("db.sqlite");

    // Show save dialog and get destination path
    let save_path = app_handle
        .dialog()
        .file()
        .add_filter("SQLite Database", &["db"])
        .set_file_name("database_backup.db")
        .blocking_save_file()
        .ok_or("No save location selected")?;

    // Create a backup using SQLite's backup API
    let backup_result = sqlx::query("VACUUM INTO ?")
        .bind(save_path.to_string())
        .execute(db)
        .await;

    match backup_result {
        Ok(_) => Ok("Database exported successfully".to_string()),
        Err(e) => {
            // If VACUUM INTO fails (might not be supported in your SQLite version),
            // fall back to file copy
            match std::fs::copy(&path, save_path.to_string()) {
                Ok(_) => Ok("Database exported successfully".to_string()),
                Err(e) => Err(format!("Failed to export database: {}", e)),
            }
        }
    }
}
