-- Add migration script here
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    db_location TEXT NOT NULL DEFAULT '',
    github_gist_token TEXT NOT NULL DEFAULT '',
    dark_mode BOOLEAN NOT NULL DEFAULT true,
    editor_font TEXT NOT NULL DEFAULT 'Fira Code',
    editor_font_size INTEGER NOT NULL DEFAULT 16,
    editor_theme TEXT NOT NULL DEFAULT 'monokai',
    vim_mode BOOLEAN NOT NULL DEFAULT false
);