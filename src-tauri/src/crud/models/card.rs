use sqlx::{FromRow, Row, Executor};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::state::AppState;

#[derive(TS, Serialize, Deserialize, Clone, FromRow, Debug)]
#[ts(rename_all = "camelCase")]
#[ts(export, export_to = "../../card.ts")]
pub struct Card {
    id: i64,
    title: String,
    front: String,
    back: String,
    extra: String,
}

#[tauri::command]
pub async fn card_insert(state: tauri::State<'_, AppState>, card: Card) -> Result<i64, String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "INSERT INTO card (title, front, back, extra)
         VALUES (?, ?, ?, ?)"
    )
        .bind(&card.title)
        .bind(&card.front)
        .bind(&card.back)
        .bind(&card.extra)
        .execute(db)
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
pub async fn card_update(state: tauri::State<'_, AppState>, card: Card) -> Result<i64, String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "UPDATE card
         SET title = ?, front = ?, back = ?, extra = ?
         WHERE id = ?"
    )
        .bind(&card.title)
        .bind(&card.front)
        .bind(&card.back)
        .bind(&card.extra)
        .bind(card.id)
        .execute(db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    db.close().await;
    Ok(card.id)
}


#[tauri::command]
pub async fn card_delete(state: tauri::State<'_, AppState>, id: i64) -> Result<i64, String> {
    let db = &state.db;

    let query_result = sqlx::query("DELETE FROM card WHERE id=?")
        .bind(id)
        .execute(db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    db.close().await;
    Ok(id)
}


#[tauri::command]
pub async fn card_select(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let db = &state.db;

    let query_result: Result<Vec<Card>, _> = sqlx::query_as("SELECT * FROM card ORDER BY id DESC")
        .fetch_all(db)
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