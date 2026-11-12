# agentfiles

Personal collection of [Claude Code](https://claude.com/claude-code) configuration files — custom skills and agents — shared across projects.

## Structure

```
agentfiles/
├── agents/        # Custom subagent definitions
├── skills/        # Custom skills (SKILL.md + docs)
├── install-skill  # CLI to install skills from GitHub or a local directory
└── install.sh     # Sets up this repo's tools (see below)
```

### skills/

Each skill lives in its own directory containing a `SKILL.md` (the instructions Claude loads when the skill is invoked) and an optional `README.md` documenting what it does, when it triggers, and any caveats.

| Skill | Description |
|---|---|
| [economist-style](skills/economist-style/SKILL.md) | Apply The Economist style guide to written content — detects weasel words, fillers, passive voice, and other style issues in markdown, HTML, or documentation. |
| [hacker-news-thread-summary](skills/hacker-news-thread-summary/SKILL.md) | Writes a taude.xyz blog post from a Hacker News comments thread — synthesized by argument and edited with economist-style, saved as an `ai-drafted` draft. |
| [python-cli](skills/python-cli/SKILL.md) | Opinionated guide for building Python CLI programs — `uv` for packages, `click`/`rich`/`textual` for CLI/TUI, XDG config conventions, single-file scripts with PEP 723 inline dependencies. |
| [taude](skills/taude/SKILL.md) | Maintains a personal LLM wiki inside an Obsidian vault — ingests articles archivore scrapes daily into synthesized, cross-referenced topic pages. |
| [ux-review-laws-of-ux](skills/ux-review-laws-of-ux/SKILL.md) | Reviews UI/UX designs (artifacts, prototypes, screenshots) against the 30 laws from [lawsofux.com](https://lawsofux.com/), grouped into seven review lenses, with a ranked findings table. |

### agents/

Custom subagent definitions (currently empty — add agent `.md` files here following Claude Code's subagent format).

### Session resume

The session-resume hooks that used to live here (`hooks/session-*-resume.sh`) are retired. [taude](https://github.com/taudep/taude) now tracks Claude Code sessions: each new session starts with where the project left off and its open next actions, and `taude setup` removes the old hook entries from `~/.claude/settings.json`.

## Usage

Copy or symlink the relevant `skills/` and `agents/` subdirectories into a project's `.claude/skills/` or `.claude/agents/` directory (or the global `~/.claude/` equivalents) to make them available to Claude Code.

## install.sh

Run once after cloning to set up this repo's tools:

```sh
./install.sh
```

This symlinks `install-skill` into `~/.local/bin` (creating it if needed) so it's available as a bare command, and symlinks each skill in `skills/` into `~/.claude/skills/`. It's safe to re-run — it skips anything already correctly linked or merged, and refuses to overwrite a file at the destination that isn't a symlink it created. To use different directories, set `BIN_DIR` and/or `CLAUDE_DIR`:

```sh
BIN_DIR=/usr/local/bin sudo -E ./install.sh
CLAUDE_DIR=/path/to/.claude ./install.sh
```

The hook merge step requires [`jq`](https://jqlang.org/) — if it's missing, install.sh links everything else and prints a warning instead of failing.

As more tools are added to this repo, `install.sh` is the place they'll get wired up.

## install-skill

A standalone CLI for installing skills into `~/.claude/skills/`, either downloaded from a GitHub repo (this one or any other) or symlinked from a local directory. It's a self-contained [`uv`](https://docs.astral.sh/uv/) script — no separate install step needed — and shells out to `gh` for GitHub access, so you'll need the [GitHub CLI](https://cli.github.com/) authenticated (`gh auth login`).

Browse and multi-select skills (uses `fzf` if installed, otherwise a `questionary` checkbox prompt), pulling from this repo's `skills/` folder by default:

```sh
./install-skill
```

Already-installed skills are marked in the picker, and ones with upstream changes newer than your local copy are flagged for update.

Browse skills in a different repo:

```sh
./install-skill --browse https://github.com/org/repo/tree/branch/path/to/skills
```

Install a single skill directly by URL, skipping the picker:

```sh
./install-skill --url https://github.com/org/repo/tree/branch/path/to/skill
```

### Installing a local skill by symlink

`--local` symlinks a skill directory into `~/.claude/skills/` instead of downloading it — useful while developing a skill in this repo, since edits show up immediately without reinstalling. Point it at the skill's directory under `skills/` in this repo. On this machine that's e.g.:

```sh
./install-skill --local /Users/taude/dev/agentfiles/skills/python-cli
```

or, run from the repo root, the relative form works too:

```sh
./install-skill --local ./skills/python-cli
```

### Updating installed skills

Skills installed from GitHub record their source in a `.install-skill.json` file inside the skill directory. `update` uses that to re-check the source and re-download if it's changed:

```sh
./install-skill update                       # update everything that has changes
./install-skill update python-cli             # update just one (or more) skills by name
./install-skill update --dry-run              # show what would change without writing
./install-skill update --force                # re-download regardless of timestamps
```

Skills installed via `--local` are symlinks, so they're always current and `update` just reports them as such — no action needed.

Other flags (on the base command):

| Flag | Description |
|---|---|
| `--skills-dir PATH` | Install into a custom directory instead of `~/.claude/skills` |
| `--name NAME` | Override the installed skill's directory name (`--url`/`--local` mode only) |
| `--force` | Overwrite existing skills without prompting |
| `--dry-run` | Show what would be installed without writing any files |

To use it from anywhere, run `./install.sh` once (see above) to put it on your `PATH`.
