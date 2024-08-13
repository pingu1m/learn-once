-- Add migration script here
CREATE TABLE IF NOT EXISTS note ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, tags TEXT, language TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS card ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, front TEXT NOT NULL, back TEXT NOT NULL, extra TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS session ( id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, num_cards INTEGER NOT NULL, num_cards_learned INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS session_cards ( session_id INTEGER NOT NULL, card_id INTEGER NOT NULL, PRIMARY KEY (session_id, card_id), FOREIGN KEY(session_id) REFERENCES session(id), FOREIGN KEY(card_id) REFERENCES card(id));


INSERT INTO note (id, title, content, tags, language, updated_at, created_at) VALUES(1, 'Note 1', 'This is the content of Note 1.', 'tag1,tag2', 'English', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO note (id, title, content, tags, language, updated_at, created_at) VALUES(2, 'Note 2', 'This is the content of Note 2.', 'tag3,tag4', 'Spanish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO note (id, title, content, tags, language, updated_at, created_at) VALUES(3, 'Note 3', 'This is the content of Note 3.', 'tag5,tag6', 'French', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO card (id, title, front, back, extra, created_at) VALUES(1, 'Card 1', 'Front content of Card 1', 'Back content of Card 1', 'Extra content 1', CURRENT_TIMESTAMP);
INSERT INTO card (id, title, front, back, extra, created_at) VALUES(2, 'Card 2', 'Front content of Card 2', 'Back content of Card 2', 'Extra content 2', CURRENT_TIMESTAMP);
INSERT INTO card (id, title, front, back, extra, created_at) VALUES(3, 'Card 3', 'Front content of Card 3', 'Back content of Card 3', 'Extra content 3', CURRENT_TIMESTAMP);
INSERT INTO card (id, title, front, back, extra, created_at) VALUES(4, 'Card 4', 'Front content of Card 4', 'Back content of Card 4', 'Extra content 4', CURRENT_TIMESTAMP);

INSERT INTO session (id, created_at, updated_at, num_cards, num_cards_learned) VALUES(1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 2);
INSERT INTO session (id, created_at, updated_at, num_cards, num_cards_learned) VALUES(2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 1);
INSERT INTO session (id, created_at, updated_at, num_cards, num_cards_learned) VALUES(3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 3);

INSERT INTO session_cards (session_id, card_id) VALUES(1, 1);
INSERT INTO session_cards (session_id, card_id) VALUES(1, 2);
INSERT INTO session_cards (session_id, card_id) VALUES(1, 3);
INSERT INTO session_cards (session_id, card_id) VALUES(2, 2);
INSERT INTO session_cards (session_id, card_id) VALUES(2, 3);
INSERT INTO session_cards (session_id, card_id) VALUES(3, 1);
INSERT INTO session_cards (session_id, card_id) VALUES(3, 2);
INSERT INTO session_cards (session_id, card_id) VALUES(3, 3);
INSERT INTO session_cards (session_id, card_id) VALUES(3, 4);
