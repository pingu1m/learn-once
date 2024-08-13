mod crud;
pub mod util;
pub mod state;
// mod app; // Explore this later it is very interesting.
pub mod database;

use crud::data::*;
use crud::models::{card::*, note::*, person::*, session::*, todo::*};

// use app::{ipc_message, ApplicationContext};
use tauri::{AppHandle, Manager, State};
use database::setup_db;
use crate::database::AppState;
// use state::AppState;

// Learn more about Tauri commands at use crate::crud::models::person::person_insert;https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(app_handle: AppHandle, name: &str) -> String {
    // Should handle errors instead of unwrapping here
    // app_handle.db(|db| database::add_item(name, db)).unwrap();

    // let items = app_handle.db(|db| database::get_all(db)).unwrap();

    // let items_string = items.join(" | ");
    let items_string = " asdf ";

    format!("Your name log: {}", items_string)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    // let context = ApplicationContext::new().await;

    let app = tauri::Builder::default()
        // .manage(AppState { db: Default::default() })
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }

            // tauri::async_runtime::spawn(async move {
            //     // A loop that takes output from the async process and sends it
            //     // to the webview via a Tauri Event
            //     let handle = app.handle();
            //     create_tables(handle.state()).await.expect("Database initialize should succeed");
            //
            //     // loop {
            //     //     if let Some(output) = async_proc_output_rx.recv().await {
            //     //         rs2js(output, &app_handle);
            //     //     }
            //     // }
            // });

            Ok(())
        })
        // .manage(context)
        .invoke_handler(
            tauri::generate_handler![
                greet,

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

                // ipc_message,
            ]
        )
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    let db = setup_db(&app).await;
    app.manage(AppState { db });
    app.run(|_, _| {});
}

