#!/usr/bin/env node
/**
 * srt.mjs — write out/captions.srt from the word timings in src/generated/timeline.json.
 * Upload it to YouTube alongside the video (Subtitles → Upload file → With timing).
 *
 * Usage: node scripts/srt.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'generated', 'timeline.json'), 'utf8'));
const MAX_WORDS = 6;

const ts = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

const cues = [];
for (const scene of tl.scenes) {
  const offset = scene.startFrame / tl.fps;
  let group = [];
  const flush = () => {
    if (!group.length) return;
    cues.push({start: offset + group[0].start, end: offset + group.at(-1).end, text: group.map((w) => w.text).join(' ')});
    group = [];
  };
  for (const w of scene.words) {
    group.push(w);
    if (group.length >= MAX_WORDS || /[.!?:,]$/.test(w.text)) flush();
  }
  flush();
}

const body = cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');
fs.mkdirSync(path.join(ROOT, 'out'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'out', 'captions.srt'), body);
console.log(`wrote out/captions.srt (${cues.length} cues)`);
