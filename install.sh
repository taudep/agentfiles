#!/usr/bin/env bash
# Install and configure the artifacts in this repo: puts install-skill on
# PATH and links the skills into ~/.claude/skills.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"
SKILLS_DIR="${SKILLS_DIR:-$CLAUDE_DIR/skills}"

link_bin() {
  local src="$1"
  local name
  name="$(basename "$src")"
  local dest="$BIN_DIR/$name"

  mkdir -p "$BIN_DIR"

  if [[ -e "$dest" && ! -L "$dest" ]]; then
    echo "✗ $name: $dest already exists and isn't a symlink — skipping. Remove it manually if you want install.sh to manage it."
    return
  fi

  ln -sf "$src" "$dest"
  echo "✓ $name -> $dest"
}

# Symlinks every skill subdirectory under ./skills into ~/.claude/skills, so
# re-running install.sh after adding a new skill picks it up automatically.
link_skills() {
  local skills_src="$REPO_DIR/skills"
  [[ -d "$skills_src" ]] || return

  mkdir -p "$SKILLS_DIR"

  local dir name dest
  for dir in "$skills_src"/*/; do
    [[ -d "$dir" ]] || continue
    name="$(basename "$dir")"
    dest="$SKILLS_DIR/$name"

    if [[ -L "$dest" ]]; then
      if [[ "$(readlink "$dest")" == "${dir%/}" ]]; then
        echo "✓ skill $name already linked"
      else
        ln -sf "${dir%/}" "$dest"
        echo "✓ skill $name -> $dest (relinked)"
      fi
    elif [[ -e "$dest" ]]; then
      echo "✗ skill $name: $dest already exists and isn't a symlink — skipping. Remove it manually if you want install.sh to manage it."
    else
      ln -s "${dir%/}" "$dest"
      echo "✓ skill $name -> $dest"
    fi
  done
}

link_bin "$REPO_DIR/install-skill"
link_skills

if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo
  echo "Note: $BIN_DIR isn't on your PATH. Add this to your shell rc (~/.zshrc or ~/.bashrc):"
  echo "  export PATH=\"$BIN_DIR:\$PATH\""
fi
