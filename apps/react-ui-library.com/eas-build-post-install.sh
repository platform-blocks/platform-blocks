#!/usr/bin/env bash
set -euo pipefail

# Resolve repository root from apps/react-ui-library.com directory
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"

cd "$REPO_ROOT"

echo "[eas-build] Generating demo metadata"
npm run demos:generate

echo "[eas-build] Validating demo metadata"
if ! npm run demos:validate; then
	echo "[eas-build] Demo validation failed – continuing build."
fi
