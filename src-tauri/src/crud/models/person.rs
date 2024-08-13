use sqlx::{ FromRow, SqlitePool };
use serde::{ Serialize };
use crate::util;
// #[path = "../util/mod.rs"]
// mod util;

#[derive(Serialize, Clone, FromRow, Debug)]
pub struct Person {
    id: i64,
    name: String,
}

#[tauri::command]
pub async fn person_insert(name: &str) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx
        ::query("INSERT INTO person (name) VALUES (?)")
        .bind(name)
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
pub async fn person_update(id: i64, name: &str) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx
        ::query("UPDATE person SET name=? WHERE id=?")
        .bind(name)
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
pub async fn person_delete(id: i64) -> Result<i64, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx::query("DELETE FROM person WHERE id=?").bind(id).execute(&db).await;
    if query_result.is_err() {
        db.close().await;
        return Err(format!("{:?}", query_result.err()));
    }
    db.close().await;
    Ok(id)
}

#[tauri::command]
pub async fn person_select() -> Result<String, String> {
    let db_url = util::db::get_database();
    let db = SqlitePool::connect(&db_url).await.unwrap();
    let query_result = sqlx
        ::query_as::<_, Person>("SELECT id, name FROM person ORDER BY id DESC")
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
