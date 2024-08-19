mod crud;
pub mod state;
// mod app; // Explore this later it is very interesting.
pub mod database;

use std::time::Duration;
use crud::data::*;
use crud::models::{card::*, note::*, session::*};

use tauri::{AppHandle, Manager, State};
use tokio::time::sleep;
use database::setup_db;
use crate::state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            tokio::spawn(async move {
                loop {
                    // Perform the task here
                    println!("Running periodic task...");

                    // Optionally, communicate with the frontend
                    // app.app_handle.emit("periodic-task", "Task executed").unwrap();

                    // Wait for the next iteration (e.g., 10 seconds)
                    sleep(Duration::from_secs(10)).await;
                }
            });

            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                note_insert,
                note_update,
                note_delete,
                note_select,

                session_insert,
                session_update,
                session_delete,
                session_select,

                card_insert,
                card_update,
                card_delete,
                card_select,
            ]
        )
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    let db = setup_db(&app).await;
    app.manage(AppState { db });
    app.run(|_, _| {});
}

