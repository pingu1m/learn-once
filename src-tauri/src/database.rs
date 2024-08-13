use std::fs::OpenOptions;
// use tauri::{App, AppHandle};
// use std::fs;
// use std::time::Duration;
use sqlx::{Pool, Sqlite};
use sqlx::sqlite::SqlitePoolOptions;
use tauri::{App, Manager};
// use sqlx::sqlite::{SqliteAutoVacuum, SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};

const CURRENT_DB_VERSION: u32 = 1;

pub type Db = Pool<Sqlite>;
pub struct AppState {
    pub db: Db,
}
// /// Create a DB pool, and also open an initial connection to test it.
// pub async fn connect(db_file: &Path) -> Result<Self, sqlx::Error> {
// }
pub async fn setup_db(app: &App) -> Db {
    let mut path = app
        .path()
        // .path_resolver() // tauri 1
        .app_data_dir()
        .expect("could not get data_dir");
    match std::fs::create_dir_all(path.clone()) {
        Ok(_) => {}
        Err(err) => {
            panic!("error creating directory {}", err);
        }
    };
    path.push("db.sqlite");
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
    let db = SqlitePoolOptions::new()
        .connect(path.to_str().unwrap())
        .await
        .unwrap();
    sqlx::migrate!("./migrations").run(&db).await.unwrap();
    db
}

// /// Initializes the database connection, creating the .sqlite file if needed, and upgrading the database
// /// if it's out of date.
// pub async fn initialize_database(app_handle: &AppHandle) -> Result< Pool<Sqlite>, sqlx::Error> {
//     // let mut conn = SqliteConnectOptions::from_str(db_file)?
//     //     .journal_mode(SqliteJournalMode::Wal)
//     //     .create_if_missing(true)
//     //     .connect()
//     //     .await?;
//     let app_dir = app_handle.path_resolver().app_data_dir().expect("The app data directory should exist.");
//     fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
//     let db_file = app_dir.join("MyApp.sqlite");


// let pool = SqlitePoolOptions::new()
//     .max_connections(20)
//     .idle_timeout(Duration::from_secs(60))
//     .acquire_timeout(Duration::from_secs(5))
//     .connect_with(
//         SqliteConnectOptions::new()
//             .auto_vacuum(SqliteAutoVacuum::Incremental)
//             .journal_mode(SqliteJournalMode::Wal)
//             .filename(db_file),
//     )
//     .await?;

// // Ok(Self {
// //     pool: Arc::new(pool),
// // })


// // let mut db = Connection::open(sqlite_path)?;

// // let mut user_pragma = db.prepare("PRAGMA user_version")?;
// // let existing_user_version: u32 = user_pragma.query_row([], |row| { Ok(row.get(0)?) })?;
// // drop(user_pragma);
// //
// // upgrade_database_if_needed(&mut db, existing_user_version)?;

//     Ok(pool)
// }

//  /// Upgrades the database to the current version.
// pub fn upgrade_database_if_needed(db: &mut Connection, existing_version: u32) -> Result<(), rusqlite::Error> {
//     if existing_version < CURRENT_DB_VERSION {
//         db.pragma_update(None, "journal_mode", "WAL")?;
//
//         let tx = db.transaction()?;
//
//         tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;
//
//         tx.execute_batch(
//             "
//       CREATE TABLE items (
//         title TEXT NOT NULL
//       );"
//         )?;
//
//         tx.commit()?;
//     }
//
//     Ok(())
// }

// pub fn add_item(title: &str, db: &Connection) -> Result<(), rusqlite::Error> {
//     let mut statement = db.prepare("INSERT INTO items (title) VALUES (@title)")?;
//     statement.execute(named_params! { "@title": title })?;
//
//     Ok(())
// }

// pub fn get_all(db: &Connection) -> Result<Vec<String>, rusqlite::Error> {
//     let mut statement = db.prepare("SELECT * FROM items")?;
//     let mut rows = statement.query([])?;
//     let mut items = Vec::new();
//     while let Some(row) = rows.next()? {
//         let title: String = row.get("title")?;
//
//         items.push(title);
//     }
//
//     Ok(items)
// }