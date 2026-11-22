#!/usr/bin/env bash
# contact-sheet.sh — grab one frame from each scene of out/short.mp4 (at 75% through the scene,
# after its cues have fired) and tile them into out/frames/contact-${pos}.png for a quick visual QA pass.
#
# Usage: scripts/contact-sheet.sh [position 0-1, default 0.75] [columns, default 4]
#   Multi-shot PaperZoom scenes: also run at 0.25 to see the first shot of each scene.
#   Output: out/frames/contact-<position>.png
set -euo pipefail
cd "$(dirname "$0")/.."
pos="${1:-0.75}"; cols="${2:-4}"
[ -f out/short.mp4 ] || { echo "error: out/short.mp4 not found; run npm run render first" >&2; exit 1; }
mkdir -p out/frames && rm -f out/frames/f*.png
frames=$(node -e "
const t=require('./src/generated/timeline.json');
console.log(t.scenes.map(s=>s.startFrame+Math.round(s.durationInFrames*$pos)).join(' '))")
i=0
for f in $frames; do
  ffmpeg -y -loglevel error -i out/short.mp4 -vf "select=eq(n\,$f),scale=360:-1" -vframes 1 "$(printf 'out/frames/f%02d.png' $i)"
  i=$((i+1))
done
# pad to a full grid with blank tiles, then tile
n=$i; rows=$(( (n + cols - 1) / cols ))
ffmpeg -y -loglevel error -pattern_type glob -i 'out/frames/f*.png' \
  -vf "tile=${cols}x${rows}:padding=4:color=black" -frames:v 1 out/frames/contact-${pos}.png
echo "out/frames/contact-${pos}.png ($n scenes)"
