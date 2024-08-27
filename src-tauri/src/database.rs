use std::fs::OpenOptions;
use std::time::Duration;
use sqlx::sqlite::{SqliteAutoVacuum, SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
use tauri::{App, Manager};
use crate::state::Db;

pub async fn setup_db(app: &App) -> Db {
    //     let app_dir = app_handle.path_resolver().app_data_dir().expect("The app data directory should exist.");
    //     fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
    //     let db_file = app_dir.join("MyApp.sqlite");
    let mut path = app
        .path()
        .app_data_dir()
        .expect("could not get data_dir");
    match std::fs::create_dir_all(path.clone()) {
        Ok(_) => {}
        Err(err) => {
            panic!("error creating directory {}", err);
        }
    };
    path.push("db.sqlite");
    dbg!(&path);
    let result = OpenOptions::new().create_new(true).write(true).open(&path);
    match result {
        Ok(_) => println!("database file created"),
        Err(err) => match err.kind() {
            std::io::ErrorKind::AlreadyExists => println!("database file already exists"),
            _ => {
                panic!("error creating databse file {}", err);
            }
        },
    }

    // let pool = SqlitePoolOptions::new()
    //     .await?;
    let db = SqlitePoolOptions::new()
        // .max_connections(20)
        // .idle_timeout(Duration::from_secs(60))
        .max_lifetime(None)
        .idle_timeout(None)
        // .acquire_timeout(Duration::from_secs(5))
        // .connect_with(
        //     // SqliteConnectOptions::from_str(db_file)?
        //     SqliteConnectOptions::new()
        //         .auto_vacuum(SqliteAutoVacuum::Incremental)
        //         //     .create_if_missing(true)
        //         .journal_mode(SqliteJournalMode::Wal)
        //         .filename(path.to_str().unwrap()),
        // )
        // // .connect()
        .connect(path.to_str().unwrap())
        .await.unwrap();
    sqlx::migrate!("./migrations").run(&db).await.unwrap();
    db
}