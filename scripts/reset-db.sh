#!/usr/bin/env bash
# reset-db.sh — drops and recreates D1 tables, seeds default leaderboard placeholders.
# Usage: scripts/reset-db.sh [dev|prod]
#
# Uses --command instead of --file to avoid the /import API endpoint,
# which has authentication quirks with the current wrangler OAuth token.
set -euo pipefail

TARGET="${1:-}"

case "$TARGET" in
    prod|production)
        ENV_FLAGS="--env production --remote"
        echo "Resetting PRODUCTION database (DB, env=production)..."
        echo "This will drop all scores and sessions. Press Ctrl-C to abort, Enter to continue."
        read -r
        ;;
    dev|"")
        ENV_FLAGS="--remote"
        echo "Resetting DEV database (DB, default env)..."
        ;;
    *)
        echo "Usage: $0 [dev|prod]"
        echo "  dev  — reset the dev database (default)"
        echo "  prod — reset the production database (prompts for confirmation)"
        exit 1
        ;;
esac

run() {
    # shellcheck disable=SC2086
    npx wrangler d1 execute DB $ENV_FLAGS --command "$1"
}

echo "Dropping tables..."
run "DROP TABLE IF EXISTS scores"
run "DROP TABLE IF EXISTS sessions"
run "DROP INDEX IF EXISTS idx_scores_category"

echo "Creating tables..."
run "CREATE TABLE sessions (
    id          TEXT    PRIMARY KEY,
    phase       TEXT    NOT NULL,
    state       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
)"
run "CREATE TABLE scores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL,
    movie_title TEXT    NOT NULL,
    initials    TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
)"
run "CREATE INDEX idx_scores_category ON scores(category, score DESC)"

echo "Seeding default placeholders..."
run "INSERT INTO scores (category, movie_title, initials, score) VALUES
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
    ('biggestBomb',     'No Movie-D', 'boE', 0)"

echo "Done."
