# agentfiles

Personal collection of [Claude Code](https://claude.com/claude-code) configuration files — custom skills and agents — shared across projects.

## Structure

```
agentfiles/
├── agents/   # Custom subagent definitions
└── skills/   # Custom skills (SKILL.md + docs)
```

### skills/

Each skill lives in its own directory containing a `SKILL.md` (the instructions Claude loads when the skill is invoked) and an optional `README.md` documenting what it does, when it triggers, and any caveats.

| Skill | Description |
|---|---|
| [python-cli](skills/python-cli/SKILL.md) | Opinionated guide for building Python CLI programs — `uv` for packages, `click`/`rich`/`textual` for CLI/TUI, XDG config conventions, single-file scripts with PEP 723 inline dependencies. |

### agents/

Custom subagent definitions (currently empty — add agent `.md` files here following Claude Code's subagent format).

## Usage

Copy or symlink the relevant `skills/` and `agents/` subdirectories into a project's `.claude/skills/` or `.claude/agents/` directory (or the global `~/.claude/` equivalents) to make them available to Claude Code.
