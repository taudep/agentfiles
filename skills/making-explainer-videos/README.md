# making-explainer-videos

Turns a paper/PDF (or any source) into a tight, narrated, vertical explainer video with
word-synced captions and camera zooms into the source's real quotes and figures.

- **Triggers on:** making a training/explainer video, YouTube Short or TikTok-style clip from a
  paper or doc; Remotion; ElevenLabs voiceover; captions; zooming into PDF figures.
- **Contents:** `SKILL.md` (workflow, script rules, pitfalls), `reference.md` (scenes.json and
  scene types), `template/` (working Remotion + ElevenLabs project), `scripts/new-video.sh`
  (scaffold a new project from the template).
- **Requires:** Node 20+, ffmpeg/ffprobe, `uv` (for the PyMuPDF extractor), macOS for the
  Keychain key lookup and the free `say` draft voice. An ElevenLabs API key for the real voice.
- **Caveats:** Remotion needs a company license for commercial use by companies over 3 people.
  `eleven_v4` has no speed setting; pace is applied with ffmpeg afterwards.
