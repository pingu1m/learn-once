-- Add migration script here
CREATE TABLE IF NOT EXISTS note_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    labels TEXT,
    language TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Drop old table
DROP TABLE note;

-- Rename new table to the original table name
ALTER TABLE note_new RENAME TO note;

-- Mock data insertion
INSERT INTO note (id, title, email, subject, text, date, favorite, labels, language, updated_at, created_at) VALUES
('6c84fb90-12c4-11e1-840d-7b25c5ee775a', 'Meeting Tomorrow', 'williamsmith@example.com', 'William Smith', 'Testing testing testing', '2023-10-22T09:00:00', 1, 'meeting,work,important', 'plaintext', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO note (id, title, email, subject, text, date, favorite, labels, language, updated_at, created_at) VALUES
('6c84fb90-12c4-11e1-840d-7b25c5ee775b', 'Lunch Reminder', 'janedoe@example.com', 'Jane Doe', 'Note here testing testing 123.', '2023-10-21T12:00:00', 0, 'reminder,social', 'plaintext', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO note (id, title, email, subject, text, date, favorite, labels, language, updated_at, created_at) VALUES
('6c84fb90-12c4-11e1-840d-7b25c5ee775c', 'Code Review', 'developer@example.com', 'Code Review Request', 'Note here testing testing 123', '2023-10-20T15:00:00', 1, 'code,work,urgent', 'plaintext', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
