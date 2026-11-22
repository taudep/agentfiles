# making-explainer-videos

Turns a paper/PDF (or any source) into a tight, narrated, vertical explainer video with
word-synced captions and camera zooms into the source's real quotes and figures.

- **Triggers on:** making a training/explainer video, YouTube Short or TikTok-style clip from a
  paper or doc; Remotion; ElevenLabs voiceover; captions; zooming into PDF figures.
- **Contents:** `SKILL.md` (workflow, script rules, pitfalls), `reference.md` (scenes.json and
  scene types), `template/` (working Remotion + ElevenLabs project), `scripts/new-video.sh`
  (scaffold a new project from the template).
- **Setup per machine:** clone this repo, run `./install.sh` (or `install-skill` on this folder), set
  `EXPLAINER_CONTENT_DIR` to the folder holding per-video content (optional `EXPLAINER_RENDERS_DIR` for rendered videos), and add the ElevenLabs key to
  Keychain (`security add-generic-password -a "$USER" -s elevenlabs-api-key -w`). Optional:
  `ELEVENLABS_VOICE_ID`.
- **Requires:** Node 20+, ffmpeg/ffprobe, `uv` (for the PyMuPDF extractor), macOS for the
  Keychain key lookup and the free `say` draft voice. An ElevenLabs API key for the real voice.
- **Caveats:** Remotion needs a company license for commercial use by companies over 3 people.
  `eleven_v4` has no speed setting; pace is applied with ffmpeg afterwards.
