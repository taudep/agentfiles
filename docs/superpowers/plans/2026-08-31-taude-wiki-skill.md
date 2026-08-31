# `taude` Wiki Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `taude` Claude Code skill that turns Todd's Obsidian vault into a
self-maintaining, topics-only LLM wiki fed by archivore's daily scrapes, plus the
one-line archivore hook that can trigger it automatically on one designated machine.

**Architecture:** A skill directory (`skills/taude/SKILL.md`) documents paths and the
three operations (`ingest`, `status`, `lint`) as instructions Claude follows — there is
no new code to run the skill itself. Three seed files in the vault (`index.md`,
`log.md`, `schema.md`) give the skill somewhere to read/write state, keeping ingest
idempotent via a `taude-ingested` frontmatter stamp on raw files. A small, generic
`post_run_cmd` config field is added to archivore so one designated machine can chain
`claude -p "/taude ingest"` after a successful scrape.

**Tech Stack:** Claude Code skill (Markdown), Obsidian vault (Markdown + YAML
frontmatter), Python 3.12 / archivore's existing `Config` dataclass + `subprocess`.

**Spec:** `docs/superpowers/specs/2026-08-31-taude-wiki-skill-design.md`

## Global Constraints

- Vault root: `~/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault`
- Raw sources: `<vault>/Archivore/Raw/` — body content is immutable; only frontmatter
  may be edited by the skill.
- Wiki root: `<vault>/Archivore/Wiki/` (`index.md`, `log.md`, `schema.md`, `Topics/`).
- Skill location: `~/dev/agentfiles/skills/taude/`.
- Archivore project root: `~/dev/python-test/` (package at `~/dev/python-test/archivore/`,
  tests at `~/dev/python-test/tests/`).
- Ingest must be idempotent across machines: unprocessed = raw files missing a
  `taude-ingested:` frontmatter key. No lock files.
- Topics-only wiki: no per-source summary pages, no search tooling, no scheduled cloud
  agents, no Marp/lock-file machinery — see spec's "Out of scope" section.
- Archivore's `post_run_cmd` config key is a generic shell command hook, not
  Claude-specific, and its default is unset/off.

---

## File Structure

| File | Responsibility |
|---|---|
| `skills/taude/SKILL.md` | The skill: frontmatter, paths, page conventions, the three operations, seed topic list reference. What Claude reads on every `/taude` invocation. |
| `skills/taude/README.md` | Human-facing doc: what it does, when it triggers, caveats — matches the convention of `skills/python-cli/README.md` / `skills/economist-style/README.md`. |
| `agentfiles/README.md` | Add a row to the existing skills table. |
| `<vault>/Archivore/Wiki/schema.md` | Evolving conventions doc: slug↔name map, Active/Proposed topic lists (seeded from the spec's 35 topics). |
| `<vault>/Archivore/Wiki/index.md` | Empty catalog scaffold with the header format the skill appends under. |
| `<vault>/Archivore/Wiki/log.md` | Empty append-only log with one bootstrap entry recording the wiki's creation. |
| `python-test/archivore/config.py` | Modify: add `post_run_cmd: str \| None = None` field to `Config`. |
| `python-test/archivore/commands/run.py` | Modify: add `_run_post_run_cmd(cfg)` (mirrors `_notify_macos`/`_send_email`) called from `run()`. |
| `python-test/tests/test_config.py` | Modify: default-None test for `post_run_cmd`, matching the existing `queue_api_fields_default_to_none` pattern. |
| `python-test/tests/test_run.py` | Modify: tests for `_run_post_run_cmd` (no-op when unset, invoked when set, failure doesn't raise). |

No new Python modules — `post_run_cmd` is a small addition to two existing files,
following the existing `_notify_macos`/`_send_email` pattern exactly.

---

### Task 1: Seed the wiki files in the vault

**Files:**
- Create: `<vault>/Archivore/Wiki/schema.md`
- Create: `<vault>/Archivore/Wiki/index.md`
- Create: `<vault>/Archivore/Wiki/log.md`

where `<vault>` = `~/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault`.

**Interfaces:**
- Produces: the exact section headers and topic-slug list that `SKILL.md` (Task 2)
  references and instructs Claude to read/append to.

- [ ] **Step 1: Create `Wiki/schema.md` with conventions and the seed topic list**

```markdown
# Wiki Schema

Conventions for the `taude` personal LLM wiki. Extended in place — the LLM proposes
new topics here during ingest; Todd approves by moving them from Proposed to Active.

## Page conventions

Topic pages live in `Topics/<Human Readable Name>.md` and use this frontmatter:

```yaml
---
tags: [wiki-topic]
topic: <slug>
sources: <count>
updated: <YYYY-MM-DD>
---
```

Body is synthesized prose organized by sub-theme, not a link dump. Every claim cites
its source as a wikilink to the raw file (`[[20260712-Article Title]]`) plus the
original URL where useful. Contradictions between sources are flagged inline, never
silently resolved.

## Slug ↔ page name map

| Slug | Page name |
|---|---|
| local-first | Local First |
| ai-resources | AI Resources |
| ai-mcp | AI – MCP |
| ai-coding | AI Coding |
| ai-agents | AI – Building Agents |
| ai-rag | AI – RAG |
| ai-gensql | AI – GenSQL |
| databases | Database Things |
| dotnet | .NET Things |
| data-analytics | Data Analytics Things |
| cli-tools | CLI Tools |
| python | Python |
| swiftui | SwiftUI |
| kubernetes | Kubernetes |
| prompt-engineering | Prompt Engineering |
| distributed-systems | Distributed Systems |
| bi-tools | Business Intelligence (BI) Tools |
| swe-misc | Software Engineering – Misc Links |
| testing | Software Testing |
| vscode | VS Code |
| n8n | n8n Notes |
| data-engineering | Data Engineering |
| computer-setup | Computer Setup Inspiration |
| tmux | TMUX-esque Things |
| rust | Rust |
| emacs | Emacs Stuff |
| nix | Nix |
| agentic-coding-tools | Agentic Coding Tools |
| agentic-coding-tips | Agentic Coding Tips |
| claude-code-tips | Claude Code Tips |
| local-agentic-coding | Local Agentic Coding |
| local-llms | Local LLMs |
| ai-lifestyle | AI Lifestyle |
| ai-slop | AI Slop |
| tui | TUI |

## Active topics

local-first, ai-resources, ai-mcp, ai-coding, ai-agents, ai-rag, ai-gensql, databases,
dotnet, data-analytics, cli-tools, python, swiftui, kubernetes, prompt-engineering,
distributed-systems, bi-tools, swe-misc, testing, vscode, n8n, data-engineering,
computer-setup, tmux, rust, emacs, nix, agentic-coding-tools, agentic-coding-tips,
claude-code-tips, local-agentic-coding, local-llms, ai-lifestyle, ai-slop, tui

## Proposed topics

(none yet — ingest appends here when 2-3 unfiled articles cluster around a theme)

## Fallback

Articles matching no Active topic get `topic/unfiled` in their frontmatter tags and
are not rescanned on later runs unless a new topic is approved and back-filled.
```

- [ ] **Step 2: Create `Wiki/index.md` with the empty catalog scaffold**

```markdown
# Wiki Index

Catalog of every topic page, updated on every ingest. Read this first when answering a
query, then drill into the relevant topic page(s).

## Topics

(no topic pages yet — created by `/taude ingest`)
```

- [ ] **Step 3: Create `Wiki/log.md` with a bootstrap entry**

```markdown
# Wiki Log

Append-only. Grep the last N entries with:
`grep "^## \[" log.md | tail -5`

## [2026-08-31 00:00] bootstrap | Wiki created, schema seeded with 35 topics
```

- [ ] **Step 4: Verify the three files exist and are valid**

Run: `ls -la "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault/Archivore/Wiki/"`
Expected: `schema.md`, `index.md`, `log.md` listed alongside the existing `Raw/` dir.

No commit for this task — the vault is not a git repo tracked by `agentfiles`.

---

### Task 2: Write the `taude` skill

**Files:**
- Create: `skills/taude/SKILL.md`
- Create: `skills/taude/README.md`
- Modify: `README.md:20` (skills table — insert a row after the `python-cli` row)

**Interfaces:**
- Consumes: the exact section headers/paths from Task 1's `schema.md`, `index.md`,
  `log.md`.
- Produces: `/taude ingest`, `/taude status`, `/taude lint` as documented invocations
  other sessions and the archivore hook (Task 3) will call via `claude -p "/taude ingest"`.

- [ ] **Step 1: Write `skills/taude/SKILL.md`**

```markdown
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

## Operation: `/taude ingest`

1. Find unprocessed raw files: files in `Raw/` with no `taude-ingested:` key in
   frontmatter (`grep -L 'taude-ingested:' Raw/*.md`). If none, report "nothing to
   ingest" and stop — still update `log.md` with a zero-item entry.
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
   This is the only edit made to a raw file — never touch the body.
6. Look across files just tagged `topic/unfiled` in this run plus any from previous
   runs still untagged with a real topic: if 2-3 cluster around a clear shared theme,
   add a proposal to the "Proposed topics" section of `schema.md` (slug, name,
   candidate source files) and mention it in the digest. Do not create the topic page
   or move it to Active without Todd's approval.
7. Update `index.md`: one line per topic page touched this run (link, one-line
   summary, source count), keeping existing untouched entries as-is.
8. Append one entry to `log.md`:
   `## [YYYY-MM-DD HH:MM] ingest | <N> sources → <M> topics touched`
   with a short bullet list of which topics changed and any proposals raised.
9. Report a digest: sources processed, topics created/updated, proposals raised. When
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
```

- [ ] **Step 2: Write `skills/taude/README.md`**

```markdown
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
```

- [ ] **Step 3: Add the skill to the repo README's skills table**

Read the current table row for `python-cli` (`README.md` around line 20) and insert a
new row directly after it:

```markdown
| [taude](skills/taude/SKILL.md) | Maintains a personal LLM wiki inside an Obsidian vault — ingests articles archivore scrapes daily into synthesized, cross-referenced topic pages. |
```

- [ ] **Step 4: Verify SKILL.md frontmatter is valid YAML**

Run: `uv run --with pyyaml python3 -c "import yaml,re,pathlib; t=pathlib.Path('skills/taude/SKILL.md').read_text(); fm=t.split('---')[1]; yaml.safe_load(fm); print('ok')"`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add skills/taude/SKILL.md skills/taude/README.md README.md
git commit -m "Add taude skill for personal LLM wiki

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NLavo17teAwJ6rgaDFQW9i"
```

---

### Task 3: Add `post_run_cmd` to archivore

**Files:**
- Modify: `python-test/archivore/config.py:81` (end of `Config` dataclass fields)
- Modify: `python-test/archivore/commands/run.py` (new function + call site in `run()`)
- Test: `python-test/tests/test_config.py`
- Test: `python-test/tests/test_run.py`

**Interfaces:**
- Consumes: `archivore.config.Config` dataclass (existing), `run()`'s existing
  `_notify_macos(result)` / `_send_email(cfg, result)` call-site pattern at the end of
  `run()` in `commands/run.py`.
- Produces: `Config.post_run_cmd: str | None` (new field, default `None`); a new
  function `_run_post_run_cmd(cfg: Config) -> None` in `commands/run.py`, called from
  `run()` after `_send_email`.

- [ ] **Step 1: Write the failing config test**

Add to `python-test/tests/test_config.py` (matching the existing
`test_queue_api_fields_default_to_none` style):

```python
def test_post_run_cmd_defaults_to_none():
    cfg = Config()
    assert cfg.post_run_cmd is None
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd ~/dev/python-test && uv run --frozen pytest tests/test_config.py::test_post_run_cmd_defaults_to_none -v`
Expected: FAIL — `AttributeError: 'Config' object has no attribute 'post_run_cmd'`

- [ ] **Step 3: Add the field to `Config`**

In `python-test/archivore/config.py`, add after the `email_from` field (last field in
the dataclass):

```python
    email_from: str | None = None
    # Generic hook, run via shell after a successful scrape that produced new
    # files. Not Claude-specific — any command works. Intended for exactly one
    # designated machine to chain wiki ingest; other machines leave it unset
    # and stay safe since ingest is idempotent per raw file.
    post_run_cmd: str | None = None
```

- [ ] **Step 4: Run the config test to confirm it passes**

Run: `cd ~/dev/python-test && uv run --frozen pytest tests/test_config.py -v`
Expected: all PASS, including the new test.

- [ ] **Step 5: Write the failing run tests**

Add to `python-test/tests/test_run.py`, alongside the existing imports (extend the
`from archivore.commands.run import ...` line) and at the end of the file:

```python
from archivore.commands.run import (
    _run_post_run_cmd,
    discover_items,
    indexable_rows,
    partition_claims,
)


class TestRunPostRunCmd:
    def test_noop_when_unset(self):
        cfg = Config()
        with patch("archivore.commands.run.subprocess.run") as mock_run:
            _run_post_run_cmd(cfg)
        mock_run.assert_not_called()

    def test_invokes_configured_command(self):
        cfg = Config()
        cfg.post_run_cmd = 'claude -p "/taude ingest"'
        with patch("archivore.commands.run.subprocess.run") as mock_run:
            _run_post_run_cmd(cfg)
        mock_run.assert_called_once()
        args, kwargs = mock_run.call_args
        assert args[0] == 'claude -p "/taude ingest"'
        assert kwargs.get("shell") is True

    def test_failure_is_swallowed_not_raised(self):
        cfg = Config()
        cfg.post_run_cmd = "false"
        with patch(
            "archivore.commands.run.subprocess.run",
            side_effect=OSError("boom"),
        ):
            _run_post_run_cmd(cfg)  # must not raise
```

- [ ] **Step 6: Run the new tests to confirm they fail**

Run: `cd ~/dev/python-test && uv run --frozen pytest tests/test_run.py::TestRunPostRunCmd -v`
Expected: FAIL — `ImportError: cannot import name '_run_post_run_cmd'`

- [ ] **Step 7: Implement `_run_post_run_cmd` and wire it into `run()`**

In `python-test/archivore/commands/run.py`, add the function right after
`_send_email` (matching that function's try/except-and-log-only shape):

```python
def _run_post_run_cmd(cfg: Config) -> None:
    """Shell out to cfg.post_run_cmd if configured — e.g. to chain wiki ingest
    on the one designated machine. Never raises; failures are logged only, so
    a broken hook never fails the scrape it runs after."""
    if not cfg.post_run_cmd:
        return
    console.print(f"\n[bold]Running post-run command[/bold]: {cfg.post_run_cmd}")
    try:
        result = subprocess.run(
            cfg.post_run_cmd, shell=True, capture_output=True, text=True, timeout=600
        )
        if result.returncode != 0:
            console.print(
                f"[yellow]post_run_cmd exited {result.returncode}[/yellow]"
            )
            if result.stderr:
                console.print(result.stderr[:300])
    except (OSError, subprocess.SubprocessError) as e:
        console.print(f"[yellow]post_run_cmd failed: {e}[/yellow]")
```

Then in `run()`, add the call at the very end, after the email block:

```python
    if cfg.smtp_host and cfg.email_to:
        _send_email(cfg, result)

    _run_post_run_cmd(cfg)
```

- [ ] **Step 8: Run the run tests to confirm they pass**

Run: `cd ~/dev/python-test && uv run --frozen pytest tests/test_run.py -v`
Expected: all PASS, including the three new `TestRunPostRunCmd` tests.

- [ ] **Step 9: Run the full test suite and lints**

Run: `cd ~/dev/python-test && uv run --frozen pytest && uv run --frozen ruff check .`
Expected: all tests PASS, ruff reports no issues (fix any line-length/import issues in
the new code if it does).

- [ ] **Step 10: Commit**

```bash
cd ~/dev/python-test
git add archivore/config.py archivore/commands/run.py tests/test_config.py tests/test_run.py
git commit -m "Add optional post_run_cmd hook after a successful run

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NLavo17teAwJ6rgaDFQW9i"
```

---

## Not in this plan (see spec's Backlog / Out of scope)

- Setting `post_run_cmd` in any machine's actual `~/.config/archivore/config.yaml` —
  that's a one-line manual step for Todd to do on his chosen machine once this ships,
  not a code change.
- Running the first backlog ingest (~275 files) — explicitly a follow-up session per
  the spec's Deliverables section.
- Porting Notion content — spec's Backlog section, future work.
