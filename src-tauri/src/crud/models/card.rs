use serde::{Deserialize, Serialize};
use sqlx::{FromRow, migrate::MigrateDatabase, Row, Sqlite, SqlitePool};

use crate::util;
use sqlx::Executor;
use ts_rs::TS;
use crate::database::AppState;
use crate::util::db;

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
    // let db_url = util::db::get_database();
    // let db = SqlitePool::connect(&db_url).await.unwrap();

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


#[tokio::test]
async fn test_card() {
    let db_url = util::db::get_database();
    db::create(&db_url).await;
    let pool = SqlitePool::connect(&db_url).await.unwrap();

    // Create table for the test

    pool.execute(
        "CREATE TABLE IF NOT EXISTS card (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            extra TEXT NOT NULL
        )"
    ).await.unwrap();
    match pool.execute("delete from card where id < 100;").await {
        Err(_) => println!("Table does not exists"),
        Ok(_) => println!("Table cleaned")
    }

    let card = Card {
        id: 0,
        title: "Test Title".to_string(),
        front: "Test Front".to_string(),
        back: "Test Back".to_string(),
        extra: "Test Extra".to_string(),
    };

    let id = card_insert(card.clone()).await.unwrap();
    assert!(id > 0);

    dbg!(id);

    let row: (String, String, String, String) = sqlx::query_as(
        "SELECT title, front, back, extra FROM card WHERE id = ?"
    )
        .bind(id)
        .fetch_one(&pool)
        .await
        .unwrap();

    assert_eq!(row.0, card.title);
    assert_eq!(row.1, card.front);
    assert_eq!(row.2, card.back);
    assert_eq!(row.3, card.extra);

    let card = Card {
        id: 1,
        title: "Original Title".to_string(),
        front: "Original Front".to_string(),
        back: "Original Back".to_string(),
        extra: "Original Extra".to_string(),
    };

    // Insert original card
    let _ = card_insert(card.clone()).await.unwrap();

    let updated_card = Card {
        id: 1,
        title: "Updated Title".to_string(),
        front: "Updated Front".to_string(),
        back: "Updated Back".to_string(),
        extra: "Updated Extra".to_string(),
    };

    let id = card_update(updated_card.clone()).await.unwrap();
    assert_eq!(id, updated_card.id);

    let row: (String, String, String, String) = sqlx::query_as(
        "SELECT title, front, back, extra FROM card WHERE id = ?"
    )
        .bind(id)
        .fetch_one(&pool)
        .await
        .unwrap();

    assert_eq!(row.0, updated_card.title);
    assert_eq!(row.1, updated_card.front);
    assert_eq!(row.2, updated_card.back);
    assert_eq!(row.3, updated_card.extra);

    let card = Card {
        id: 3,
        title: "Test Title Delete".to_string(),
        front: "Test Front".to_string(),
        back: "Test Back".to_string(),
        extra: "Test Extra".to_string(),
    };

    // Insert card
    let id = card_insert(card.clone()).await.unwrap();
    assert_eq!(id, card.id);

    // Delete card
    let deleted_id = card_delete(card.id).await.unwrap();
    assert_eq!(deleted_id, card.id);

    let result = sqlx::query("SELECT id FROM card WHERE id = ?")
        .bind(deleted_id)
        .fetch_optional(&pool)
        .await
        .unwrap();

    assert!(result.is_none());

    let card1 = Card {
        id: 0,
        title: "Title 1".to_string(),
        front: "Front 1".to_string(),
        back: "Back 1".to_string(),
        extra: "Extra 1".to_string(),
    };

    let card2 = Card {
        id: 0,
        title: "Title 2".to_string(),
        front: "Front 2".to_string(),
        back: "Back 2".to_string(),
        extra: "Extra 2".to_string(),
    };
    pool.execute("DROP TABLE card").await.unwrap();
    pool.execute(
        "CREATE TABLE IF NOT EXISTS card (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            extra TEXT NOT NULL
        )"
    ).await.unwrap();

    let _ = card_insert(card1.clone()).await.unwrap();
    let _ = card_insert(card2.clone()).await.unwrap();

    let result = card_select().await.unwrap();
    let cards: Vec<Card> = serde_json::from_str(&result).unwrap();

    assert_eq!(cards.len(), 2);
    assert_eq!(cards[0].title, card2.title);
    assert_eq!(cards[1].title, card1.title);
}





