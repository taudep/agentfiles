#!/usr/bin/env bash
# new-video.sh — scaffold a new explainer-video project from this skill's template.
#
# Usage: new-video.sh <target-dir> [source.pdf]
#   e.g. new-video.sh ~/dev/projects/scratch/datamesh-onboarding-video ~/Downloads/datamesh.pdf
#
# Copies the template, seeds scenes.json from scenes.example.json, copies the PDF (if given)
# and points scenes.json "source" at it, then runs npm install.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
target="${1:?usage: new-video.sh <target-dir> [source.pdf]}"
pdf="${2:-}"

if [ -e "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then
  echo "error: $target exists and is not empty" >&2
  exit 1
fi
mkdir -p "$target"
cp -R "$here/template/." "$target/"
cp "$target/scenes.example.json" "$target/scenes.json"

if [ -n "$pdf" ]; then
  cp "$pdf" "$target/"
  name="$(basename "$pdf")"
  node -e "
const fs=require('fs');const p='$target/scenes.json';
const d=JSON.parse(fs.readFileSync(p,'utf8'));d.source=process.argv[1];
fs.writeFileSync(p,JSON.stringify(d,null,2));" "$name"
fi

(cd "$target" && npm install --no-fund --no-audit --loglevel=error)

# Remotion renders with its own ~140 MB headless Chrome, downloaded on first render. Fetch it
# now (it can stall); if it keeps failing, render with --browser-executable=<path to a chrome>.
for attempt in 1 2 3; do
  (cd "$target" && npx --yes remotion browser ensure >/dev/null 2>&1) && break
  echo "remotion browser download failed (attempt $attempt), retrying..." >&2
  [ "$attempt" = 3 ] && echo "warning: no headless Chrome yet; first render will retry the download" >&2
done
echo "ready: $target"
echo "next (from inside $target): read the source with npm run inspect -- --text, replace scenes[] in scenes.json,"
echo "      then: npm run paper && npm run narrate -- --provider say && npm run render && scripts/contact-sheet.sh"
