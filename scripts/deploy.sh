#!/usr/bin/env bash
# Build + zip-deploy the Next.js standalone bundle to Azure App Service.
#
# Usage:
#   ./scripts/deploy.sh <resource-group> <site-name>

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <resource-group> <site-name>" >&2
  exit 1
fi

RG="$1"
SITE="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
npm ci

echo "==> Building Next.js (standalone)"
npm run build

BUNDLE="$ROOT/.next/standalone"
if [ ! -d "$BUNDLE" ]; then
  echo "Standalone bundle not found at $BUNDLE" >&2
  exit 1
fi

echo "==> Assembling deploy bundle"
mkdir -p "$BUNDLE/.next"
cp -r .next/static "$BUNDLE/.next/static"
[ -d public ] && cp -r public "$BUNDLE/public"

ZIP="$ROOT/deploy.zip"
rm -f "$ZIP"

echo "==> Creating $ZIP"
( cd "$BUNDLE" && zip -rq "$ZIP" . )

echo "==> Deploying to App Service: $SITE"
az webapp deploy \
  --resource-group "$RG" \
  --name "$SITE" \
  --src-path "$ZIP" \
  --type zip

HOST=$(az webapp show -g "$RG" -n "$SITE" --query defaultHostName -o tsv)
echo "==> Live: https://$HOST"
echo "==> Archive: https://$HOST/video-recap"
