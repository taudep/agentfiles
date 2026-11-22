---
name: making-explainer-videos
description: Use when turning a paper, PDF, doc or data source into a short narrated explainer or training video (YouTube Short, TikTok/Reels style, onboarding or how-to clip), or when working with Remotion, ElevenLabs voiceover, word-synced captions, or zooming into PDF quotes and figures on video.
---

# Making explainer videos

## Overview

A code-first pipeline: **`scenes.json` is the single source of truth.** Narration audio sets the
clock, word timings from ElevenLabs drive every visual beat, and real pages of the source PDF
are the evidence on screen. `template/` is a working Remotion project that produced a polished
60-second vertical Short.

```
scenes.json ─► extract_paper.py ─► page PNGs + zoom rects (src/generated/paper.json)
            └► narrate.mjs ──────► per-scene mp3 + word timings (src/generated/timeline.json)
                                   └► Remotion ─► out/short.mp4 ─► srt.mjs ─► out/captions.srt
```

Two script locations: `<skill-dir>/scripts/new-video.sh` scaffolds; everything else
(`npm run …`, `scripts/contact-sheet.sh`) runs **from inside the new project**.

## Where things live

- **Code:** a disposable working copy scaffolded from `template/` (the user's scratch area).
- **Content:** one folder per video under **`$EXPLAINER_CONTENT_DIR/<project>/`**, the user's
  durable, synced store. It holds scenes.json, the source PDF, social/, youtube/, the paid audio and
  the approved upload kit. `scripts/content-sync.sh push <project>` after every approved change;
  `scripts/content-sync.sh pull <project>` to resume on any machine. Pulled audio means
  re-rendering costs nothing; confirm with `npm run narrate -- --dry-run`.
- If `$EXPLAINER_CONTENT_DIR` is unset, ask the user where content should live. Never put
  content (PDF, voice audio, voice ID, scripts) in the skill's repo; it's public.

## Workflow

1. **Scaffold:** `<skill-dir>/scripts/new-video.sh <dir> [source.pdf]`. Copies the template,
   runs `npm install`, pre-downloads Remotion's headless Chrome. Use the user's scratch area unless told otherwise.
2. **Read the whole source:** `npm run inspect -- --text`.
3. **Write `scenes.json`:** replace the example's `scenes[]` entirely (it's a reference, see
   [reference.md](reference.md)); keep `voice`. One scene = one claim + one visual.
4. **Find zoom targets:** `npm run inspect -- --page N --grid`, then Read
   `public/paper/page-N-grid.png` and take figure/table `rect`s off the 0.1 grid. Then
   `npm run paper`.
5. **Draft voice:** `npm run narrate -- --provider say` (free, no key).
6. **QA loop:** spot-check single frames with `npx remotion still Short out/f.png --frame=N --scale=0.33`
   (seconds, not a full render). Then `npm run render && scripts/contact-sheet.sh` (and
   `scripts/contact-sheet.sh 0.25` for first shots of multi-shot scenes). **Read the contact
   sheets.** Every frame must show the intended quote/figure, captions inside the frame, no overlay
   covering the evidence.
7. **Real voice:** `npm run narrate` (ElevenLabs when a key is found), then **repeat step 6**.
   Cue timing is only real with ElevenLabs word timings. Then `npm run srt`.
8. **After the user approves the render, write social copy:** `social/posts.md` from
   `social/posts.example.md`: 3 headline options (stat-led, contrarian, curiosity; ≤ 60 chars,
   each built from a line the video actually says), plus a TikTok caption, an Instagram Reel
   caption and a YouTube title. Export the cover with `npx remotion still Short out/cover.png --frame=N`
   (pick the hook's most legible frame). Fill `youtube/metadata.md` from `metadata.example.md`.
9. **Save content:** `scripts/content-sync.sh push <project>` (and after any later re-voice or re-render).
10. **Publish:** the same mp4 works on all three platforms.
   - **YouTube:** upload in Studio with the srt.
   - **TikTok:** upload manually. Content Posting API posts from unaudited apps are **private-only**.
   - **Instagram:** upload manually, or use the Graph API (`media_type=REELS`, then `media_publish`).
     The API needs a Professional account, a Meta app and a user token kept in Keychain, never in chat or files.
   After posting, check on a phone that the platform's caption overlay doesn't cover the burned-in captions.

## Script rules (short-form)

- **Hook with a number in the first sentence → argument → evidence → call to action.** No intro,
  no "in this video", no recap.
- **Length:** ElevenLabs v4 at `speed: 1.0` speaks about **2.6 words per second**:
  30 s ≈ 80 words, 60 s ≈ 155 words, 90 s ≈ 235. (The `say` draft voice runs faster, about 3.1.)
- **Fact-check every line against the source.** Ranges stay ranges ("up to 70%" when the
  source says 40–70%); qualifiers stay ("on the tests run"); reported figures are footnoted as
  reported. Tell the user about every wording change to their script.
- **Write for the ear:** spell out ports ("one one four three four"), model tags ("qwen three,
  four-B"), acronyms that TTS mangles ("Q4 K M"). Captions show the spoken form.
- **Tone: a knowledgeable colleague explaining, not a pitch.** Energy comes from short sentences
  and concrete numbers, not hype. No audio tags by default. Hype words ("brutal", "crank",
  "insane", "game-changer") plus `[excited]` read as an overselling salesperson. Don't tag the
  intro or outro: that's where `[excited]` sounded most overdone. Add a tag only if the user asks
  for more energy, and never `[rushed]` on top of `speed`.

## Voice and secrets

- ElevenLabs model `eleven_v4`: only `stability` + `similarity_boost` (no speed/style/SSML).
  **Defaults (user-approved):** stability 0.3 with no tags for the body *and* the hook (lively, not
  salesy; 0.55 made the hook too flat). The CTA gets a steadier per-scene override,
  `"voice_settings": {"stability": 0.55}`. When the user wants a middle ground, generate 2–3
  `--preview` variants (e.g. 0.3 / 0.42 / 0.55) and let them pick by ear; takes vary run to run.
- **Pace = `voice.speed`** in scenes.json: 1.0 is the voice's natural pace (default); 0.9 slower,
  1.1 tighter. 1.2 felt too fast with a cloned voice. Applied locally with pitch-safe ffmpeg
  `atempo`; raw audio is cached separately, so **changing speed never re-bills ElevenLabs**.
  To tighten a video, cut words before raising speed.
- API key: macOS Keychain item `elevenlabs-api-key` or `$ELEVENLABS_API_KEY`. **Never ask the
  user to paste it into chat, never print it, never write it to a file.** They add it in their own
  terminal: `security add-generic-password -a "$USER" -s elevenlabs-api-key -w`.
- Voice ID: `$ELEVENLABS_VOICE_ID` or `voice.elevenlabs.voice_id`. Keep real IDs out of the template.
- Audio is cached per scene by hash. To audition a voice/setting change, run
  `npm run narrate -- --preview <scene-id>` (one scene → `out/preview-<id>.mp3`, video untouched),
  get the user's OK, then run the full narrate. The preview's audio is reused, so it's never billed twice.
  Run `npm run narrate -- --dry-run` before any full narrate after a settings change: it lists which
  scenes would call (and bill) the API. Change settings per scene, not globally, when only some scenes need it.

## PaperZoom framing

| Symptom | Fix |
|---|---|
| Zoom lands on prose, not the figure | Search is case-insensitive, so figure titles also match body text. Use `rect`. |
| Paragraph's left edge cropped | `find` started mid-line. Start `find` at the line's first words, or use `rect`. |
| "Zoom to one row" looks the same as the whole figure | A wide, short region fills the 9:16 frame by width either way. Show the whole table and `highlight` a row `rect`. |
| `zoom` cuts off table columns | `zoom` crops around the centre. Use it only with `pan: true` on wide figures. |
| Highlight invisible on table cells | `find`/`findEnd` highlights prose lines. For tables, use `rect` + `highlight: true` (draws a box). |
| `punch`/`badge` covers the evidence | Punch sits at the stage's bottom and badge at its top. Frame the target in the middle, or drop the overlay. |
| `findEnd not found` | The end must come after `find`. Use a shorter unique snippet or `rect`. |
| Cue fires on the wrong word | Cues match in order and the earliest occurrence wins. Pick a later, distinctive word. |

## Other gotchas

- The first render stalls downloading Chrome → `npx remotion browser ensure`, or render with
  `--browser-executable=<chrome path>`.
- With the `say` voice, visual beats lag the narration because its timings are estimates. That's expected.
- Captions run off screen → words must be separated by real spaces (`Captions.tsx` keeps them).

## Rights and disclosure

Headlines and captions must not overstate the video or the source (same fact-check as the
script), and must not use a real person's name in a way that implies they made or endorse it.

Use the source's own pages/figures, data-built charts, the user's screen recordings and
YouTube Audio Library music. Don't use photos or clips of real people the user lacks rights to,
and don't imply a named person endorses the video. If the source is a synthesis "based on"
someone's work, say so in the description. With a voice clone, tick YouTube's altered/synthetic
content box. Remotion is free for individuals; company use beyond 3 people needs a license.
