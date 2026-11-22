# training-video-pipeline

Paper → script → voice → animated vertical video → YouTube Short.
`scenes.json` is the single source of truth: edit words there, not in video code.

```
scenes.json ──► extract_paper.py ──► public/paper/*.png + src/generated/paper.json   (zoom targets)
            └─► narrate.mjs ───────► public/audio/*.mp3 + src/generated/timeline.json (the clock)
                                     └─► Remotion (src/) ──► out/short.mp4
                                                          └─► srt.mjs ──► out/captions.srt
```

## One-time setup

```sh
npm install
# ElevenLabs key → macOS Keychain (run in your own terminal; prompts without echoing)
security add-generic-password -a "$USER" -s elevenlabs-api-key -w
```

Then put your voice's ID in `scenes.json` → `voice.elevenlabs.voice_id`
(ElevenLabs → Voices → your voice → ⋯ → Copy voice ID). Model is `eleven_v4`.

## Loop

```sh
npm run paper            # re-run only when PaperZoom shots change
npm run narrate          # ElevenLabs if key found, else free macOS `say` draft voice
npm run narrate -- --provider say   # force the free draft voice
npm run studio           # live preview with scrubber at localhost:3000
npm run render && npm run srt
```

Narration is cached per scene by a hash of its text and voice settings, so editing one scene
re-bills only that scene.

## Scene types

| type | what it does | key props |
|---|---|---|
| `BigNumber` | counting hero number | `kicker`, `prefix`, `value`, `suffix`, `sub`, `subCue` |
| `PaperZoom` | camera moves across real PDF pages, highlighter on quotes | `shots[]`: `page` + `find`/`findEnd`/`rect`/`full`, `highlight`, `cue`, `zoom`, `pan`; `punch`, `badge` |
| `BarChart` | bars grow on cue words | `bars[]` with `cue`, `max`, `punch` |
| `Checklist` | items check off on cue words | `items[]` with `cue` |
| `CTA` | typing terminal, numbered steps, closer | `code`, `steps[]`, `end` |

**Cues** are words from the narration. Each visual beat fires the moment that word is spoken
(timings come from ElevenLabs' word alignment). Cues are matched in order within a scene.

**PaperZoom `find`** is literal text from the PDF; `extract_paper.py` locates it, so targets
are never guessed. Use `findEnd` to span a region, `rect: [x0,y0,x1,y1]` (0–1) for figures with
no unique text, and `zoom` + `pan` for wide figures on a tall screen.

## Adding your own assets

Drop files in `public/` and reference them with `staticFile('name.png')`:
screenshots or screen recordings (`<OffthreadVideo>`), logos you have rights to, background
music (YouTube Audio Library is safe for YouTube). Avoid photos/clips of real people you don't
have rights to, which also implies endorsement.

## Licensing note

Remotion is free for individuals and companies of up to 3 people; using it for company work at
scale needs a Remotion company license.
