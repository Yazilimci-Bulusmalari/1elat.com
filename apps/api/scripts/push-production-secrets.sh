#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${GITHUB_CLIENT_SECRET:-}" || -z "${GOOGLE_CLIENT_SECRET:-}" ]]; then
  echo "In this shell, set secrets (not committed to git), then run again:"
  echo "  export GITHUB_CLIENT_SECRET='your-production-github-oauth-client-secret'"
  echo "  export GOOGLE_CLIENT_SECRET='your-google-oauth-client-secret'"
  echo "  pnpm secrets:push"
  echo ""
  echo "Or run interactively (wrangler will prompt, nothing echoed here):"
  echo "  wrangler secret put GITHUB_CLIENT_SECRET"
  echo "  wrangler secret put GOOGLE_CLIENT_SECRET"
  exit 1
fi

echo "$GITHUB_CLIENT_SECRET" | wrangler secret put GITHUB_CLIENT_SECRET
echo "$GOOGLE_CLIENT_SECRET" | wrangler secret put GOOGLE_CLIENT_SECRET
echo "Done."
