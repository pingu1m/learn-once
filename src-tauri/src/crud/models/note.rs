use crate::crud::models::settings::AppSettings;
use crate::state::{AppState, Db};
use octocrab::Octocrab;
use serde::{Deserialize, Serialize};
use sqlx::{Executor, FromRow, Row};

#[derive(Serialize, Deserialize, Clone, FromRow, Debug)]
pub struct Note {
    pub id: i32, // UUID as a String
    pub title: String,
    pub text: String,
    pub date: String, // ISO 8601 format string
    pub favorite: bool,
    pub labels: String, // Vector of strings
    pub language: String,
    pub updated_at: String,
    pub created_at: String,
    pub gist_key: String, // New field
    pub gist_sync: bool,  // New field
}

#[tauri::command]
pub async fn test_gist_token(state: tauri::State<'_, AppState>) -> Result<String, String> {
    // Fetch settings to get the GitHub Gist token
    let db = &state.db;
    let settings = fetch_settings(db).await?;

    let token = &settings.github_gist_token; // Retrieve the token

    // Create an Octocrab instance with the token
    let octocrab = Octocrab::builder()
        .personal_token(token.clone())
        .build()
        .map_err(|e| format!("Failed to create Octocrab instance: {}", e))?;

    // Try to list the user's Gists to validate the token
    match octocrab
        .gists()
        .list_all_gists()
        .page(1u32)
        .per_page(10u8)
        .send()
        .await
    {
        Ok(gists) => {
            // Create a list of Gist IDs or titles to return
            let gist_list: Vec<String> = gists.items.iter().map(|gist| gist.id.clone()).collect();
            let gist_list_str = gist_list.join(", "); // Join Gist IDs with a comma for output
            Ok(format!("Gist token is valid. Gists: {}", gist_list_str))
        }
        Err(e) => Err(format!("Failed to validate Gist token: {}", e)),
    }
}

pub async fn fetch_settings(db: &Db) -> Result<AppSettings, String> {
    let result = sqlx::query_as::<_, AppSettings>(
        "SELECT * FROM settings WHERE id = 1", // Assuming you have one settings row
    )
    .fetch_one(db)
    .await
    .map_err(|e| format!("Failed to fetch settings: {}", e))?;

    Ok(result)
}

fn get_language_extension(language: &str) -> &'static str {
    match language.to_lowercase().as_str() {
        "javascript" => "js",
        "typescript" => "ts",
        "markdown" => "md",
        "python" => "py",
        "rust" => "rs",
        "html" => "html",
        "css" => "css",
        "json" => "json",
        "yaml" => "yml",
        "c" => "c",
        "cpp" => "cpp",
        "java" => "java",
        "ruby" => "rb",
        "php" => "php",
        "go" => "go",
        "swift" => "swift",
        "kotlin" => "kt",
        "shell" => "sh",
        _ => "txt",
    }
}

fn gist_key(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '_' })
        .collect::<String>()
        .split('_')
        .filter(|s| !s.is_empty())
        .collect::<Vec<&str>>()
        .join("_")
}

pub async fn sync_gist_if_enabled(note: &Note, db: &Db) -> Result<(), String> {
    if note.gist_sync {
        let settings = fetch_settings(db).await?;
        let token = settings.github_gist_token;

        let octocrab = Octocrab::builder()
            .personal_token(token.clone())
            .build()
            .map_err(|e| format!("Failed to auth Octocrab instance: {}", e))?;

        let file_name = format!(
            "{}|{}.{}",
            &note.gist_key,
            gist_key(&note.title),
            get_language_extension(&note.language)
        );

        // Check if the Gist exists
        match octocrab.gists().get(file_name.clone()).await {
            Ok(existing_gist) => {
                // Update existing Gist
                let gitignore = octocrab
                    .gists()
                    .update(existing_gist.id)
                    // Optional Parameters
                    .description("LearnOnce Update.")
                    .file(&file_name)
                    .with_content(&note.text)
                    .send()
                    .await
                    .map_err(|e| format!("Failed to update Gist: {}", e))?;

                dbg!(gitignore);
            }
            Err(_) => {
                // Create a new Gist if it doesn't exist
                let gitignore = octocrab
                    .gists()
                    .create()
                    .file(&file_name, &note.text)
                    // Optional Parameters
                    .description("LearnOnce note.")
                    .public(false)
                    .send()
                    .await
                    .map_err(|e| format!("Failed to create Gist: {}", e))?;

                dbg!(gitignore);
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn note_insert(state: tauri::State<'_, AppState>, note: Note) -> Result<String, String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at, gist_key, gist_sync)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
        .bind(&note.title)
        .bind(&note.text)
        .bind(&note.date)
        .bind(note.favorite)
        .bind(&note.labels)
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.created_at)
        .bind(&note.gist_key) // Bind new field
        .bind(note.gist_sync)  // Bind new field
        .execute(db)
        .await
        .map_err(|e| format!("Failed to save note: {}", e))?;

    let note_id = query_result.last_insert_rowid();

    // Sync with Gist if gist_sync is enabled
    sync_gist_if_enabled(&note, db).await?;

    dbg!(&note_id);
    Ok(note_id.to_string())
}

#[tauri::command]
pub async fn note_update(state: tauri::State<'_, AppState>, note: Note) -> Result<String, String> {
    let db = &state.db;

    let query_result = sqlx::query(
        "UPDATE note
         SET title = ?, text = ?, date = ?, favorite = ?, labels = ?, language = ?, updated_at = ?, gist_key = ?, gist_sync = ?
         WHERE id = ?"
    )
        .bind(&note.title)
        .bind(&note.text)
        .bind(&note.date)
        .bind(note.favorite)
        .bind(&note.labels)
        .bind(&note.language)
        .bind(&note.updated_at)
        .bind(&note.gist_key) // Bind new field
        .bind(note.gist_sync)  // Bind new field
        .bind(&note.id)
        .execute(db)
        .await
        .map_err(|e| format!("Failed to save note: {}", e))?;

    // Sync with Gist if gist_sync is enabled
    sync_gist_if_enabled(&note, db).await?;

    Ok(note.id.to_string())
}

#[tauri::command]
pub async fn note_delete(state: tauri::State<'_, AppState>, id: i32) -> Result<u64, String> {
    let db = &state.db;

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

    let results: Vec<Note> = sqlx::query_as("SELECT * FROM note ORDER BY id DESC")
        .fetch_all(db)
        .await
        .map_err(|e| format!("Failed to select note: {}", e))?;

    let encoded_message = serde_json::to_string(&results).unwrap();
    Ok(encoded_message)
}
