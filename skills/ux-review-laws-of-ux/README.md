# ux-review-laws-of-ux

Reviews a UI/UX design (HTML/React artifact, prototype, screenshot, mockup, Figma frame) against the 30 laws catalogued at [lawsofux.com](https://lawsofux.com/) by Jon Yablonski. Built for checking designs that Claude creates before you ship them.

## What it does

- Groups the 30 laws into seven review lenses: Familiarity, Decisions & complexity, Memory & load, Visual grouping (Gestalt), Attention & emphasis, Interaction & responsiveness, and Motivation & experience. A final reviewer self-check covers Cognitive Bias.
- Produces a ranked findings table (severity, law, where, problem, fix), a short "what works" list, and a list of what it couldn't check.
- `reference/laws.md` holds per-law checks, red flags, and fix patterns, loaded only when needed.

## Triggers

"review my UX", "UX review this design", "is this usable?", "check this against the laws of UX", `/ux-review-laws-of-ux`, or after Claude builds a page or artifact you want critiqued.

## Install

```sh
install-skill   # pick ux-review-laws-of-ux
```

## Attribution

Law definitions and source pages: [Laws of UX](https://lawsofux.com/) © Jon Yablonski. The summaries, checks, and red flags here are paraphrased for review use. See each law's linked page for the full write-up.
