use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Executor};
use ts_rs::TS;
use crate::crud::models::card::Card;
use crate::state::AppState;

#[derive(TS, Serialize, Deserialize, Clone, FromRow, Debug)]
#[ts(export, rename_all = "camelCase")]
#[ts(export_to = "../../../src/bindings/session.ts")]
pub struct Session {
    id: i64,
    created_at: String,
    updated_at: String,
    num_cards: i32,
    num_cards_learned: i32,
}


#[tauri::command]
pub async fn session_insert(state: tauri::State<'_, AppState>, session: Session) -> Result<i64, String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "INSERT INTO session (created_at, updated_at, num_cards, num_cards_learned)
         VALUES (?, ?, ?, ?)"
    )
        .bind(&session.created_at)
        .bind(&session.updated_at)
        .bind(session.num_cards)
        .bind(session.num_cards_learned)
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
pub async fn session_update(state: tauri::State<'_, AppState>, session: Session) -> Result<i64, String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "UPDATE session
         SET created_at = ?, updated_at = ?, num_cards = ?, num_cards_learned = ?
         WHERE id = ?"
    )
        .bind(&session.created_at)
        .bind(&session.updated_at)
        .bind(session.num_cards)
        .bind(session.num_cards_learned)
        .bind(session.id)
        .execute(db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    db.close().await;
    Ok(session.id)
}

#[tauri::command]
pub async fn session_delete(state: tauri::State<'_, AppState>, id: i64) -> Result<i64, String> {
    let db = &state.db;

    let query_result = sqlx::query("DELETE FROM session WHERE id=?")
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
pub async fn session_select(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let db = &state.db;

    let query_result = sqlx::query_as::<_, Session>("SELECT * FROM session ORDER BY id DESC")
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

#[tauri::command]
pub async fn link_card_to_session(state: tauri::State<'_, AppState>, session_id: i64, card_id: i64) -> Result<(), String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "INSERT INTO session_cards (session_id, card_id)
         VALUES (?, ?)"
    )
        .bind(session_id)
        .bind(card_id)
        .execute(db)
        .await;

    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    db.close().await;
    Ok(())
}

#[tauri::command]
pub async fn fetch_cards_by_session(state: tauri::State<'_, AppState>, session_id: i64) -> Result<String, String> {
    let db = &state.db;

    let query_result = sqlx::query_as::<_, Card>(
        "SELECT c.* FROM card c
         JOIN session_cards sc ON c.id = sc.card_id
         WHERE sc.session_id = ?"
    )
        .bind(session_id)
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

#[tauri::command]
pub async fn fetch_sessions_by_card(state: tauri::State<'_, AppState>, card_id: i64) -> Result<String, String> {
    let db = &state.db;

    let query_result: Result<Vec<Session>, _> = sqlx::query_as(
        "SELECT s.* FROM session s
         JOIN session_cards sc ON s.id = sc.session_id
         WHERE sc.card_id = ?"
    )
        .bind(card_id)
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
