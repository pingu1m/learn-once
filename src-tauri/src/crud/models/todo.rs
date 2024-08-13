use sqlx::{ FromRow, SqlitePool };
use serde::{ Serialize };

// #[path = "../util/mod.rs"]
// mod util;
use crate::util;

#[derive(Serialize, Clone, FromRow, Debug)]
pub struct Todo {
    id: i64,
    date: String,
    notes: String,
    completed: i64,
}

#[tauri::command]
pub async fn todo_insert(
    date: &str,
    notes: &str,
    personId: i64,
    completed: i64
) -> Result<i64, String> {
    #![allow(non_snake_case)]
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx
        ::query("INSERT INTO todo (date, notes, person_id, completed) VALUES (?, ?, ?, ?)")
        .bind(date)
        .bind(notes)
        .bind(personId)
        .bind(completed)
        .execute(&db).await;
    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }

    let id = query_result.unwrap().last_insert_rowid();
    db.close().await;
    Ok(id)
}

#[tauri::command]
pub async fn todo_update(
    id: i64,
    date: &str,
    notes: &str,
    personId: i64,
    completed: i64
) -> Result<i64, String> {
    #![allow(non_snake_case)]
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx
        ::query("UPDATE todo SET date=?, notes=?, person_id=?, completed=? WHERE id=?")
        .bind(date)
        .bind(notes)
        .bind(personId)
        .bind(completed)
        .bind(id)
        .execute(&db).await;
    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }
    db.close().await;
    Ok(id)
}

#[tauri::command]
pub async fn todo_delete(id: i64) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx::query("DELETE FROM todo WHERE id=?").bind(id).execute(&db).await;
    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }
    db.close().await;
    Ok(id)
}

#[tauri::command]
pub async fn todo_select(personId: i64) -> Result<String, String> {
    #![allow(non_snake_case)]
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx
        ::query_as::<_, Todo>("SELECT id, date, notes, completed FROM todo WHERE person_id=?")
        .bind(personId)
        .fetch_all(&db).await;
    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }
    let results = query_result.unwrap();
    let encoded_message = serde_json::to_string(&results).unwrap();
    db.close().await;
    Ok(format!("{:?}", encoded_message))
}
