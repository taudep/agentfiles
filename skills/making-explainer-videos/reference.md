# Scene catalogue and scenes.json reference

`template/scenes.example.json` is a complete, rendered 12-scene example: copy its shape, replace its `scenes[]`.

## Top level

```jsonc
{
  "title": "…",
  "source": "paper.pdf",                 // only needed for PaperZoom scenes
  "voice": {
    "speed": 1.0,                         // pitch-safe atempo after synthesis; 1 = natural, free to change
    "elevenlabs": {"voice_id": "…", "model_id": "eleven_v4",
                   "voice_settings": {"stability": 0.55, "similarity_boost": 0.8}},
    "say": {"voice": "Samantha", "rate": 205}   // free draft voice
  },
  "scenes": [ {"id": "s01-hook", "type": "BigNumber", "narration": "…", "props": {…}} ]
}
```

`id` must be unique (it names audio files and keys paper.json). `narration` is exactly what is
spoken; `[tags]` are stripped from captions and from the `say` draft.

## Cues

Any `cue`/`*Cue` prop is a word from that scene's narration. The beat fires when the word
starts. Matching is case/punctuation-insensitive, prefix-based (`"thirty-four"` matches
`thirty-four.`), and **sequential**: each cue searches after the previous match in the same
scene. Missing cue → fires a beat after the previous one.

## Scene types

| type | use for | props |
|---|---|---|
| `BigNumber` | the hook; one shocking stat | `kicker`, `prefix`, `value` (number), `from` (start value; `from` > `value` counts down, e.g. 55 → 17), `suffix`, `sub`, `subCue`, `footnote` |
| `PaperZoom` | evidence: quotes, tables, figures from the PDF | `shots[]`, `pageLabel`, `badge` (e.g. "PRO TIP"), `punch`, `punchCue` |
| `BarChart` | comparing 2–4 numbers | `kicker`, `kickerAccent`, `title`, `max`, `bars[]` {`label`,`value`,`highlight`,`cue`}, `punch`, `punchCue`, `footnote` |
| `Checklist` | 3–5 benefits/steps | `title`, `items[]` {`text`,`cue`} |
| `CTA` | the close: a command to run | `code`, `codeCue`, `steps[]` {`text`,`cue`}, `end`, `endCue`, `footnote` |

### PaperZoom shots

Each shot is one camera position; shot 0 shows at scene start, later shots move in on their
`cue`. Same page → the camera flies; different page → hard cut with a fade.

| field | meaning |
|---|---|
| `page` | 1-based PDF page |
| `full: true` | whole page |
| `find` | literal text to locate (straight/curly quotes both tried) |
| `findEnd` | extend the region to the nearest later occurrence of this text |
| `rect` | manual region `[x0,y0,x1,y1]` in 0–1 page coords; use for figures and tables (read it off `npm run inspect -- --page N --grid`) |
| `highlight` | with `find`: sweep a highlighter line by line (prose). With `rect`: one box over the region (table rows, figure parts) |
| `zoom` | multiply past "fit" (wide figures on a tall screen) |
| `pan` | sweep left→right across the region for the shot's duration |
| `cue` | word that triggers this shot |

To find a `rect`: `npm run inspect -- --page N --grid` prints every text line with its rect and
writes `public/paper/page-N-grid.png` (labelled 0.1 grid) to read figure bounds off by eye.
`npm run inspect -- --find "text"` lists every hit, which shows whether a title also matches prose.

## Adding a scene type

Create `src/scenes/MyScene.tsx` taking `SceneProps<Props>` (`{id, props, words}`), use
`cueFrames(words, [cues…], fps)` for timing and `Stage`/`Pop`/`Kicker`/`Terminal` from
`components/ui.tsx`, then register it in the `SCENES` map in `src/Video.tsx`.
Layout is 1080×1920: visuals inside the stage (y 150–1260), captions at y 1320, bottom ~400 px
left clear for the Shorts UI. Static assets (screenshots, `<OffthreadVideo>` recordings,
music) go in `public/` and load with `staticFile()`.

## Commands

| command | does |
|---|---|
| `npm run inspect -- --text \| --page N [--grid] \| --find T` | read the source, get coordinates |
| `npm run paper` | render PDF pages, resolve PaperZoom targets |
| `npm run narrate [-- --provider say\|--force\|--only ID]` | audio + timeline |
| `npm run narrate -- --preview ID` | audition one scene → out/preview-ID.mp3 (video untouched) |
| `npm run studio` | live preview at localhost:3000 |
| `npm run render` | out/short.mp4 (add `--crf=14` via npx for higher quality) |
| `npm run srt` | out/captions.srt |
| `scripts/contact-sheet.sh [pos] [cols]` | out/frames/contact-<pos>.png: one frame per scene at `pos` (0–1) |
| `npx remotion still Short out/f.png --frame=N --scale=0.33` | spot-check one frame in seconds |
| `npx remotion still Short out/thumb.png --frame=30` | thumbnail |
