#!/usr/bin/env bash
set -euo pipefail

# Load local config if present
if [ -f "$(dirname "$0")/../.env.local" ]; then
    # shellcheck source=/dev/null
    source "$(dirname "$0")/../.env.local"
fi

if [ -z "${DEPLOY_TARGET:-}" ]; then
    read -rp "Deploy target (rsync destination): " DEPLOY_TARGET
fi

npm run build
rsync -av --delete dist/ "$DEPLOY_TARGET"
