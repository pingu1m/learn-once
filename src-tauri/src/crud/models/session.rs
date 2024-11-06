use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json;
use sqlx::{Executor, FromRow, Row};
use std::collections::HashMap;

use crate::crud::models::note::Note;
use crate::state::AppState;
use pulldown_cmark::CodeBlockKind::Fenced;
use pulldown_cmark::{Event, Options, Parser, Tag, TagEnd};
use strum_macros::{Display, EnumString};

#[derive(Debug, Clone, Serialize, Deserialize, EnumString, Display)]
enum LearnStatus {
    NotStarted,
    LowConfidence,
    MediumConfidence,
    HighConfidence,
    Learned,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
struct Card {
    id: Option<i32>,
    session_id: Option<i32>,
    title: String,
    hint: String,
    description: String,
    example: String,
    learn_status: String,
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
pub struct StudySession {
    pub id: Option<i32>,
    pub title: String,
    pub session_count: i32,
    pub bag_size: i32,
    pub created_at: String,
    pub latest_run: Option<String>,
    #[sqlx(skip)]
    pub cards: Vec<Card>,
    #[sqlx(skip)]
    pub cards_bag: Vec<Card>,
}

#[tauri::command]
pub async fn session_delete(state: tauri::State<'_, AppState>, id: i64) -> Result<u64, String> {
    let query_result = sqlx::query("DELETE FROM cards WHERE session_id=?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete sessions: {}", e))?;

    let query_result = sqlx::query("DELETE FROM study_sessions WHERE id=?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to delete sessions: {}", e))?;

    Ok(query_result.rows_affected())
}

#[tauri::command]
pub async fn session_select(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let db = &state.db;

    let results: Vec<StudySession> =
        sqlx::query_as("SELECT * FROM study_sessions ORDER BY id DESC")
            .fetch_all(db)
            .await
            .map_err(|e| format!("Failed to fetch sessions: {}", e))?;

    let encoded_message = serde_json::to_string(&results).unwrap();
    Ok(encoded_message)
}

#[tauri::command]
pub async fn start_study_session(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<StudySession, String> {
    let db = &state.db;
    let mut session: StudySession = sqlx::query_as("SELECT * FROM study_sessions WHERE id = ?")
        .bind(id)
        .fetch_one(db)
        .await
        .map_err(|e| format!("Failed to fetch note: {}", e))?;

    session.session_count += 1;

    let mut cards: Vec<Card> = sqlx::query_as("SELECT * FROM cards WHERE session_id = ?")
        .bind(id)
        .fetch_all(db)
        .await
        .map_err(|e| format!("Failed to fetch cards: {}", e))?;

    let mut new_bag = Vec::new();

    for card in &mut cards {
        let trigger_session = card.session_count + card_confidence_value(card.learn_status.clone());
        if trigger_session == session.session_count {
            if new_bag.len() < session.bag_size as usize {
                new_bag.push(card.clone());
            } else {
                // Card did not fit the bag_size incrementing it for the next run
                card.session_count += 1;
            }
        }
    }
    for card in &mut cards {
        let learn_status = card.learn_status.parse().unwrap();
        match learn_status {
            LearnStatus::NotStarted => {
                if new_bag.len() < session.bag_size as usize {
                    new_bag.push(card.clone());
                }
            }
            _ => {}
        }
    }

    if new_bag.is_empty() {
        new_bag = cards.clone()
    }

    session.cards_bag = new_bag;
    session.cards = cards;
    session.latest_run = Some(Utc::now().format("%Y-%m-%d %H:%M:%S").to_string());

    Ok(session)
}

#[tauri::command]
pub async fn finish_study_session(
    state: tauri::State<'_, AppState>,
    session: StudySession,
) -> Result<(), String> {
    let db = &state.db;

    let study_session =
        sqlx::query("UPDATE study_sessions set latest_run = ?, session_count = ? WHERE id = ?")
            .bind(&session.latest_run)
            .bind(&session.session_count)
            .bind(&session.id)
            .execute(&state.db)
            .await
            .map_err(|e| format!("Failed to update study session: {}", e))?;

    dbg!(&session);
    dbg!(study_session.rows_affected());

    for card in &session.cards_bag {
        let update_card =
            sqlx::query("UPDATE cards set session_count = ?, learn_status = ? WHERE id = ?")
                .bind(card.session_count)
                .bind(card.learn_status.to_string())
                .bind(card.id)
                .execute(db)
                .await
                .map_err(|e| format!("Failed to save card: {}", e))?;
        dbg!(&card);
        dbg!(update_card.rows_affected());
    }

    Ok(())
}

#[tauri::command]
pub async fn create_study_session(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<bool, String> {
    // Fetch the note from the database
    let db = &state.db;
    let note: Note = sqlx::query_as("SELECT * FROM note WHERE id = ?")
        .bind(id)
        .fetch_one(db)
        .await
        .map_err(|e| format!("Failed to fetch note: {}", e))?;

    let cards = parse_cards_from_markdown(&note.text)?;
    if !cards.is_empty() {
        let now = Utc::now(); // Assuming you're using the `chrono` crate for datetime handling
        let study_session_title = format!("{} - {}", note.title, now.format("%Y-%m-%d %H:%M:%S"));
        let study_session =
            sqlx::query("INSERT INTO study_sessions (title) VALUES (?) RETURNING *")
                .bind(study_session_title)
                // .fetch_one(db)
                .execute(&state.db)
                .await
                .map_err(|e| format!("Failed to create study session: {}", e))?;

        // let session_id = study_session.get::<i32, _>(0);
        let session_id = study_session.last_insert_rowid();
        for card in cards {
            sqlx::query(
                "INSERT INTO cards (session_id, title, hint, description, example, learn_status)
             VALUES (?, ?, ?, ?, ?, ?)",
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
    } else {
        println!("No cards found. Session not created.");
        Ok(false)
    }
}

fn card_confidence_value(status: String) -> i32 {
    let status = status.parse().unwrap();
    match status {
        LearnStatus::LowConfidence => 1,
        LearnStatus::MediumConfidence => 2,
        LearnStatus::HighConfidence => 3,
        LearnStatus::Learned => 4,
        LearnStatus::NotStarted => 0,
    }
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
                println!("Found TOML code block, starting to accumulate content...");
                // Debugging statement
            }
            Event::End(TagEnd::CodeBlock) => {
                in_toml_block = false;
                println!("TOML block ended, accumulated content: {:?}", toml_content); // Debugging statement

                // Parse the TOML block
                let parsed: HashMap<String, Vec<RawCard>> =
                    match toml::from_str(toml_content.as_str()) {
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
        assert_eq!(
            card1.description,
            "A systems programming language focused on safety, speed, and concurrency."
        );
        assert_eq!(
            card1.example,
            "Rust is often used for performance-critical services."
        );

        let card2 = &cards[1];
        assert_eq!(card2.title, "What is ownership in Rust?");
        assert_eq!(card2.hint, "Memory Management");
        assert_eq!(
            card2.description,
            "A set of rules that governs how a Rust program manages memory."
        );
        assert_eq!(
            card2.example,
            "Ownership ensures memory safety without a garbage collector."
        );
    }
}
