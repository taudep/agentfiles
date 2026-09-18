---
name: hacker-news-thread-summary
description: Use when the user wants a taude.xyz blog post written from a Hacker News comment thread — e.g. "summarize this HN thread", "write a post about this HN discussion", "/hacker-news-thread-summary <url>". Triggers on a news.ycombinator.com/item link paired with a request to write it up, or the request alone with no link yet given.
---

# Hacker News Thread Summary

Turns a Hacker News comments thread into a taude.xyz post: the thread's
best-evidenced finding, not a chronological list of comments.

## Steps

1. **Get the link.** If not given, ask for it before doing anything else —
   don't guess or search for "the" relevant thread.
2. **Fetch the thread.** `WebFetch` the `news.ycombinator.com/item?id=...`
   URL, prompting for the top-level comments and notable replies with each
   commenter's argument in detail. If the thread is deep or a competing
   viewpoint seems under-sampled, also fetch
   `https://hn.algolia.com/api/v1/items/<id>` (full comment tree as JSON)
   and re-read from that.
3. **Find the real finding.** Don't aggregate comments as a listicle.
   Identify the thread's actual payoff — the fact that reframes the
   headline claim, the debate's real resolution, or the practical technique
   that emerged from it.
4. **Draft the post**, modeled on this structure (see
   `reference/example-skip-ollama.md` for a full worked example):
   - **Title**: a concrete claim or action, not "HN discusses X".
   - Attribution line under the title:
     `*Prompted by an HN thread: [<thread title>](<url>)*`
   - **Opening paragraph**: the sharpest concrete fact from the thread,
     then the more useful finding underneath it.
   - **Body**: organized by argument structure (case-for/case-against, a
     comparison table, a how-to) — never by comment chronology. Attribute
     specific claims to commenters only where it adds credibility, not on
     every sentence.
   - **Closing**: one paragraph on the upshot — what to actually believe
     or do now.
5. **Edit pass.** **REQUIRED SUB-SKILL:** run the draft through
   `economist-style` before saving — clarity, precision, brevity.
6. **Save to the vault** at
   `~/Library/Mobile Documents/com~apple~CloudDocs/Todd's Obsidian Vault/1 Projects/taude.xyz Blog/ai-drafted/<Title>.md`
   (title used verbatim as the filename), with frontmatter:
   ```yaml
   ---
   title: <Title>
   date: <today, YYYY-MM-DD>
   draft: true
   tags:
     - ai-drafted
   ---
   ```
   Write real values directly — never leave literal `<% tp.... %>`
   Templater syntax in the file; this note isn't created through Obsidian's
   template flow, so there's nothing to evaluate it.
7. **Report back**: where the file landed, and that it's still `draft:
   true` — the user reviews and flips it to `false`, then runs
   `publish-taude-blog` (or the taude.xyz repo's own publish flow) when
   ready. Don't publish it yourself.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Listing comments in thread order | Organize by argument, not chronology |
| Skipping the economist-style pass | Always run it before saving |
| Saving with `draft: false` | Always `draft: true` — publishing is the user's call |
| Guessing the thread when no link given | Ask first |
| Writing to `posts/` or `til/` directly | Always `ai-drafted/` — that's what tags it `ai-drafted` and routes it to `content/posts/` on sync |
