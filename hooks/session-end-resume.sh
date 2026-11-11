#!/usr/bin/env bash
# SessionEnd hook: records the command to resume this session, keyed by the
# session's working directory. The pointer lives in ~/.claude/resume/ (not in
# the project folder) so it never shows up as an uncommitted file in a repo
# or worktree.
#
# Interim: taude's phase 2 session tracking will replace these resume hooks;
# remove them from agentfiles when it ships.
input=$(cat)
dir=$(echo "$input" | jq -r '.cwd')
id=$(echo "$input" | jq -r '.session_id')
[ -n "$dir" ] && [ -n "$id" ] && [ "$id" != "null" ] || exit 0
store="$HOME/.claude/resume"
mkdir -p "$store"
key=$(echo "$dir" | sed 's#[/.]#-#g')
echo "claude --resume $id" > "$store/$key"
