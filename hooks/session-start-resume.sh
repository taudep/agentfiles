#!/usr/bin/env bash
# SessionStart hook (matcher: startup): if the launch directory has a
# .claude-resume file left by session-end-resume.sh, look up that session's
# transcript for a title/last-prompt summary and hand it to Claude as
# additionalContext so it can offer to resume the old session.
input=$(cat)
src=$(echo "$input" | jq -r '.source')
dir=$(echo "$input" | jq -r '.cwd')
resume_file="$dir/.claude-resume"

[ "$src" = "startup" ] || exit 0
[ -f "$resume_file" ] || exit 0

cmd=$(cat "$resume_file")
sid=$(echo "$cmd" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
proj=$(echo "$dir" | sed 's#/#-#g')
transcript="$HOME/.claude/projects/$proj/$sid.jsonl"

title=""
lastprompt=""
if [ -f "$transcript" ]; then
  title=$(jq -rs '[.[] | select(.type=="ai-title")] | last | .aiTitle // empty' "$transcript" 2>/dev/null)
  lastprompt=$(jq -rs '[.[] | select(.type=="last-prompt")] | last | .lastPrompt // empty' "$transcript" 2>/dev/null)
fi

context="A previous Claude Code session for this directory was left open and can be resumed.
Resume command: $cmd"
[ -n "$title" ] && context="$context
Session title: $title"
[ -n "$lastprompt" ] && context="$context
Last thing discussed: $lastprompt"
context="$context

At the start of this conversation, tell the user about this resumable session (title and last topic) and ask if they'd like to exit and resume it instead of continuing fresh here."

jq -n --arg ctx "$context" '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $ctx}}'
