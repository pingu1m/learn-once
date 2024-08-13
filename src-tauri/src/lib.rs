mod crud;
pub mod util;
// mod app; // Explore this later it is very interesting.

use crud::data::*;
use crud::models::{card::*,note::*,person::*,session::*,todo::*};

// use app::{ipc_message, ApplicationContext};
use tauri::Manager;

// Learn more about Tauri commands at use crate::crud::models::person::person_insert;https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    // let context = ApplicationContext::new().await;

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
            .setup(|app| {
                #[cfg(debug_assertions)] // only include this code on debug builds
                {
                    let window = app.get_webview_window("main").unwrap();
                    window.open_devtools();
                    window.close_devtools();
                }
                Ok(())
            })
        // .manage(context)
        .invoke_handler(
            tauri::generate_handler![
                greet,

                create_tables,
                fill_tables,

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

                person_insert,
                person_update,
                person_delete,
                person_select,

                todo_insert,
                todo_update,
                todo_delete,
                todo_select,

                // ipc_message,
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
