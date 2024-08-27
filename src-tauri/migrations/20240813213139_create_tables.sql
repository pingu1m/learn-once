DROP TABLE IF EXISTS note;
CREATE TABLE IF NOT EXISTS note (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    labels TEXT,
    language TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mock data insertion
INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at) VALUES
('Meeting Tomorrow', 'Testing testing testing', '2023-10-22T09:00:00', 1, 'meeting,work,important', 'plaintext', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at) VALUES
('Lunch Reminder', 'Note here testing testing 123.', '2023-10-21T12:00:00', 0, 'reminder,social', 'plaintext', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at) VALUES
('Code Review', 'Note here testing testing 123', '2023-10-20T15:00:00', 1, 'code,work,urgent', 'plaintext', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
