# python-cli

> **Invocation:** `/disc:python-cli [description of the CLI to build]`

Opinionated guide for building Python CLI programs following DISC team conventions. Covers package management, code structure, library choices.

## Trigger phrases

- "create a Python CLI"
- "build a CLI tool in Python"
- "write a Python script/tool"
- "make a command-line tool"
- "scaffold a new Python CLI"
- Any request to create a new Python program or CLI in this repo

## What it does

- **Package management:** `uv` only — never `pip`
- **Libraries:** `click` for CLI, `rich`/`textual` for TUI, `requests` for HTTP, `snowflake-connector-python[secure-local-storage]` for Snowflake (SSO token caching), `python-dotenv` for env vars, `pyaml` for YAML
- **Structure:** `main.py` → `commands/` → `repository/` → `clients/` pattern for apps over ~350 lines
- **Config:** XDG config conventions (`~/.config/`)
- **Testing:** `pytest` with async support, type hints required throughout
- **Formatting:** `ruff` for lint + format (88-char line length)
- **Installers:** Generates `install.sh` / `uninstall.sh` for system-wide installation to `/usr`

## Caveats

- Enforces `uv` — any deviation (pip, poetry, etc.) will be corrected
- The skill references `python-cli-installable.md` for installer details; that file is not included in this plugin and may need to be supplied or recreated
- Single-file scripts use the `# /// script` inline dependency format for `uv run`
- The skill explicitly forbids `co-authored-by` lines in commits (DISC preference)
- Type hints are required on all code — no `Any` shortcuts

## Token usage estimate

| Phase | Tokens |
|---|---|
| Skill context loaded | ~2,500 |
| Scaffolding a new CLI | ~3,000–8,000 |
| Adding features to existing CLI | ~1,000–4,000 |
| **Typical session total** | **~5,000–12,000** |

Sessions that include writing tests and formatters in the same turn cost more.
