# hacker-news-thread-summary

Writes a taude.xyz blog post from a Hacker News comments thread — the
thread's best-evidenced finding, synthesized and edited, not a list of
quoted comments.

## What it does

Given a `news.ycombinator.com/item` link (asks for one if not given), fetches
the thread, identifies its actual payoff (the fact that reframes the headline
claim, or the practical technique that emerged), drafts a post around that —
title, attribution line, opening hook, body organized by argument, closing
upshot — runs it through `economist-style`, and saves it into the Obsidian
vault's `ai-drafted/` folder as a `draft: true` note tagged `ai-drafted`.

This is a straight writing skill: the input is a thread link, the output is
an article about that thread's discussion. It has nothing to do with
Claude Code session activity — for a post recapping what got built in a
session, see `write-ai-slop-article` in the `taude.xyz` repo instead.

## When it triggers

"Summarize this HN thread", "write a post about this HN discussion",
`/hacker-news-thread-summary <url>`, or the request alone with no link yet
(the skill asks for one).

## Output

A new note at
`<vault>/1 Projects/taude.xyz Blog/ai-drafted/<Title>.md`, `draft: true`,
tagged `ai-drafted`. It does not publish anything — review the draft, flip
it to `draft: false`, and run the `taude.xyz` repo's `publish-taude-blog`
skill (or `./scripts/publish.sh`) when ready.

## Caveats

- Never writes `draft: false` itself — publishing is always a separate,
  explicit step.
- Saves into `ai-drafted/`, not `posts/` or `til/` — that's what routes it
  through `SECTION_MAP`'s `ai-drafted:posts` entry into `content/posts/` on
  the next sync (see `taude.xyz`'s `CLAUDE.md`).
- Depends on the `economist-style` skill for the editing pass.
