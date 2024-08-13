use sqlx::{FromRow, SqlitePool};
use serde::{Deserialize, Serialize};
use crate::util;
use sqlx::Executor;
use ts_rs::TS;
// #[path = "../util/mod.rs"]
// mod util;

#[derive(TS, Serialize, Deserialize, Clone, FromRow, Debug)]
#[ts(export, rename_all="camelCase")]
#[ts(export_to = "../../../src/bindings/note.ts")]
pub struct Note {
    id: i64,
    title: String,
    content: String,
    tags: String,
    language: String,
    updated_at: String,
    created_at: String,
}

#[tauri::command]
pub async fn note_insert(note: Note) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();

    let query_result = sqlx::query(
        "INSERT INTO note (title, content, tags, language, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
        .bind(&note.title)
        .bind(&note.content)
        .bind(&note.tags) // Assuming tags are stored as a comma-separated string
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.created_at)
        .execute(&db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    let id = query_result.unwrap().last_insert_rowid();
    db.close().await;
    Ok(id)
}


#[tauri::command]
pub async fn note_update(note: Note) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();

    let query_result = sqlx::query(
        "UPDATE note
         SET title = ?, content = ?, tags = ?, language = ?, updated_at = ?
         WHERE id = ?"
    )
        .bind(&note.title)
        .bind(&note.content)
        .bind(&note.tags) // Assuming tags are stored as a comma-separated string
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(note.id)
        .execute(&db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    db.close().await;
    Ok(note.id)
}


#[tauri::command]
pub async fn note_delete(id: i64) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();

    let query_result = sqlx::query("DELETE FROM note WHERE id=?")
        .bind(id)
        .execute(&db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    db.close().await;
    Ok(id)
}


#[tauri::command]
pub async fn note_select() -> Result<String, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();

    let query_result: Result<Vec<Note>, _> = sqlx::query_as("SELECT * FROM note ORDER BY id DESC")
        .fetch_all(&db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    let results = query_result.unwrap();
    let encoded_message = serde_json::to_string(&results).unwrap();
    db.close().await;
    Ok(encoded_message)
}
