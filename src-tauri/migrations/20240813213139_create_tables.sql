DROP TABLE IF EXISTS note;
CREATE TABLE IF NOT EXISTS note (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    labels TEXT DEFAULT '',
    language TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at) VALUES ('TODO', '# TODO \\n Remember to buy milk', '2023-10-20T15:00:00', 1, '', 'markdown', '2024-08-29 13:51:26', '2024-08-29 13:51:26');
INSERT INTO note (title, text, date, favorite, labels, language, updated_at, created_at) VALUES ('New Note @ Aug 29, 2024, 10:51:40 AM', '#Sample Markdown Note with Cards

Card definition below

```toml
[[card]]
title = "What is Rust?"
hint = "Programming Language"
description = "A systems programming language focused on safety, speed, and concurrency."
example = "Rust is often used for performance-critical services."
[[card]]
title = "What is ownership in Rust?"
hint = "Memory Management"
description = "A set of rules that governs how a Rust program manages memory."
example = "Ownership ensures memory safety without a garbage collector."
```

You can declare more card blocks
', '2024-08-29T13:51:40.931Z', 0, '', 'markdown', '2024-08-29T13:51:40.931Z', '2024-08-29T13:51:40.931Z');
