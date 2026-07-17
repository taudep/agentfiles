#!/usr/bin/env bash
# Install and configure the artifacts in this repo: puts install-skill on
# PATH, and wires up the session-resume hooks in ~/.claude/settings.json.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"

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

link_claude_hook() {
  local src="$1"
  local name
  name="$(basename "$src")"
  local dest_dir="$CLAUDE_DIR/hooks"
  local dest="$dest_dir/$name"

  mkdir -p "$dest_dir"

  if [[ -e "$dest" && ! -L "$dest" ]]; then
    echo "✗ $name: $dest already exists and isn't a symlink — skipping. Remove it manually if you want install.sh to manage it."
    return
  fi

  ln -sf "$src" "$dest"
  echo "✓ $name -> $dest"
}

# Merges one event's hook entries from hooks/settings.json into
# ~/.claude/settings.json, skipping entries that are already present
# (exact match) so re-running install.sh doesn't create duplicates.
merge_hook_event() {
  local event="$1" settings_file="$2" fragment="$3"
  local new_arr tmp
  new_arr="$(jq -c --arg e "$event" '.[$e] // []' "$fragment")"
  tmp="$(mktemp)"
  jq --arg event "$event" --argjson new "$new_arr" '
    (.hooks[$event] // []) as $existing
    | .hooks[$event] = ($existing + [$new[] | select(. as $item | ($existing | index($item)) == null)])
  ' "$settings_file" > "$tmp" && mv "$tmp" "$settings_file"
}

merge_claude_hooks_settings() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "✗ jq not found — skipping session-resume hook setup in $CLAUDE_DIR/settings.json. Install jq and re-run to enable it."
    return
  fi

  local settings_file="$CLAUDE_DIR/settings.json"
  local fragment="$REPO_DIR/hooks/settings.json"
  mkdir -p "$CLAUDE_DIR"
  [[ -f "$settings_file" ]] || echo '{}' > "$settings_file"

  local before after
  before="$(cat "$settings_file")"
  merge_hook_event "SessionEnd" "$settings_file" "$fragment"
  merge_hook_event "SessionStart" "$settings_file" "$fragment"
  after="$(cat "$settings_file")"

  if [[ "$before" == "$after" ]]; then
    echo "✓ session-resume hooks already present in $settings_file"
  else
    echo "✓ session-resume hooks added to $settings_file"
  fi
}

link_bin "$REPO_DIR/install-skill"

link_claude_hook "$REPO_DIR/hooks/session-end-resume.sh"
link_claude_hook "$REPO_DIR/hooks/session-start-resume.sh"
merge_claude_hooks_settings

if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo
  echo "Note: $BIN_DIR isn't on your PATH. Add this to your shell rc (~/.zshrc or ~/.bashrc):"
  echo "  export PATH=\"$BIN_DIR:\$PATH\""
fi
