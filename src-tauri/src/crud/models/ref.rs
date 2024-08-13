#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
enum TodoStatus {
    Incomplete,
    Complete,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct Todo {
    id: u16,
    description: String,
    status: TodoStatus,
}

#[tauri::command]
async fn add_todo(state: tauri::State<'_, AppState>, description: &str) -> Result<(), String> {
    let db = &state.db;
    sqlx::query("INSERT INTO todos (description, status) VALUES (?1, ?2)")
        .bind(description)
        .bind(TodoStatus::Incomplete)
        .execute(db)
        .await
        .map_err(|e| format!("Error saving todo: {}", e))?;
    Ok(())
}