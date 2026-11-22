# taude

Maintains Todd's personal LLM wiki — a topics-only, self-compounding knowledge base
built inside his Obsidian vault from articles `archivore` (a sibling project at
`~/dev/python-test/`) scrapes daily.

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

## Automated runs

archivore can trigger ingest automatically after each scrape via its optional
`post_run_cmd` hook (`claude -p "/taude ingest"`), so it can run unattended, headless,
with no one watching. Two things have to be true for that to actually work:

- **Permissions.** Claude Code's default permission mode requires interactive approval
  for Write/Edit calls, which a headless `claude -p` run has no way to give — so an
  unattended ingest would read the vault fine but fail every write silently (archivore's
  side swallows non-zero exits from `post_run_cmd`). Grant write access scoped to the
  vault rather than a blanket allow-all:

  ```sh
  claude -p "/taude ingest" --permission-mode acceptEdits --add-dir "<vault>/Archivore"
  ```

  (Flag names current as of this writing — recheck `claude --help` if they've since
  changed.)

- **Installation location.** A headless run from archivore's working directory needs to
  resolve `/taude`, which means this skill has to be installed at the user level
  (`~/.claude/skills/taude/`), not only present in this repo checkout. Use
  `./install-skill --local ./skills/taude` (see the top-level README) or `install-skill`'s
  GitHub install path.

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
