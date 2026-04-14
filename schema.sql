-- Ephemeral: one row per active game session (deleted on finish or abandoned after 24h)
CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT    PRIMARY KEY,
    phase       TEXT    NOT NULL,
    state       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permanent: leaderboard entries across all players
CREATE TABLE IF NOT EXISTS scores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL,   -- 'highestProfit'|'greatestRevenue'|'bestPctReturned'|'biggestBomb'
    movie_title TEXT    NOT NULL,
    initials    TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_category ON scores(category, score DESC);
