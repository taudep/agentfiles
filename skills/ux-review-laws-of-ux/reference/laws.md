# Laws of UX: reference

All 30 laws from [lawsofux.com](https://lawsofux.com/) by Jon Yablonski, summarized and grouped into the seven review lenses used by `SKILL.md`. Each entry gives the law, what to **check** in a design, the **red flags** that signal a violation, and a link to the source page. The site tags each law as *Theory* or *Psychology*; that tag is shown in brackets.

---

## Lens 1: Familiarity

### Jakob's Law [Theory]
Users spend most of their time on *other* sites, so they expect yours to work the same way.
- **Check:** Standard tasks (login, search, nav, cart, settings, forms) use the conventional pattern and placement. Redesigns offer a transition path.
- **Red flags:** Logo that isn't a home link; nav in an unusual place; custom controls replacing native ones (fake dropdowns, unusual scroll); icons used against convention (a gear that isn't settings).
- **Fix pattern:** Adopt the common pattern. Save novelty for the product's actual differentiator.
- Source: https://lawsofux.com/jakobs-law/ (Jakob Nielsen)

### Mental Model [Psychology]
A compressed model of what we *think* we know about how a system works.
- **Check:** Labels, grouping, and flows match the user's vocabulary and expectations of the domain, not the system's internal structure (database tables, team org chart, API names).
- **Red flags:** Internal jargon or entity names in the UI; navigation that mirrors the backend; actions whose results surprise (e.g. "Archive" deletes).
- **Fix pattern:** Rename and regroup by user tasks. Use consistent, familiar patterns, such as cards and checkout steps.
- Source: https://lawsofux.com/mental-model/ (Kenneth Craik, 1943)

### Paradox of the Active User [Theory]
Users never read manuals; they start using the software immediately.
- **Check:** The design is usable without reading anything first. Help is contextual (tooltips, inline hints, empty states), not a wall of upfront instructions.
- **Red flags:** Mandatory multi-screen tours; essential info only in docs or a help page; instructions paragraphs above a form; features only discoverable via a manual.
- **Fix pattern:** Move guidance to the point of need: inline hints, smart defaults, empty-state prompts.
- Source: https://lawsofux.com/paradox-of-the-active-user/ (Rosson & Carroll, 1987)

---

## Lens 2: Decisions & complexity

### Hick's Law [Theory]
Decision time increases with the number and complexity of choices.
- **Check:** Screens where speed matters keep choices minimal. Complex tasks are split into steps. A recommended or default option is highlighted. New users see features progressively.
- **Red flags:** Long flat menus; many equal-weight buttons; all settings on one screen; no default selection.
- **Caveat:** Don't simplify to the point of abstraction, such as icon-only nav with no labels.
- Source: https://lawsofux.com/hicks-law/ (Hick & Hyman, 1952)

### Choice Overload [Theory]
People feel overwhelmed when presented with too many options (the "paradox of choice").
- **Check:** Option sets are curated. Comparable options (pricing tiers, plans) can be compared side by side. Search and filtering appear early for large catalogs.
- **Red flags:** More than ~5 plans or tiers; product grids without filters; comparison requiring flipping between pages.
- **Fix pattern:** Feature a few items, add a comparison table, and surface search and filters up front.
- Source: https://lawsofux.com/choice-overload/ (Alvin Toffler, 1970)

### Occam's Razor [Theory]
Among equally good solutions, prefer the one with the fewest assumptions.
- **Check:** Every element earns its place. Try removing each element: does the core function survive?
- **Red flags:** Decorative elements that compete with content; redundant controls (two ways to do the same thing on one screen); duplicated labels and headings; unnecessary confirmation steps.
- **Fix pattern:** Remove elements until removing more would break the function.
- Source: https://lawsofux.com/occams-razor/ (William of Ockham)

### Tesler's Law [Theory]
Every system has irreducible complexity. Either the system or the user must handle it. (Law of Conservation of Complexity.)
- **Check:** The system absorbs complexity: smart defaults, auto-detection, autofill, inferred values. Simplifications don't just hide work the user must now do manually.
- **Red flags:** Users must type data the system already knows; format requirements put on the user (e.g. "enter date as YYYY-MM-DD"); a minimalist UI that needs expert knowledge to operate.
- **Fix pattern:** Move the work into the system. Design for real, irrational users, not idealized ones.
- Source: https://lawsofux.com/teslers-law/ (Larry Tesler, Xerox PARC)

### Pareto Principle [Theory]
Roughly 80% of effects come from 20% of causes.
- **Check:** The most-used 20% of features get the prime real estate and the most polish. Rare actions are reachable but secondary.
- **Red flags:** Rarely-used features given equal prominence to core actions; the primary task buried below the fold or in a menu.
- **Fix pattern:** Rank features by usage or importance and allocate space and effort to match.
- Source: https://lawsofux.com/pareto-principle/ (Vilfredo Pareto)

---

## Lens 3: Memory & load

### Cognitive Load [Psychology]
The mental resources needed to understand and use an interface. *Intrinsic* load is inherent to the task. *Extraneous* load comes from the design itself.
- **Check:** Extraneous load is minimal: no distracting animation, no ornamental clutter, no decoding of ambiguous icons, and consistent placement across screens.
- **Red flags:** Dense screens with many competing elements; inconsistent layouts between similar pages; unlabeled icons; dense jargon.
- **Fix pattern:** Strip non-essential elements and make similar things look and behave the same.
- Source: https://lawsofux.com/cognitive-load/ (John Sweller, 1980s)

### Miller's Law [Theory]
The average person can keep about 7 (±2) items in working memory.
- **Check:** Long content is chunked into small, meaningful groups.
- **Red flags:** Long unbroken lists or numbers (phone, account, card numbers unformatted).
- **Caveat:** **Do not** use "7" as an arbitrary hard limit on menu items, tabs, etc. The law argues for chunking, not for a cap. Capacity varies with person and context.
- Source: https://lawsofux.com/millers-law/ (George Miller, 1956)

### Working Memory [Psychology]
A temporary store for information needed to complete a task. It holds about 4–7 chunks, which fade in roughly 20–30 seconds.
- **Check:** Users never have to remember information from one screen to use on another. Recognition beats recall: visited links are styled, breadcrumbs exist, previously entered values are shown.
- **Red flags:** Comparisons that require remembering values across pages; codes shown on one step and needed on the next; forms that clear on error; no indication of visited items.
- **Fix pattern:** Carry critical info forward (comparison tables, summaries, persistent selections). Put the memory burden on the system.
- Source: https://lawsofux.com/working-memory/

### Chunking [Psychology]
Breaking information into meaningful groups.
- **Check:** Content is grouped into visually distinct modules with clear hierarchy, so users can scan to their goal.
- **Red flags:** Walls of text; long forms without sections; data tables without grouping; formatted strings left unformatted (e.g. `5551234567` instead of `555-123-4567`).
- **Fix pattern:** Add headings, sections, separators, and grouping. Format numbers in standard chunks.
- Source: https://lawsofux.com/chunking/ (George Miller, 1956)

---

## Lens 4: Visual grouping (Gestalt)

### Law of Proximity [Theory]
Objects near each other are perceived as a group.
- **Check:** Spacing *within* a group is clearly smaller than spacing *between* groups. Labels sit closer to their own field than to neighbors.
- **Red flags:** Uniform spacing everywhere, so nothing groups; a form label equidistant between two inputs; a button closer to an unrelated section than to the one it acts on.
- **Fix pattern:** Tighten intra-group spacing and widen inter-group spacing (e.g. 8px vs 24px+).
- Source: https://lawsofux.com/law-of-proximity/ (Gestalt)

### Law of Similarity [Theory]
Elements that look similar are perceived as related, even when separated.
- **Check:** Things that behave alike look alike (all links one style, all primary buttons one style). Things that behave differently look different. Links are distinct from plain text.
- **Red flags:** Clickable and non-clickable elements styled identically; the same color used for both "danger" and "brand"; inconsistent button styles for the same action type.
- **Fix pattern:** Define one visual treatment per role (color, shape, size, weight) and apply it consistently.
- Source: https://lawsofux.com/law-of-similarity/ (Gestalt)

### Law of Common Region [Theory]
Elements sharing a clearly bounded area are perceived as a group.
- **Check:** Related content shares a card, panel, border, or background. Boundaries match real relationships.
- **Red flags:** Unrelated items inside the same card; related items split across containers; nested boxes-in-boxes with no clear meaning.
- **Fix pattern:** Use a border or background to bound each group. Remove containers that don't represent a group.
- Source: https://lawsofux.com/law-of-common-region/ (Gestalt)

### Law of Uniform Connectedness [Theory]
Visually connected elements are perceived as more related than unconnected ones.
- **Check:** Steps, sequences, and relationships use connectors (lines, arrows, shared frames, shared color) where order or linkage matters.
- **Red flags:** Multi-step processes shown as disconnected items; connector lines that link unrelated things; a stepper whose steps don't visibly connect.
- **Fix pattern:** Connect related items with lines, frames, or color. Remove spurious connectors.
- Source: https://lawsofux.com/law-of-uniform-connectedness/ (Gestalt)

### Law of Prägnanz [Theory]
People interpret ambiguous or complex images in the simplest form possible.
- **Check:** Icons, illustrations, and layouts read as simple, unambiguous shapes. Complex visuals have one clear interpretation.
- **Red flags:** Detailed icons that are unclear at small sizes; busy charts; layouts with no clear overall shape; ambiguous overlapping shapes.
- **Fix pattern:** Simplify icons and visuals to their essential forms and align the layout to a clear grid.
- Source: https://lawsofux.com/law-of-pr%C3%A4gnanz/ (Max Wertheimer)

---

## Lens 5: Attention & emphasis

### Von Restorff Effect [Theory]
When multiple similar objects are present, the one that differs is most likely to be remembered. (Isolation Effect.)
- **Check:** The single most important action or info on the screen is visually distinct. Emphasis is rare enough to work. Contrast does not depend on color alone. Motion respects `prefers-reduced-motion`.
- **Red flags:** Multiple filled "primary" buttons competing; everything bold or highlighted; status shown by color alone (red/green with no icon or text); highlighted elements that look like ads; gratuitous animation.
- **Fix pattern:** One primary action per view. Pair color with icon, shape, or text. Use motion sparingly.
- Source: https://lawsofux.com/von-restorff-effect/ (Hedwig von Restorff, 1933)

### Selective Attention [Psychology]
People focus on the subset of stimuli tied to their goals and filter out the rest.
- **Check:** Important content doesn't look like an ad (banner blindness) or sit in ad-like positions. Significant state changes have strong cues (change blindness).
- **Red flags:** Key info in a banner-style box at the top or the right rail; a success or error message appearing far from where the user is looking; silent updates to content; multiple simultaneous changes competing.
- **Fix pattern:** Place feedback at the point of action. Don't style real content like ads. Announce changes clearly, including via ARIA live regions.
- Source: https://lawsofux.com/selective-attention/ (Broadbent, Cherry, Treisman)

### Serial Position Effect [Theory]
Users best remember the first and last items in a series (primacy and recency).
- **Check:** The most important items sit at the start and end of lists and nav bars. The least important sit in the middle.
- **Red flags:** The key nav item buried mid-list; the primary CTA in the middle of a row of actions; the most important point in the middle of a long list.
- **Fix pattern:** Put key items first and last.
- Source: https://lawsofux.com/serial-position-effect/ (Hermann Ebbinghaus)

### Aesthetic-Usability Effect [Theory]
Users perceive attractive designs as more usable, and tolerate minor issues in them.
- **Check:** Attractive visuals actually support the task. **As a reviewer**, judge usability on its own, because polish masks problems in testing too.
- **Red flags:** Gorgeous UI with low-contrast text; decorative gradients or images hurting legibility; a reviewer (you) praising the look and skipping the task walk-through.
- **Fix pattern:** Keep the aesthetic, fix the usability underneath, and verify contrast (WCAG AA 4.5:1 for body text).
- Source: https://lawsofux.com/aesthetic-usability-effect/ (Kurosu & Kashimura, 1995)

---

## Lens 6: Interaction & responsiveness

### Fitts's Law [Theory]
The time to acquire a target is a function of its distance and size.
- **Check:** Touch targets are large (≥44×44 px, per Apple; ≥48×48 dp, per Material) with enough spacing. Frequent actions sit near where the user's pointer or thumb already is. The whole row or card is clickable where the user expects it.
- **Red flags:** Tiny icon buttons; links-as-text with small hit areas; destructive and primary buttons crammed together; key actions far from the related content; only the text of a list row is clickable.
- **Fix pattern:** Enlarge hit areas (padding, not just visuals), add spacing, and move actions closer to where they're needed.
- Source: https://lawsofux.com/fittss-law/ (Paul Fitts, 1954)

### Doherty Threshold [Theory]
Productivity soars when the system responds in under 400ms.
- **Check:** Every action gives visible feedback within 400ms (pressed state, spinner, optimistic update). Longer waits show progress, skeleton screens, or animation.
- **Red flags:** Buttons with no pressed or loading state; blank screens while loading; double-submit possible because nothing happened visibly; long operations with no progress indicator.
- **Fix pattern:** Use optimistic UI, skeletons, and progress bars, which help even when imprecise. A deliberate delay can signal value or build trust for "thinking" operations.
- Source: https://lawsofux.com/doherty-threshold/ (Doherty & Thadani, IBM, 1982)

### Postel's Law [Theory]
Be liberal in what you accept, and conservative in what you send.
- **Check:** Inputs accept varied formats (phone with or without dashes, dates in several forms, trimmed whitespace, case-insensitive email) and normalize them. Output is consistent and predictable. Errors are clear and specific.
- **Red flags:** Validation rejecting spaces or dashes in phone or card numbers; case-sensitive fields that shouldn't be; vague "Invalid input" errors; layouts that break on long names, translations, or zoom.
- **Fix pattern:** Accept variants, normalize behind the scenes, set clear boundaries, and give specific feedback.
- Source: https://lawsofux.com/postels-law/ (Jon Postel, TCP robustness principle)

---

## Lens 7: Motivation & experience

### Goal-Gradient Effect [Theory]
The tendency to approach a goal increases with proximity to the goal.
- **Check:** Multi-step tasks show clear progress ("Step 2 of 4", a progress bar). Users start with some progress where honest (e.g. "profile 20% complete" after signup).
- **Red flags:** Multi-step wizards with no indicator of how many steps remain; progress that resets; long forms with no sense of length.
- **Fix pattern:** Add a stepper or progress bar and front-load easy steps.
- Source: https://lawsofux.com/goal-gradient-effect/ (Clark Hull, 1932)

### Zeigarnik Effect [Theory]
People remember uncompleted or interrupted tasks better than completed ones.
- **Check:** Incomplete states are visible and resumable (drafts, checklists, "continue where you left off"). There are signifiers of more content (partial cards at the scroll edge, "see more").
- **Red flags:** Abandoned progress silently lost; onboarding checklists that vanish; no cue that content continues below or beside.
- **Fix pattern:** Persist drafts, show completion checklists, and use visible cues for more content.
- Source: https://lawsofux.com/zeigarnik-effect/ (Bluma Zeigarnik, 1920s)

### Peak-End Rule [Theory]
People judge an experience by its most intense moment and its end, not the average.
- **Check:** The emotional peak (the moment of value) and the ending (confirmation, success, completion) are designed with care. Negative peaks such as errors, failures, and waits are softened.
- **Red flags:** A bare "Success" text after a long flow; hostile or blaming error messages; flows ending on an upsell or a dead end; no confirmation at the end.
- **Fix pattern:** Design a satisfying end state with a clear next step. Make error states helpful and kind.
- Source: https://lawsofux.com/peak-end-rule/ (Kahneman et al., 1993)

### Flow [Psychology]
A state of energized focus and full involvement in an activity.
- **Check:** Challenge matches user skill. Feedback confirms actions and progress. There is no unnecessary friction (interruptions, modals, forced context switches).
- **Red flags:** Pop-ups interrupting a task; features hidden so deep that users stall; expert users forced through novice hand-holding, or novices dropped into expert UI.
- **Fix pattern:** Remove interruptions, provide immediate feedback, and offer progressive disclosure for expert features.
- Source: https://lawsofux.com/flow/ (Mihály Csíkszentmihályi, 1975)

### Parkinson's Law [Theory]
Any task will inflate until all of the available time is spent.
- **Check:** Tasks take no longer than users expect, and ideally less. Autofill, saved info, and defaults shorten forms.
- **Red flags:** Asking for info the system has or doesn't need; no autofill (`autocomplete` attributes missing); optional fields mixed in with required ones with no distinction.
- **Fix pattern:** Cut fields, enable browser autofill, prefill known values, and mark optional fields.
- Source: https://lawsofux.com/parkinsons-law/ (C. Northcote Parkinson, 1955)

---

## Reviewer check

### Cognitive Bias [Psychology]
A systematic error in thinking or judgment that shapes perception and decisions.
- **Check (on yourself):** Confirmation bias is the risk when reviewing a design you or Claude produced. Look actively for what's missing (empty, error, and loading states; mobile; keyboard and screen-reader use; long content).
- **Check (in the design):** Defaults and framing don't exploit bias manipulatively (dark patterns such as pre-checked upsells, confirmshaming, or fake urgency).
- **Fix pattern:** Before finalizing, list three ways the design could fail a real user, then check each.
- Source: https://lawsofux.com/cognitive-bias/ (Tversky & Kahneman, 1972)
