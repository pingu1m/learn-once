use sqlx::{FromRow, Row, Executor};
use serde::{Deserialize, Serialize};
use crate::state::AppState;

#[derive(Serialize, Deserialize, Clone, FromRow, Debug)]
pub struct Note {
    pub id: i32,  // UUID as a String
    pub title: String,
    pub text: String,
    pub date: String,  // ISO 8601 format string
    pub favorite: bool,
    pub labels: String,  // Vector of strings
    pub language: String,
    pub updated_at: String,
    pub created_at: String,
}

#[tauri::command]
pub async fn note_insert(state: tauri::State<'_, AppState>, note: Note) -> Result<String, String> {
    let db = &state.db;

    // let labels = note.labels.join(","); // Convert Vec<String> to a comma-separated string
    dbg!(&note);

    let query_result = sqlx::query(
        "INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
        .bind(&note.title)
        .bind(&note.text)
        .bind(&note.date)
        .bind(note.favorite)
        .bind(&note.labels)
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.created_at)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to save note: {}", e))?;

    let note_id = query_result.last_insert_rowid();
    dbg!(&note_id);
    Ok(note_id.to_string())
}


#[tauri::command]
pub async fn note_update(state: tauri::State<'_, AppState>, note: Note) -> Result<String, String> {
    let db = &state.db;
    dbg!(&note);

    let query_result = sqlx::query(
        "UPDATE note
         SET title = ?, text = ?, date = ?, favorite = ?, labels = ?, language = ?, updated_at = ?
         WHERE id = ?"
    )
        .bind(&note.title)
        .bind(&note.text)
        .bind(&note.date)
        .bind(note.favorite)
        .bind(&note.labels)
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.id)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to save note: {}", e))?;

    Ok(note.id.to_string())
}

#[tauri::command]
pub async fn note_delete(state: tauri::State<'_, AppState>, id: i32) -> Result<u64, String> {
    let db = &state.db;
    dbg!(&id);

    let query_result = sqlx::query("DELETE FROM note WHERE id=?")
        .bind(id.clone())
        .execute(db)
        .await
        .map_err(|e| format!("Failed to delete note: {}", e))?;

    Ok(query_result.rows_affected())
}

#[tauri::command]
pub async fn note_select(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let db = &state.db;
    dbg!("Note select rs.");

    let results: Vec<Note> = sqlx::query_as("SELECT * FROM note ORDER BY id DESC")
        .fetch_all(db)
        .await
        .map_err(|e| format!("Failed to select note: {}", e))?;

    let encoded_message = serde_json::to_string(&results).unwrap();
    Ok(encoded_message)
}
