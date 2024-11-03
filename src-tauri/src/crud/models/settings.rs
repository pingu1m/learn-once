use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::crud::models::note::Note;
use crate::state::AppState;

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
    let settings = sqlx::query_as::<_, AppSettings>(
        "SELECT * FROM settings LIMIT 1"
    )
        .fetch_one(db)
        .await;

    dbg!(&settings);

    let settings = settings.map_err(|_| "Failed to fetch settings".to_string())?;

    Ok(settings)
}

#[tauri::command]
pub async fn save_settings(state: tauri::State<'_, AppState>, settings: AppSettings) -> Result<(), String> {
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