use std::collections::HashMap;
use sqlx::{FromRow, Executor, Row};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json;

use pulldown_cmark::{Parser, Options, Event, Tag, TagEnd};
use pulldown_cmark::CodeBlockKind::Fenced;
use regex::Regex;
use crate::crud::models::note::Note;
// use crate::crud::models::card::Card;
use crate::state::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
enum LearnStatus {
    NotStarted,
    LowConfidence,
    MediumConfidence,
    HighConfidence,
    Learned,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Card {
    id: Option<i32>,
    session_id: Option<i32>,
    title: String,
    hint: String,
    description: String,
    example: String,
    learn_status: LearnStatus,
    session_count: i32,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
struct RawCard {
    title: String,
    hint: String,
    description: String,
    example: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct StudySession {
    id: Option<i32>,
    title: String,
    session_count: i32,
    bag_size: i32,
    created_at: String,
    latest_run: Option<String>,
    #[sqlx(skip)]
    cards: Vec<Card>,
    #[sqlx(skip)]
    cards_bag: Vec<Card>,
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

    let query_result = sqlx::query_as::<_, StudySession>("SELECT * FROM study_sessions ORDER BY id DESC")
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

    let query_result: Result<Vec<StudySession>, _> = sqlx::query_as(
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

// #[tauri::command]
// pub async fn start_study_session(state: tauri::State<'_, AppState>, session: StudySession) -> Result<StudySession, String> {
//     let db = &state.db;
//     let mut session = session;
//     session.session_count += 1;
//
//     let mut new_bag = Vec::new();
//
//     // for card in &mut session.cards {
//     //     if card.session_count == card.session_count {
//     //         let trigger_session = card_session_count + card_confidence_value(&card.learn_status);
//     //         if trigger_session == session.session_count && new_bag.len() < session.bag_size as usize {
//     //             new_bag.push(card.clone());
//     //             card.session_count = session.session_count + 1;
//     //         }
//     //     } else {
//     //         // First time seeing this card
//     //         card.session_count = session.session_count;
//     //         if new_bag.len() < session.bag_size as usize {
//     //             new_bag.push(card.clone());
//     //         }
//     //     }
//     // }
//
//     session.cards_bag = new_bag;
//     session.latest_run = Some(Utc::now());
//
//     // Save updated session if necessary
//
//
//     // let query_result = sqlx::query(
//     //     "INSERT INTO card (title, front, back, extra)
//     //      VALUES (?, ?, ?, ?)"
//     // )
//     //     .bind(&card.title)
//     //     .bind(&card.front)
//     //     .bind(&card.back)
//     //     .bind(&card.extra)
//     //     .execute(db)
//     //     .await;
//     //
//     // if query_result.is_err() {
//     //     db.close().await;
//     //     return Err(format!("{:?}", query_result.err()));
//     // }
//     //
//     // let id = query_result.unwrap().last_insert_rowid();
//     // db.close().await;
//     // Ok(id)
//
//     Ok(session)
// }

fn card_confidence_value(status: &LearnStatus) -> usize {
    match status {
        LearnStatus::LowConfidence => 1,
        LearnStatus::MediumConfidence => 2,
        LearnStatus::HighConfidence => 3,
        LearnStatus::Learned => 4,
        LearnStatus::NotStarted => 0,
    }
}

#[tauri::command]
pub async fn create_study_session(
    state: tauri::State<'_, AppState>,
    note_id: String,
) -> Result<bool, String> {
    // Fetch the note from the database
    let db = &state.db;
    let note: Note = sqlx::query_as(
        "SELECT id, title, text, updated_at FROM note WHERE id = ?",
    )
        .bind(note_id)
        .fetch_one(db)
        .await
        .map_err(|e| format!("Failed to fetch note: {}", e))?;

    let now = Utc::now(); // Assuming you're using the `chrono` crate for datetime handling
    let study_session_title = format!("{} - {}", now, note.title);
    let study_session = sqlx::query("INSERT INTO study_sessions (title) VALUES (?) RETURNING *")
        .bind(study_session_title)
        .fetch_one(db)
        // .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to create study session: {}", e))?;

    let session_id = study_session.get::<i32, _>(0);
    let cards = parse_cards_from_markdown(&note.text)?;
    for card in cards {
        sqlx::query(
            "INSERT INTO cards (session_id, title, hint, description, example, learn_status)
             VALUES (?, ?, ?, ?, ?, ?, 0)",
        )
            .bind(session_id)
            .bind(card.title)
            .bind(card.hint)
            .bind(card.description)
            .bind(card.example)
            .bind("NotStarted".to_string())
            .execute(db)
            .await
            .map_err(|e| format!("Failed to save card: {}", e))?;
    }

    Ok(true)
}

fn parse_cards_from_markdown(markdown: &str) -> Result<Vec<RawCard>, String> {
    let mut cards = Vec::new();
    let mut in_toml_block = false;
    let mut toml_content = String::new();

    let parser = Parser::new_ext(markdown, Options::all());

    println!("Starting Markdown parsing..."); // Debugging statement

    for event in parser {
        match event {
            Event::Start(Tag::CodeBlock(Fenced(lang))) if lang.as_ref() == "toml" => {
                in_toml_block = true;
                println!("Found TOML code block, starting to accumulate content..."); // Debugging statement
            }
            Event::End(TagEnd::CodeBlock) => {
                in_toml_block = false;
                println!("TOML block ended, accumulated content: {:?}", toml_content); // Debugging statement

                // Parse the TOML block
                let parsed: HashMap<String, Vec<RawCard>> = match toml::from_str(toml_content.as_str()) {
                    Ok(parsed) => {
                        dbg!("Successfully parsed TOML block", &parsed);
                        parsed
                    }
                    Err(e) => {
                        dbg!("Failed to parse TOML block", e.to_string());
                        return Err(format!("Failed to parse TOML: {}", e));
                    }
                };

                if let Some(parsed_cards) = parsed.get("card") {
                    for card in parsed_cards {
                        dbg!("Processing parsed card", card);
                        cards.push(card.clone());
                    }
                } else {
                    dbg!("No 'card' section found in the TOML block");
                }

                toml_content.clear(); // Reset for the next TOML block
            }
            Event::Text(text) if in_toml_block => {
                toml_content.push_str(&text);
            }
            _ => {} // Ignore other Markdown elements
        }
    }
    println!("Markdown parsing complete, found {} cards.", cards.len()); // Debugging statement

    Ok(cards)
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_cards_from_markdown() {
        let markdown = r#"
        # This is my notes file

```toml
[[card]]
title = "What is Rust?"
hint = "Programming Language"
description = "A systems programming language focused on safety, speed, and concurrency."
example = "Rust is often used for performance-critical services."
[[card]]
title = "What is ownership in Rust?"
hint = "Memory Management"
description = "A set of rules that governs how a Rust program manages memory."
example = "Ownership ensures memory safety without a garbage collector."
```
        "#;

        let result = parse_cards_from_markdown(markdown);
        dbg!(&result);

        assert!(result.is_ok());
        let cards = result.unwrap();
        assert_eq!(cards.len(), 2);

        let card1 = &cards[0];
        assert_eq!(card1.title, "What is Rust?");
        assert_eq!(card1.hint, "Programming Language");
        assert_eq!(card1.description, "A systems programming language focused on safety, speed, and concurrency.");
        assert_eq!(card1.example, "Rust is often used for performance-critical services.");

        let card2 = &cards[1];
        assert_eq!(card2.title, "What is ownership in Rust?");
        assert_eq!(card2.hint, "Memory Management");
        assert_eq!(card2.description, "A set of rules that governs how a Rust program manages memory.");
        assert_eq!(card2.example, "Ownership ensures memory safety without a garbage collector.");
    }
}