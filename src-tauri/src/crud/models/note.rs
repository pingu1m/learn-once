use sqlx::{FromRow, Row, Executor};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::state::AppState;

#[derive(TS, Serialize, Deserialize, Clone, FromRow, Debug)]
#[ts(export, rename_all="camelCase")]
#[ts(export_to = "../../../src/bindings/note.ts")]
pub struct Note {
    id: String,  // UUID as a String
    title: String,
    email: String,
    subject: String,
    text: String,
    date: String,  // ISO 8601 format string
    favorite: bool,
    labels: String,  // Vector of strings
    language: String,
    updated_at: String,
    created_at: String,
}

#[tauri::command]
pub async fn note_insert(state: tauri::State<'_, AppState>, note: Note) -> Result<String, String> {
    let db = &state.db;

    // let labels = note.labels.join(","); // Convert Vec<String> to a comma-separated string
    dbg!(&note);

    let query_result = sqlx::query(
        "INSERT INTO note (id, title, email, subject, text, date, favorite, labels, language, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
        .bind(&note.id)
        .bind(&note.title)
        .bind(&note.email)
        .bind(&note.subject)
        .bind(&note.text)
        .bind(&note.date)
        .bind(note.favorite)
        .bind(&note.labels)
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.created_at)
        .execute(db)
        .await;

    if query_result.is_err() {
        // db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    // db.close().await;
    Ok(note.id)
}


#[tauri::command]
pub async fn note_update(state: tauri::State<'_, AppState>, note: Note) -> Result<String, String> {
    let db = &state.db;
    dbg!(&note);

    let query_result = sqlx::query(
        "UPDATE note
         SET title = ?, email = ?, subject = ?, text = ?, date = ?, favorite = ?, labels = ?, language = ?, updated_at = ?
         WHERE id = ?"
    )
        .bind(&note.title)
        .bind(&note.email)
        .bind(&note.subject)
        .bind(&note.text)
        .bind(&note.date)
        .bind(note.favorite)
        .bind(&note.labels)
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.id)
        .execute(db)
        .await;

    if query_result.is_err() {
        // db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    // db.close().await;
    Ok(note.id)
}

#[tauri::command]
pub async fn note_delete(state: tauri::State<'_, AppState>, id: String) -> Result<String, String> {
    let db = &state.db;
    dbg!(&id);

    let query_result = sqlx::query("DELETE FROM note WHERE id=?")
        .bind(id.clone())
        .execute(db)
        .await;

    if query_result.is_err() {
        // db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    // db.close().await;
    Ok(id)
}

#[tauri::command]
pub async fn note_select(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let db = &state.db;
    dbg!("Note select rs.");

    let query_result: Result<Vec<Note>, _> = sqlx::query_as("SELECT * FROM note ORDER BY id DESC")
        .fetch_all(db)
        .await;

    if query_result.is_err() {
        // db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    let results = query_result.unwrap();
    let encoded_message = serde_json::to_string(&results).unwrap();
    // db.close().await;
    Ok(encoded_message)
}
