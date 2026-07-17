#!/usr/bin/env bash
# SessionEnd hook: writes .claude-resume in the session's working directory
# with the command to resume it.
input=$(cat)
dir=$(echo "$input" | jq -r '.cwd')
id=$(echo "$input" | jq -r '.session_id')
echo "claude --resume $id" > "$dir/.claude-resume"
