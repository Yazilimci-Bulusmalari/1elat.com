#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${GITHUB_CLIENT_SECRET:-}" || -z "${GOOGLE_CLIENT_SECRET:-}" ]]; then
  echo "Set non-interactively (values are not stored in the repo):"
  echo "  export GITHUB_CLIENT_SECRET='ebc92314f253b0cc3952971c1c889407b482333e'"
  echo "  export GOOGLE_CLIENT_SECRET='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'"
  echo "Then run: pnpm exec bash scripts/push-production-secrets.sh"
  exit 1
fi

echo "$GITHUB_CLIENT_SECRET" | wrangler secret put GITHUB_CLIENT_SECRET
echo "$GOOGLE_CLIENT_SECRET" | wrangler secret put GOOGLE_CLIENT_SECRET
echo "Done. Rotate any secret that was ever pasted into chat or committed by mistake."
