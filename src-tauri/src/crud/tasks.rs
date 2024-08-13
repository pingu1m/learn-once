use tauri::Manager;
use tokio::time::{sleep, Duration};
use tauri::Emitter;

#[tauri::command]
pub async fn start_periodic_task(app_handle: tauri::AppHandle) -> Result<(), String> {
    tokio::spawn(async move {
        loop {
            // Perform the task here
            println!("Running periodic task...");

            // Optionally, communicate with the frontend
            app_handle.emit("periodic-task", "Task executed").unwrap();

            // Wait for the next iteration (e.g., 10 seconds)
            sleep(Duration::from_secs(10)).await;
        }
    });

    Ok(())
}

// fn main() {
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![start_periodic_task])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }

// import { invoke } from '@tauri-apps/api/tauri';
//
// async function startTask() {
// try {
// await invoke('start_periodic_task');
// console.log('Periodic task started');
// } catch (error) {
// console.error('Failed to start periodic task', error);
// }
// }
//
// startTask();

// import { listen } from '@tauri-apps/api/event';
//
// listen('periodic-task', (event) => {
// console.log('Received event from periodic task:', event.payload);
// });
