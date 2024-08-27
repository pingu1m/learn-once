-- Add migration script here
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    session_count INTEGER NOT NULL DEFAULT 0,
    bag_size INTEGER NOT NULL DEFAULT 3,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latest_run TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    title TEXT NOT NULL,
    hint TEXT NOT NULL DEFAULT '',
    description  NOT NULL DEFAULT '',
    example  NOT NULL DEFAULT '',
    learn_status TEXT NULL,
    session_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES study_sessions(id)
);