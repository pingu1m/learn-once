-- Add migration script here
INSERT INTO settings (id, db_location, github_gist_token, dark_mode, editor_font, editor_font_size, editor_theme,
                      vim_mode)
VALUES (1, '', '', 0, 'Fira Code', 16, 'monokai', 0);
