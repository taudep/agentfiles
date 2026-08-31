# taude

Maintains Todd's personal LLM wiki — a topics-only, self-compounding knowledge base
built inside his Obsidian vault from articles [archivore](../../../python-test)
scrapes daily.

## What it does

- `/taude ingest` — processes new articles dropped in `Archivore/Raw/`, synthesizes
  them into topic pages under `Archivore/Wiki/Topics/`, updates the index and log,
  and stamps each processed raw file's frontmatter so ingest is safe to re-run and
  safe across machines.
- `/taude status` — quick health snapshot: unprocessed count, last run, topic/proposal
  counts.
- `/taude lint` — periodic health check: contradictions, stale claims, orphan/thin
  pages, missing cross-links.
- Plain questions get answered from the wiki (index → topic pages → sources), with
  good answers offered back into the wiki as new content.

## When it triggers

Explicit `/taude ...` commands, or natural requests like "ingest my wiki", "what's in
my wiki about local LLMs".

## Caveats

- Raw file bodies are immutable; only frontmatter (`tags`, `taude-ingested`) is ever
  written by this skill.
- The topic taxonomy lives in `Archivore/Wiki/schema.md` inside the vault (iCloud
  synced), not in this skill file — so approving a proposed topic on one machine is
  visible everywhere without a git pull.
- Ingest is idempotent per raw file (`taude-ingested` frontmatter key), so it's safe to
  trigger from multiple machines without coordination.
- See `docs/superpowers/specs/2026-08-31-taude-wiki-skill-design.md` in this repo for
  the full design rationale.
