---
name: ux-review-laws-of-ux
description: Use when reviewing, critiquing, or auditing a UI or UX design — an HTML/React artifact, a prototype, a screenshot, a mockup, a Figma frame, or a page Claude just built — or when asked "is this design usable?", "review my UX", "what would a UX designer say about this?", or to check a design against UX laws, heuristics, Gestalt principles, cognitive load, Fitts's law, or Hick's law.
---

# UX Review: Laws of UX

Review a design against the 30 laws catalogued at [lawsofux.com](https://lawsofux.com/) (Jon Yablonski). Every finding must name the law it rests on, point at a concrete element, and propose a concrete fix. A finding that cites no law, or a law that points at nothing, is not a finding.

## Inputs

- **Code (HTML/JSX/CSS):** read it and, if you can, render it (screenshot at desktop and ~375px mobile width). Hit-target sizes, spacing, and visual grouping are often invisible in source. If you can't render, review from source, mark estimates as estimated (e.g. contrast ratios), and list the visual checks under "Not checked".
- **Image/screenshot/Figma:** review what is visible, and say which checks you could not make, such as interaction states, latency, or the flow beyond this screen.
- **Unknown context:** infer the primary user and their main task from the design itself and state that assumption at the top of the review. Ask only if the purpose is truly unclear.

## Review workflow

1. **Name the primary task.** What is the user here to do? Judge every law against that task, not in the abstract.
2. **Walk the seven lenses below in order.** For each lens, check the listed laws. Load `reference/laws.md` for the specific checks and red flags of any law you cite or are unsure about.
3. **Check your own bias** (Cognitive Bias): you, or another Claude, may have built this design. Privately list three ways it could fail a real user (missing fields, states, or flows; mobile; keyboard and screen-reader use; long content) and check each one. Report what you find as normal findings. Don't let polish (Aesthetic-Usability Effect) stand in for usability.
4. **Rank findings** by impact on the primary task: **High** (blocks or misleads the task), **Medium** (slows it or adds errors), **Low** (polish, consistency). Sort the table High → Low.
5. **Pick the verdict:** any High → **rework**, if the Highs are structural, or **ship with fixes**, if each High is a local fix. Only Medium/Low → **ship with fixes**. Nothing above Low → **ship**.
6. **Write the report** in the output format below.

**Finding rules:**
- One row per problem. If one problem breaks several laws, list them all in the Law cell, separated by " / ", with the primary law first. Don't duplicate the row.
- A pure accessibility problem with no fitting law (missing label association, missing viewport meta, keyboard traps) goes in the table with Law = `Accessibility (WCAG)`. Don't stretch a law to cover it.

## Quick reference: seven lenses, 30 laws

| Lens | Laws | Core question |
|---|---|---|
| 1. Familiarity | Jakob's Law, Mental Model, Paradox of the Active User | Does it work the way users already expect, without needing instructions? |
| 2. Decisions & complexity | Hick's Law, Choice Overload, Occam's Razor, Tesler's Law, Pareto Principle | Are choices few, prioritized, and is complexity absorbed by the system? |
| 3. Memory & load | Cognitive Load, Miller's Law, Working Memory, Chunking | Must the user remember or decode anything the UI could show them? |
| 4. Visual grouping (Gestalt) | Law of Proximity, Law of Similarity, Law of Common Region, Law of Uniform Connectedness, Law of Prägnanz | Does visual structure match the real structure of the information? |
| 5. Attention & emphasis | Von Restorff Effect, Selective Attention, Serial Position Effect, Aesthetic-Usability Effect | Does the eye land on the right thing first, and is emphasis rare? |
| 6. Interaction & responsiveness | Fitts's Law, Doherty Threshold, Postel's Law | Are targets easy to hit, feedback fast (<400ms), and input forgiving? |
| 7. Motivation & experience | Goal-Gradient Effect, Zeigarnik Effect, Peak-End Rule, Flow, Parkinson's Law | Is progress visible, the end satisfying, and the effort matched to expectation? |
| Reviewer check | Cognitive Bias | Am I confirming the design instead of testing it? |

## Output format

```markdown
## UX review: <design name>

**Primary user & task (assumed):** <one line>
**Verdict:** <one sentence: ship / ship with fixes / rework, and the single biggest issue>

### Findings
| # | Severity | Law | Where | Problem | Fix |
|---|---|---|---|---|---|
| 1 | High | Hick's Law | Pricing page, plan selector | 6 plans with equal weight, no default | Show 3 plans; highlight "Recommended" |

### What works
- <law>: <specific element that applies it well> (0–5 bullets; write "Nothing notable" rather than inventing praise)

### Not checked
- <checks the input didn't allow, e.g. latency, hover states, flows beyond this screen>
```

If you made the design and are about to fix it, apply High findings first, then re-run lenses 4–6 on the result, where fixes most often cause new problems.

## Common mistakes

| Mistake | Correction |
|---|---|
| Citing "7±2" to demand a hard limit of 7 items | Miller's Law is not a design limit. Cite it only to argue for chunking. |
| Listing all 30 laws with a comment on each | Report only laws with a finding or a notable strength. Silence means it passed. |
| Vague fixes ("improve hierarchy") | Name the element and the change ("make 'Save' the only filled button"). |
| Praising visual polish as usability | Aesthetic-Usability Effect: polish hides problems. Judge the task, not the look. |
| Recommending novel patterns for standard tasks | Jakob's Law: use the conventional pattern for login, search, checkout, and navigation. |
| Simplifying by pushing work onto the user | Tesler's Law: complexity removed from the UI must go to the system, not the user. |
| Using color alone for emphasis or state | Von Restorff Effect plus accessibility: pair color with shape, text, or icon. |
| Ignoring mobile | Fitts's Law: check touch targets (≥44×44px) and thumb reach at phone width. |
