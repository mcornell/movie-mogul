#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$SCRIPT_DIR/reset-db.sql"

TARGET="${1:-}"

case "$TARGET" in
    prod|production)
        echo "Resetting PRODUCTION database (DB, env=production)..."
        echo "This will drop all scores and sessions. Press Ctrl-C to abort, Enter to continue."
        read -r
        npx wrangler d1 execute DB --env production --remote --file "$SQL_FILE"
        echo "Done. Production DB reset to defaults."
        ;;
    dev|"")
        echo "Resetting DEV database (DB, default env)..."
        npx wrangler d1 execute DB --remote --file "$SQL_FILE"
        echo "Done. Dev DB reset to defaults."
        ;;
    *)
        echo "Usage: $0 [dev|prod]"
        echo "  dev  — reset the dev database (default)"
        echo "  prod — reset the production database (prompts for confirmation)"
        exit 1
        ;;
esac
