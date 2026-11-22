#!/usr/bin/env bash
# content-sync.sh — keep a video's content (script, source, copy, paid-for audio, final renders)
# in a durable per-project folder outside the code, e.g. a synced notes vault.
#
# Usage (from inside the video project):
#   scripts/content-sync.sh push <project-name>   # project → $EXPLAINER_CONTENT_DIR/<project-name>/
#   scripts/content-sync.sh pull <project-name>   # $EXPLAINER_CONTENT_DIR/<project-name>/ → project
#
# Set EXPLAINER_CONTENT_DIR once per machine (e.g. in ~/.zshrc). What syncs:
#   scenes.json, the source PDF, social/, youtube/   (the script and copy)
#   public/audio/*.raw.*  → audio/                  (paid ElevenLabs audio: pulling it on another
#                                                    machine means re-rendering costs nothing)
#   out/publish/          → publish/                (approved upload kit; push only)
# Code, node_modules, page renders and intermediate audio are not synced (they regenerate).
set -euo pipefail
cd "$(dirname "$0")/.."
mode="${1:?usage: content-sync.sh push|pull <project-name>}"
name="${2:?usage: content-sync.sh push|pull <project-name>}"
root="${EXPLAINER_CONTENT_DIR:?set EXPLAINER_CONTENT_DIR to the folder that holds per-video content}"
dest="$root/$name"
src_pdf="$(node -e "try{console.log(require('./scenes.json').source||'')}catch{console.log('')}")"

case "$mode" in
  push)
    mkdir -p "$dest/audio"
    cp scenes.json "$dest/"
    [ -n "$src_pdf" ] && [ -f "$src_pdf" ] && cp "$src_pdf" "$dest/"
    for d in social youtube; do [ -d "$d" ] && rsync -a "$d/" "$dest/$d/"; done
    rsync -a --include='*.raw.mp3' --include='*.raw.json' --exclude='*' public/audio/ "$dest/audio/" 2>/dev/null || true
    [ -d out/publish ] && rsync -a out/publish/ "$dest/publish/"
    echo "pushed to $dest"
    ;;
  pull)
    [ -d "$dest" ] || { echo "error: $dest not found" >&2; exit 1; }
    cp "$dest/scenes.json" .
    pdf="$(node -e "console.log(require('./scenes.json').source||'')")"
    [ -n "$pdf" ] && [ -f "$dest/$pdf" ] && cp "$dest/$pdf" .
    for d in social youtube; do [ -d "$dest/$d" ] && rsync -a "$dest/$d/" "$d/"; done
    mkdir -p public/audio && [ -d "$dest/audio" ] && rsync -a "$dest/audio/" public/audio/
    echo "pulled from $dest. Next: npm run paper && npm run narrate -- --dry-run"
    ;;
  *) echo "usage: content-sync.sh push|pull <project-name>" >&2; exit 1 ;;
esac
