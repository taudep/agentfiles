# YouTube upload sheet

**Format:** Short (9:16, 1080×1920, under 3 min). Upload `out/short.mp4`.
**Captions:** Subtitles → Upload file → With timing → `out/captions.srt`.
**Altered or synthetic content:** answer **Yes** if the narration is your ElevenLabs voice clone.
It's your own voice reading your own script, but disclosure is cheap and avoids any ambiguity.
**Visibility for practice:** Unlisted first; flip to Public once you like it.

## Title (≤100 chars)
Your AI plan is subsidized. Run the model yourself. #Shorts

## Description
A $200/month AI plan, fully used, reportedly burns ~$14,000 of compute a month, and limits
are already tightening. Here's the case for running an open model on your own machine:
what it gives you, how close it is to the frontier, and the one command to start.

Try it:
  ollama run qwen3:4b
Then turn off your Wi-Fi and ask again.

Pro tip: if it "forgets after a few pages", raise the context window:
  OLLAMA_CONTEXT_LENGTH=65536 ollama serve

Source: "Local LLM: The Cognitive Core Thesis", an independent synthesis of
Andrej Karpathy's public posts on the LLM OS and the "cognitive core", plus published benchmark
and pricing reporting. Not affiliated with or endorsed by Andrej Karpathy. Figures are as
reported by Epoch AI, Artificial Analysis and SemiAnalysis-cited reporting (2026).

## Tags
local llm, ollama, open source ai, karpathy, llm os, ai subscription, self hosted ai
