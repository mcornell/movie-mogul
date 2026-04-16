-- reset-db.sql
-- Drops and recreates all tables, then seeds the default leaderboard placeholders.
-- Mirrors the C64 "reset mm.scores.prg" behaviour that populates 4×5 zero-score entries.
--
-- Run via: scripts/reset-db.sh [dev|prod]

DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS sessions;
DROP INDEX IF EXISTS idx_scores_category;

CREATE TABLE sessions (
    id          TEXT    PRIMARY KEY,
    phase       TEXT    NOT NULL,
    state       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL,
    movie_title TEXT    NOT NULL,
    initials    TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_category ON scores(category, score DESC);

-- Default placeholder entries (4 categories × 5 slots, score=0)
-- Movie titles: "No Movie-A" through "No Movie-D"  (chr$(64+i) for i=1..4)
-- Initials:     "boA" through "boE"                (chr$(64+j) for j=1..5)
INSERT INTO scores (category, movie_title, initials, score) VALUES
    ('highestProfit',   'No Movie-A', 'boA', 0),
    ('highestProfit',   'No Movie-A', 'boB', 0),
    ('highestProfit',   'No Movie-A', 'boC', 0),
    ('highestProfit',   'No Movie-A', 'boD', 0),
    ('highestProfit',   'No Movie-A', 'boE', 0),
    ('greatestRevenue', 'No Movie-B', 'boA', 0),
    ('greatestRevenue', 'No Movie-B', 'boB', 0),
    ('greatestRevenue', 'No Movie-B', 'boC', 0),
    ('greatestRevenue', 'No Movie-B', 'boD', 0),
    ('greatestRevenue', 'No Movie-B', 'boE', 0),
    ('bestPctReturned', 'No Movie-C', 'boA', 0),
    ('bestPctReturned', 'No Movie-C', 'boB', 0),
    ('bestPctReturned', 'No Movie-C', 'boC', 0),
    ('bestPctReturned', 'No Movie-C', 'boD', 0),
    ('bestPctReturned', 'No Movie-C', 'boE', 0),
    ('biggestBomb',     'No Movie-D', 'boA', 0),
    ('biggestBomb',     'No Movie-D', 'boB', 0),
    ('biggestBomb',     'No Movie-D', 'boC', 0),
    ('biggestBomb',     'No Movie-D', 'boD', 0),
    ('biggestBomb',     'No Movie-D', 'boE', 0);
