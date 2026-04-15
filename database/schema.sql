-- database/schema.sql
-- Schema del database per il progetto Synesthesia

PRAGMA foreign_keys = ON;

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'registered' CHECK (role IN ('guest', 'registered', 'creator', 'admin')),
    is_creator_unlocked INTEGER DEFAULT 0, -- 0 per false, 1 per true
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Profili Psicologici (Enneagramma)
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    dominant_type INTEGER CHECK (dominant_type >= 1 AND dominant_type <= 9),
    wing TEXT, -- es. '4w5', '7w6'
    description TEXT,
    -- Punteggi per ogni Enneatipo
    score_type_1 INTEGER DEFAULT 0,
    score_type_2 INTEGER DEFAULT 0,
    score_type_3 INTEGER DEFAULT 0,
    score_type_4 INTEGER DEFAULT 0,
    score_type_5 INTEGER DEFAULT 0,
    score_type_6 INTEGER DEFAULT 0,
    score_type_7 INTEGER DEFAULT 0,
    score_type_8 INTEGER DEFAULT 0,
    score_type_9 INTEGER DEFAULT 0,
    -- Aggiunta in Fase 3: 1 = questionario onboarding completato.
    onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabella Domande del Questionario di Onboarding
CREATE TABLE IF NOT EXISTS questionnaire_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- es. 'multiple_choice', 'text'
    options_json TEXT, -- JSON array di opzioni per multiple_choice
    enneagram_influence_json TEXT -- JSON per mappare risposte a punteggi Enneagrammatici
);

-- Tabella Risposte del Questionario
CREATE TABLE IF NOT EXISTS questionnaire_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value TEXT NOT NULL,
    answered_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questionnaire_questions (id) ON DELETE CASCADE
);

-- Tabella Prompts Creativi
CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Challenge
CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 0, -- 0 per false, 1 per true
    prompt_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts (id) ON DELETE SET NULL
);

-- Tabella Opere Caricate dagli Utenti (Entries)
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'audio', 'text')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'archived')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges (id) ON DELETE SET NULL
);

-- Tabella Dettagli File delle Opere
CREATE TABLE IF NOT EXISTS entry_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    path TEXT NOT NULL, -- Percorso relativo o URL del file
    mime_type TEXT NOT NULL,
    size INTEGER, -- Dimensione in byte
    type TEXT NOT NULL CHECK (type IN ('main', 'thumbnail')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE
);

-- Tabella Tag
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Tabella di collegamento N:M tra Entries e Tags
CREATE TABLE IF NOT EXISTS entry_tags (
    entry_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (entry_id, tag_id),
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- Tabella Like
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entry_id, user_id), -- Un utente può mettere solo un like per opera
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabella Commenti
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parent_comment_id INTEGER, -- Per commenti annidati
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

-- Tabella Task Raccomandate (generato da ZenService)
CREATE TABLE IF NOT EXISTS recommended_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed INTEGER DEFAULT 0, -- 0 per false, 1 per true
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabella Interazioni (log eventi per scoring enneagrammatico e analytics)
-- Aggiunta in Fase 1 per supportare Fase 6 (interazioni social) e Fase 7 (motore profilazione).
CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entry_id INTEGER,
    challenge_id INTEGER,
    interaction_type TEXT NOT NULL CHECK (
        interaction_type IN (
            'view', 'search', 'like', 'comment', 'save', 'open_profile',
            'challenge_click', 'challenge_join', 'upload', 'complete_onboarding'
        )
    ),
    interaction_value TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions (user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions (interaction_type);

-- Tabella Salvataggi (bookmark delle opere). Separata da likes per chiarezza semantica.
CREATE TABLE IF NOT EXISTS saved_entries (
    user_id INTEGER NOT NULL,
    entry_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, entry_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE
);