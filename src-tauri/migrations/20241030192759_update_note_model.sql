-- Add migration script here
ALTER TABLE note ADD COLUMN gist_key TEXT DEFAULT 'lo';
ALTER TABLE note ADD COLUMN gist_sync BOOLEAN DEFAULT FALSE;