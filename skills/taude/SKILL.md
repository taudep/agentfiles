---
name: taude
description: Use this skill to maintain Todd's personal LLM wiki inside his Obsidian vault — ingesting new articles archivore drops into the Raw folder, answering questions against the wiki, and linting it for health. Triggers on "/taude ingest", "/taude status", "/taude lint", "ingest my wiki", "update the wiki", "what's in my wiki about X".
---

# taude — Personal LLM Wiki

Maintains a topics-only, self-compounding wiki (the Karpathy "LLM Wiki" pattern) inside
Todd's Obsidian vault, built from articles archivore scrapes daily.

## Paths

| Thing | Path |
|---|---|
| Vault | `~/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault` |
| Raw sources | `<vault>/Archivore/Raw/` — **read-only**, only frontmatter may be edited |
| Wiki | `<vault>/Archivore/Wiki/` |
| Index | `<vault>/Archivore/Wiki/index.md` |
| Log | `<vault>/Archivore/Wiki/log.md` |
| Schema (conventions + topic list) | `<vault>/Archivore/Wiki/schema.md` |
| Topic pages | `<vault>/Archivore/Wiki/Topics/<Name>.md` |

Read `schema.md` at the start of every operation — it holds the current Active/Proposed
topic list and the slug↔page-name map, and it changes independently of this skill file
(Todd approves proposals by editing it directly, on any machine, via iCloud sync).

## Raw file conventions

Raw files are named `YYYYMMDD-Title.md` with archivore frontmatter (`title`, `id`,
`source`, `published`, `created`, `tags: [clippings]`). Never edit the body. Ingest adds
two frontmatter keys only:

```yaml
tags:
  - clippings
  - topic/ai-coding        # one nested tag per matched topic slug, or topic/unfiled
taude-ingested: 2026-08-31T14:30:00Z   # UTC, ISO 8601
```

`Raw/index.md` is archivore's own generated catalog file, not an article: it has no
YAML frontmatter and is rewritten wholesale on every scrape. Never read, classify, or
write it — all discovery and ingest commands below target `Raw/[0-9]*.md` (the
`YYYYMMDD-...` naming convention) specifically to exclude it.

If a raw filename contains `[`, `]`, or `#`, cite it with a standard Markdown link
(`[Article Title](Raw/Filename.md)`) instead of a wikilink — those characters break
Obsidian's `[[...]]` parsing.

Example quoted path, since the vault name has both a space and an apostrophe:

```sh
cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault/Archivore"
```

## Operation: `/taude ingest`

1. Find unprocessed raw files: files in `Raw/` with no `taude-ingested:` key in
   frontmatter (`grep -L 'taude-ingested:' Raw/[0-9]*.md`). The `[0-9]*` glob matches
   only the `YYYYMMDD-Title.md` article convention, so it excludes archivore's
   generated `Raw/index.md` (see Raw file conventions above). If none, report "nothing
   to ingest" and stop — still update `log.md` with a zero-item entry.
2. Read `schema.md` for the current Active topic list.
3. Read each unprocessed raw file's body and frontmatter. Classify it against Active
   topics — an article may match multiple, or none.
4. For each matched topic: read the existing `Topics/<Name>.md` if present, and
   rewrite it to weave in the new source — synthesized prose organized by sub-theme,
   not appended as a list. Add a wikilink to the raw file
   (`[[20260712-Article Title]]`) plus the original URL as the citation. Flag any
   contradiction with existing wiki content inline rather than silently overwriting it.
   Update the page's frontmatter (`sources` count, `updated` date).
5. For each processed raw file, stamp its frontmatter: add `topic/<slug>` tag(s) (or
   `topic/unfiled` if no Active topic matched) and `taude-ingested: <UTC timestamp>`.
   This is the only edit made to a raw file — never touch the body. Add
   `taude-ingested` as its own line inside the frontmatter block — never append it to
   the same line as the closing `---` delimiter, which breaks YAML parsing for the
   whole file. After stamping each file, verify it still parses as valid YAML before
   moving to the next one (a run once did this wrong for 65 files in a row before
   catching and repairing it — cheaper to check per-file than to repair a whole batch
   after the fact).
6. Look across files just tagged `topic/unfiled` in this run plus any still tagged
   `topic/unfiled` from previous runs (`grep -l 'topic/unfiled' Raw/[0-9]*.md`): if 2-3
   cluster around a clear shared theme, add a proposal to the "Proposed topics" section
   of `schema.md` (slug, name, candidate source files) and mention it in the digest. Do
   not create the topic page or move it to Active without Todd's approval.
7. Back-fill previously unfiled files against newly-Active topics: find every file
   tagged `topic/unfiled` (`grep -l 'topic/unfiled' Raw/[0-9]*.md`) and check each
   against the *current* Active topic list from `schema.md` (step 2) — it may have
   grown since that file was last processed, e.g. Todd approved a proposal on another
   machine. For any that now match an Active topic: weave it into the matching topic
   page the same way as step 4, then update that raw file's frontmatter tags —
   replace `topic/unfiled` with the real `topic/<slug>` — leaving `taude-ingested`
   unchanged since it was already stamped.
8. Update `index.md`: one line per topic page touched this run (link, one-line
   summary, source count), keeping existing untouched entries as-is.
9. Append one entry to `log.md`:
   `## [YYYY-MM-DD HH:MM] ingest | <N> sources → <M> topics touched`
   with a short bullet list of which topics changed and any proposals raised.
10. Report a digest: sources processed, topics created/updated, proposals raised. When
    run interactively, this goes to chat. When run headless (`claude -p`), fold it into
    the `log.md` entry so nothing is lost.

**Backlog note:** the first-ever run will find ~275 unprocessed files. Process them in
date order, in batches (e.g. 20-30 at a time) rather than one giant pass, so topic pages
build up coherently and context stays manageable. Report progress between batches.

## Operation: `/taude status`

Report: count of unprocessed raw files, timestamp of the last `ingest`/`lint` entry in
`log.md`, count of topic pages, count of Proposed topics awaiting approval, count of
`topic/unfiled` raw files. No writes.

## Operation: `/taude lint`

Read every topic page plus `index.md`/`schema.md` and report (do not silently
auto-fix; propose changes and apply only what Todd confirms, unless the fix is purely
mechanical like a broken link):
- Contradictions between two topic pages, or within one page, about the same claim.
- Claims a newer source (by `published`/`created` date) supersedes but the page still
  states as current.
- Orphan topic pages (no inbound wikilinks from other topic pages) — suggest merges.
- Thin topic pages (1 source, sparse) — suggest merging into a broader topic or leaving
  as a seed.
- Duplicate source mentions on the same page (repair target for double-ingest races
  across machines).
- Topic pages missing from `index.md`, or `index.md` entries pointing at deleted pages.
- Concepts mentioned repeatedly across pages that have no page of their own — propose
  as a new topic the way ingest does.

Append a `## [...] lint | <N> issues found, <M> fixed` entry to `log.md`.

## Answering questions

Read `index.md` first to find candidate topic pages, then read those pages. Cite the
topic page and, where the topic page cites a raw file, that source too. If the answer
is a genuinely new synthesis worth keeping (a comparison, a connection across topics),
offer to file it into the relevant topic page rather than letting it live only in chat.

## Seed topic list

See `schema.md` in the vault — the Active list there is authoritative and evolves; this
file only defines the mechanics.
