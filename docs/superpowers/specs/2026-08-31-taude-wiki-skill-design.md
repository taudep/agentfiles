# `taude` Skill — Personal LLM Wiki (Design)

Date: 2026-08-31
Status: approved design, pre-implementation

## Purpose

A Claude Code skill (`skills/taude/`) that makes Claude a disciplined maintainer of a
personal knowledge wiki (the Karpathy "LLM Wiki" pattern), built inside Todd's Obsidian
vault and fed by the archivore project's daily scrapes. Topics-only synthesis: the wiki
holds topic pages built from many articles, not per-article summary pages.

## Paths (authoritative)

| Thing | Path |
|---|---|
| Vault | `~/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault` |
| Raw sources (archivore output) | `<vault>/Archivore/Raw/` |
| Wiki | `<vault>/Archivore/Wiki/` |
| Skill | `~/dev/agentfiles/skills/taude/` |
| Archivore project | `~/dev/python-test/` |
| Archivore config (machine-local) | `~/.config/archivore/config.yaml` |

Raw files are named `YYYYMMDD-Title.md` and carry YAML frontmatter from archivore
(`title`, `id`, `source`, `published`, `created`, `tags: [clippings]`, sometimes
`hackernews-discussion`). ~275 files exist as backlog; ~5–10 arrive daily.

## Wiki layout

```
Archivore/Wiki/
├── index.md      # catalog: every topic page with a one-line summary + source count
├── log.md        # append-only, timestamped record of ingests/lints (the cross-machine
│                 #   sync record); entries: "## [2026-08-31 14:30] ingest | 12 sources → 5 topics"
├── schema.md     # evolving conventions + curated topic list (Active + Proposed sections)
└── Topics/
    └── <Topic Name>.md
```

Division of responsibility: `SKILL.md` (in the agentfiles git repo) holds stable process —
paths, workflows, page conventions. `schema.md` (in the vault, iCloud-synced) holds the
evolving topic taxonomy, so a topic approved on one machine is immediately visible on all
machines without a git pull.

## Processed tracking + tagging

On ingest, each raw file's **frontmatter only** is edited (body never touched):

```yaml
tags:
  - clippings
  - topic/ai-coding        # one or more nested Obsidian tags
taude-ingested: 2026-08-31T14:30:00Z
```

- Unprocessed = files without a `taude-ingested:` key: `grep -L 'taude-ingested:' Raw/*.md`.
- This makes ingest **idempotent across machines**. No lock files. If iCloud sync lag lets
  two machines double-process a file, the worst case is a duplicate mention on a topic
  page; `lint` detects and fixes it.
- Articles matching no active topic get `topic/unfiled` (plus `taude-ingested`) so they
  are not rescanned every run.

## Topic pages

- Created/updated only from ≥1 matching sources; synthesized prose organized by
  sub-themes, not a raw link dump.
- Every claim cites its source: `[[20260712-I love LLMs, I hate hype]]` wikilink to the
  raw file, plus the original URL where useful.
- YAML frontmatter on topic pages: `tags: [wiki-topic]`, `topic: ai-coding`,
  `sources: <count>`, `updated: <date>` (Dataview-friendly).
- Contradictions between sources are flagged inline, not silently resolved.

## Operations (skill subcommands)

### `/taude ingest`
1. List unprocessed raw files.
2. Read each; classify against Active topics in `schema.md` (an article may hit multiple).
3. Update/create topic pages under `Topics/`.
4. Stamp frontmatter (tags + `taude-ingested`) on each processed raw file.
5. Unmatched articles → `topic/unfiled`. When 2–3 unfiled articles cluster around a theme,
   write a topic proposal into the digest and the Proposed section of `schema.md`.
   Proposals are created as real topic pages only after user approval (chat, or the user
   moves it to Active in `schema.md`); the next ingest back-fills the unfiled articles.
6. Update `index.md`; append a `log.md` entry.
7. Digest: to chat when interactive; folded into the `log.md` entry when headless.

**Backlog bootstrap:** the first ingest processes the ~275-file backlog in date-ordered
chunks, seeding topic pages from the curated list below and proposing emergent topics.

### `/taude status`
Unprocessed count, last ingest time (from `log.md`), topic count, pending proposals,
unfiled count.

### `/taude lint`
Contradictions between pages, stale claims superseded by newer sources, orphan/thin
topics (merge candidates), duplicate mentions (double-ingest repair), missing
cross-links between topic pages, index/log consistency.

### Query
No subcommand — the skill instructs Claude to answer questions by reading `index.md`
first, drilling into topic pages, citing sources, and filing valuable answers back into
the wiki as new pages or page sections.

## Seed topics (Active list for schema.md)

From the user's Notion software-engineering taxonomy (import of Notion content itself:
explicitly out of scope — this is only the seed list):

local-first, ai-resources, ai-mcp, ai-coding, ai-agents, ai-rag, ai-gensql, databases,
dotnet, data-analytics, cli-tools, python, swiftui, kubernetes, prompt-engineering,
distributed-systems, bi-tools, swe-misc, testing, vscode, n8n, data-engineering,
computer-setup, tmux, rust, emacs, nix.

Human-readable page names map from slugs (e.g. `ai-mcp` → "AI – MCP"); the slug↔name
mapping lives in `schema.md`.

## Archivore chaining (opt-in, one machine only)

Archivore gains one **generic** optional config key:

```yaml
post_run_cmd: claude -p "/taude ingest"
```

Run (via shell) after a successful scrape that produced new files; failures are logged
but never fail the scrape. Because `~/.config/archivore/config.yaml` is machine-local,
only the designated machine sets it — other machines can still run `/taude ingest`
manually and safely (idempotency above).

## Deliverables

1. `skills/taude/SKILL.md` + `skills/taude/README.md` in agentfiles (plus README table row).
2. Vault seed files: `Wiki/schema.md` (conventions + Active seed topics), `Wiki/index.md`,
   `Wiki/log.md` (with a bootstrap entry).
3. Archivore patch: `post_run_cmd` support (config + run command), with a test.
4. First backlog ingest run (can be a follow-up session).

## Backlog (future ideas, not in this build)

- **Port Notion content**: import the Notion software-engineering pages (likely via
  Notion's Markdown export → Raw files → normal ingest) so the curated links/notes
  behind the seed topics land in the wiki, not just the topic names.

## Out of scope (YAGNI)

- Search tooling (qmd etc.) — `index.md` suffices at this scale.
- Per-source summary pages, Marp decks, scheduled cloud agents, lock files.
