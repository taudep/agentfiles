#!/usr/bin/env node
/**
 * narrate.mjs — turn each scene's narration in scenes.json into audio + word timings,
 * then write src/generated/timeline.json (the clock the Remotion video runs on).
 *
 * Usage:
 *   node scripts/narrate.mjs                 # ElevenLabs if a key is found, else macOS `say`
 *   node scripts/narrate.mjs --provider say  # force free draft voice
 *   node scripts/narrate.mjs --force         # regenerate even if text is unchanged
 *   node scripts/narrate.mjs --only s3-thesis
 *   node scripts/narrate.mjs --preview s01-hook   # audition one scene, leaves the video untouched
 *   node scripts/narrate.mjs --dry-run            # list which scenes would call (and bill) the API
 *
 * API key lookup (never printed, never written to disk):
 *   1. $ELEVENLABS_API_KEY
 *   2. macOS Keychain item "elevenlabs-api-key":
 *        security add-generic-password -a "$USER" -s elevenlabs-api-key -w
 *      (run in your own terminal; it prompts for the key without echoing it)
 *
 * Voice: scenes.json voice.elevenlabs.voice_id, or $ELEVENLABS_VOICE_ID.
 *
 * Pace: scenes.json voice.speed (1 = natural; 0.9 slower, 1.1 faster) is applied after
 * synthesis with ffmpeg's pitch-preserving atempo filter, and word timings are scaled to match.
 * Eleven v4 has no speed setting of its own. Raw 1× audio is cached separately, so changing
 * speed is free: it never calls ElevenLabs again.
 *   --adopt-speed 1.2   one-off: reuse audio an older version of this script cached at 1.2×
 *
 * Caching: audio is keyed by a hash of provider + voice + settings + text, so editing
 * one scene's narration only re-bills that scene.
 */
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const TAIL_PAD_S = 0.15; // breath between scenes (short-form: keep it tight)
const END_HOLD_S = 1.2; // hold the last frame so the CTA lands

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'scenes.json'), 'utf8'));
const audioDir = path.join(ROOT, 'public', 'audio');
fs.mkdirSync(audioDir, {recursive: true});

function getApiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  try {
    return execFileSync('security', ['find-generic-password', '-s', 'elevenlabs-api-key', '-w'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const apiKey = getApiKey();
const provider = opt('provider') ?? (apiKey ? 'elevenlabs' : 'say');
const el = spec.voice.elevenlabs;
const voiceId = process.env.ELEVENLABS_VOICE_ID ?? el.voice_id;

if (provider === 'elevenlabs') {
  if (!apiKey) die('No ElevenLabs key found. See the header of scripts/narrate.mjs.');
  if (!voiceId || voiceId === 'YOUR_VOICE_ID')
    die('Set voice.elevenlabs.voice_id in scenes.json (ElevenLabs → Voices → your voice → copy ID).');
}
console.log(`provider: ${provider}${provider === 'elevenlabs' ? ` (voice ${voiceId})` : ''}`);

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function duration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
    encoding: 'utf8',
  });
  return parseFloat(out);
}

/** ElevenLabs returns per-character timings; fold them into words. */
function charsToWords({characters, character_start_times_seconds: st, character_end_times_seconds: et}) {
  const words = [];
  let cur = null;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
    } else if (!cur) {
      cur = {text: ch, start: st[i], end: et[i]};
    } else {
      cur.text += ch;
      cur.end = et[i];
    }
  });
  if (cur) words.push(cur);
  return words;
}

/** `say` gives no timings; spread words across the clip by character length. */
function estimateWords(text, dur) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const weights = tokens.map((t) => t.length + 2 + (/[.,:;!?]$/.test(t) ? 4 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const lead = 0.05;
  const span = dur * 0.97 - lead;
  let t = lead;
  return tokens.map((tok, i) => {
    const d = (weights[i] / total) * span;
    const w = {text: tok, start: t, end: t + d * 0.85};
    t += d;
    return w;
  });
}

async function synthElevenLabs(scene, voiceSettings, prevText, nextText, mp3) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`;
  const post = (body) =>
    fetch(url, {
      method: 'POST',
      headers: {'xi-api-key': apiKey, 'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
  const full = {
    text: scene.narration,
    model_id: el.model_id,
    voice_settings: voiceSettings,
    // neighbouring text keeps intonation continuous across separately generated scenes
    previous_text: prevText,
    next_text: nextText,
  };
  let res = await post(full);
  if (res.status === 400 || res.status === 422) {
    // newer models (v3/v4) may reject request stitching or older voice settings: retry bare
    console.warn(`  ${scene.id}: ${res.status} with full options, retrying with text + model only`);
    console.warn(`    (${(await res.text()).slice(0, 200)})`);
    res = await post({text: scene.narration, model_id: el.model_id});
  }
  if (!res.ok) die(`ElevenLabs ${res.status} on ${scene.id}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  fs.writeFileSync(mp3, Buffer.from(json.audio_base64, 'base64'));
  // v3/v4 audio tags like [excited] shape delivery but shouldn't show up as caption words
  return charsToWords(json.alignment).filter((w) => !/^\[.*\]$/.test(w.text));
}

const scaleWords = (words, speed) => words.map((w) => ({...w, start: w.start / speed, end: w.end / speed}));

/** Pitch-preserving speed change of raw audio into outMp3; returns words rescaled to match. */
function applySpeed(rawMp3, outMp3, words, speed) {
  const args = speed === 1 ? ['-codec:a', 'copy'] : ['-filter:a', `atempo=${speed}`, '-codec:a', 'libmp3lame', '-q:a', '2'];
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawMp3, ...args, outMp3]);
  return scaleWords(words, speed);
}

function synthSay(scene, mp3) {
  const {voice, rate} = spec.voice.say;
  // ElevenLabs audio tags ([excited]) would be read aloud by `say`
  scene = {...scene, narration: scene.narration.replace(/\[[^\]]*\]\s*/g, '')};
  const aiff = mp3.replace(/\.mp3$/, '.aiff');
  execFileSync('say', ['-v', voice, '-r', String(rate), '-o', aiff, scene.narration]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', aiff, '-codec:a', 'libmp3lame', '-q:a', '3', mp3]);
  fs.rmSync(aiff);
  return estimateWords(scene.narration, duration(mp3));
}

const only = opt('only');
const scenes = spec.scenes;
const timelineScenes = [];
let startFrame = 0;

const speed = Number(spec.voice.speed ?? 1);
const adoptSpeed = opt('adopt-speed'); // one-off: reuse audio cached by an older narrate.mjs at this speed
const hashOf = (obj) => crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 10);

// --preview <id>: voice ONE scene to out/preview-<id>.mp3 to audition voice/settings changes
// before re-voicing everything. The raw audio is cached, so a later full run reuses it (no double billing).
const previewId = opt('preview');

for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  if (previewId && scene.id !== previewId) continue;
  // a scene may override voice settings, e.g. a steadier intro: "voice_settings": {"stability": 0.55}
  const settings =
    provider === 'elevenlabs'
      ? scene.voice_settings
        ? {voiceId, ...el, voice_settings: {...el.voice_settings, ...scene.voice_settings}}
        : {voiceId, ...el}
      : spec.voice.say;
  // The cache key covers only what ElevenLabs bills for. Speed is applied locally afterwards,
  // so changing voice.speed never re-buys audio.
  const hash = hashOf({provider, settings, text: scene.narration});
  const rawMp3 = path.join(audioDir, `${scene.id}-${hash}.raw.mp3`);
  const rawMeta = path.join(audioDir, `${scene.id}-${hash}.raw.json`);
  const outName = `${scene.id}-${hash}-x${speed}.mp3`;
  const outMp3 = path.join(audioDir, outName);

  if (flag('dry-run')) {
    const hit = fs.existsSync(rawMeta) && fs.existsSync(rawMp3) && !flag('force');
    console.log(`  ${hit ? 'cached  ' : 'WOULD CALL API'} ${scene.id} (${scene.narration.length} chars)`);
    continue;
  }

  let rawWords;
  if (fs.existsSync(rawMeta) && fs.existsSync(rawMp3) && !flag('force')) {
    rawWords = JSON.parse(fs.readFileSync(rawMeta, 'utf8')).words;
    console.log(`  cached   ${scene.id}`);
  } else if (adoptSpeed && !flag('force') && adoptLegacy(scene, settings, Number(adoptSpeed), rawMp3, rawMeta)) {
    rawWords = JSON.parse(fs.readFileSync(rawMeta, 'utf8')).words;
    console.log(`  adopted  ${scene.id} (from audio cached at speed ${adoptSpeed}, no API call)`);
  } else if (adoptSpeed) {
    die(`${scene.id}: no audio cached at speed ${adoptSpeed} for this text; nothing was billed. Rerun without --adopt-speed to generate it.`);
  } else if (only && only !== scene.id) {
    die(`${scene.id} has no cached audio for this text; run without --only first.`);
  } else {
    rawWords =
      provider === 'elevenlabs'
        ? await synthElevenLabs(scene, settings.voice_settings, scenes[i - 1]?.narration, scenes[i + 1]?.narration, rawMp3)
        : synthSay(scene, rawMp3);
    // lone dashes etc. are pauses, not caption words
    rawWords = rawWords.filter((w) => /[\p{L}\p{N}]/u.test(w.text));
    fs.writeFileSync(rawMeta, JSON.stringify({hash, words: rawWords}, null, 2));
    console.log(`  generated ${scene.id}`);
  }

  if (previewId) {
    const out = path.join(ROOT, 'out', `preview-${scene.id}.mp3`);
    fs.mkdirSync(path.dirname(out), {recursive: true});
    applySpeed(rawMp3, out, rawWords, speed);
    console.log(`preview: out/preview-${scene.id}.mp3 (timeline unchanged)`);
    process.exit(0);
  }

  // drop this scene's stale files (old text/settings/speed), keep the current raw + output
  for (const f of fs.readdirSync(audioDir)) {
    if (f.startsWith(`${scene.id}-`) && !f.startsWith(`${scene.id}-${hash}.raw.`) && f !== outName)
      fs.rmSync(path.join(audioDir, f));
  }
  const words = fs.existsSync(outMp3) ? scaleWords(rawWords, speed) : applySpeed(rawMp3, outMp3, rawWords, speed);

  const dur = duration(outMp3);
  const hold = i === scenes.length - 1 ? END_HOLD_S : TAIL_PAD_S;
  const durationInFrames = Math.ceil((dur + hold) * FPS);
  timelineScenes.push({
    id: scene.id,
    type: scene.type,
    props: scene.props,
    audio: `audio/${outName}`,
    startFrame,
    durationInFrames,
    words,
  });
  startFrame += durationInFrames;
}

/** Recover raw (1×) audio from a file an older narrate.mjs cached already sped up. */
function adoptLegacy(scene, settings, legacySpeed, rawMp3, rawMeta) {
  const legacy = hashOf({provider, settings, speed: legacySpeed, text: scene.narration});
  const mp3 = path.join(audioDir, `${scene.id}-${legacy}.mp3`);
  const meta = path.join(audioDir, `${scene.id}-${legacy}.json`);
  if (!fs.existsSync(mp3) || !fs.existsSync(meta)) return false;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp3, '-filter:a', `atempo=${1 / legacySpeed}`, '-codec:a', 'libmp3lame', '-q:a', '2', rawMp3]);
  const words = JSON.parse(fs.readFileSync(meta, 'utf8')).words.map((w) => ({...w, start: w.start * legacySpeed, end: w.end * legacySpeed}));
  fs.writeFileSync(rawMeta, JSON.stringify({hash: 'adopted', words}, null, 2));
  return true;
}

if (flag('dry-run')) process.exit(0);

const timeline = {fps: FPS, width: WIDTH, height: HEIGHT, totalFrames: startFrame, scenes: timelineScenes};
fs.writeFileSync(path.join(ROOT, 'src', 'generated', 'timeline.json'), JSON.stringify(timeline, null, 2));
console.log(`timeline: ${timelineScenes.length} scenes, ${(startFrame / FPS).toFixed(1)}s`);
