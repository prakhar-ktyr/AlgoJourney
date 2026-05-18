# DSA Problem Notes — Authoring Guide

Problem notes live as `.md` files under `client/src/data/resources/<step-folder>/`. They are **picked up automatically** via Vite's `import.meta.glob` — just drop a file into the right folder and it will appear on the corresponding problem page.

---

## File Location & Naming

```
client/src/data/resources/<NN-step-slug>/<url-friendly-title>.md
```

Examples:

```
resources/01-learn-the-basics/user-input-output.md
resources/03-solve-problems-on-arrays-easy-medium-hard/trapping-rain-water.md
```

- The **folder** mirrors the sheet's logical step grouping (purely for human navigation — lookup is by slug only).
- The **filename** (without `.md`) is the slug. It must match `slugify(problem.title)` from `lib/slugify.js`, which is also what the routing layer uses.
- A frontmatter `slug:` field can override the filename-derived slug if a title ever needs to change without renaming the file.
- **Empty placeholder files** (no frontmatter, no sections) are treated as "not yet authored" — the UI shows a "coming soon" state rather than a blank page.

---

## Frontmatter

YAML frontmatter at the top of the file. All fields are **optional**.

```yaml
---
time: O(n log n)
space: O(1)
slug: custom-slug-override
concepts:
  - Two pointers
  - Sliding window
tutorials:
  - dsa/dsa-big-o-notation
  - dsa/dsa-time-complexity | Time Complexity
---
```

| Field       | Type   | Description                                                                                                                                                                                                             |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `time`      | String | Default time complexity (e.g. `O(n log n)`)                                                                                                                                                                             |
| `space`     | String | Default space complexity (e.g. `O(1)`)                                                                                                                                                                                  |
| `slug`      | String | Override the slug derived from the filename                                                                                                                                                                             |
| `concepts`  | List   | Fallback concept list when no `## Concepts` section exists in the body. **Inline markdown is not supported** in frontmatter bullets — use a `## Concepts` section in the body instead if you need bold/code formatting. |
| `tutorials` | List   | Links to tutorial lessons. Format: `course-slug/lesson-slug`. Optionally append `                                                                                                                                       | Custom Label` for a display name override. |

---

## Sections

All sections are optional. Order does not matter. The parser splits on `## ` headings.

| Section         | Purpose                                   |
| --------------- | ----------------------------------------- |
| `## Overview`   | Introductory prose describing the problem |
| `## Approach`   | Strategy / algorithm explanation          |
| `## Concepts`   | Markdown bullet list of key concepts      |
| `## Complexity` | Time/Space complexity (see format below)  |
| `## Solution`   | Fenced code blocks, one per language      |

Any section may also contain arbitrary prose and code blocks — everything is rendered via the shared Markdown component used by tutorial lessons, so problem notes support the same core rich-text features such as paragraphs, lists, inline code, bold text, KaTeX math, and fenced blocks.

---

## Solution Code Blocks

Place fenced code blocks inside `## Solution`, tagged with the language:

````markdown
## Solution

```cpp
// C++ reference solution
```

```java
// Java reference solution
```

```python
# Python reference solution
```

```javascript
// JavaScript reference solution
```
````

### Supported Languages

| Canonical  | Aliases accepted    |
| ---------- | ------------------- |
| C++        | `cpp`, `c++`, `cxx` |
| Java       | `java`              |
| Python     | `python`, `py`      |
| JavaScript | `javascript`, `js`  |

Only these four languages appear in the language selector dropdown.

- **Omitting a language** causes the UI to show "A \<lang\> solution hasn't been written yet."
- **Omitting `## Solution` entirely** (or including no code fences) hides the Solution heading completely — no fallback message is shown.

---

## Multiple Solutions (Alternate Approaches)

You can author more than one `## Solution` section per problem. Add a label after `Solution` (separated by `:`, `-`, or whitespace) to title each approach:

````markdown
## Solution: Brute Force

```cpp
// O(n^2) version
```

## Solution: Optimized

```cpp
// O(n log n) version
```
````

- Untitled `## Solution` headings get auto-numbered ("Approach 1", "Approach 2", …) when more than one is present.
- A single untitled `## Solution` renders exactly as before — no subheading.
- Each solution section parses its own code fences per language. A solution that lacks code for the currently-selected language shows a small "not written yet" note inline so other approaches stay visible.

### Per-Solution Complexity

Add `Time:` / `Space:` lines at the very top of a `## Solution` body, before the first code fence:

````markdown
## Solution: Brute Force

Time: O(n^2)
Space: O(1)

```cpp
// ...
```
````

They render as a small caption under the approach heading. If **every** solution declares its own complexity, the top-level Complexity section is hidden to avoid duplication. Mixing — some solutions with their own complexity, others without — keeps the global section visible as the default for the unannotated ones.

---

## Complexity Section

The standalone `## Complexity` section uses this format:

```markdown
## Complexity

Time: O(n)
Space: O(1)

Optional explanation shown below the summary.
```

Frontmatter `time` / `space` fields are the simpler alternative; use the section form when you need a per-language override or when you want to add a language-agnostic explanation, proof, or intuition beneath the complexity summary. Any prose after the leading `Time:` / `Space:` lines is rendered below them.

---

## Per-Language Overrides

Append a language name in parentheses to **any** section heading to make that section appear **only** when the matching language is selected in the dropdown. The generic version (no suffix) is always the fallback.

**Supported on:** Overview, Approach, Concepts, Complexity.
**Not supported on:** Solution (language selection there is handled by the code fence tag).

```markdown
## Overview

Generic overview shown for all languages.

## Overview (Java)

Replaces the generic Overview when Java is selected.

## Approach

Generic approach.

## Approach (C++)

Replaces the generic Approach when C++ is selected.

## Approach (Python)

Replaces the generic Approach when Python is selected.

## Concepts (C++)

- **`cin`:** reads from standard input — `cin >> A >> B;`
- **`cout`:** writes to standard output — `cout << result;`

## Complexity (Python)

Time: O(1)
Space: O(1)
```

Language names are case-insensitive and accept the same aliases as code fences (`cpp`, `c++`, `py`, `js`, etc.).

The per-language section **completely replaces** the generic one for that language — there is no merging. If you want to extend the default, copy the default text into the override and add to it.

---

## Inline Markdown

The following inline formatting is supported in Overview, Approach, and Concepts sections:

```markdown
**bold text**
_italic text_ or _italic text_
`inline code`
**`bold + inline code`** ← nesting is supported
**`fn()` (label):** ← bold wrapping code + plain text
Inline math: $O(\log n)$
Block math: $$a = qb + r$$
```

Headings inside sections (e.g. `### Sub-heading`) are also supported.

Fenced code blocks inside prose sections (e.g. inside `## Approach`) render as styled code components but are **not** selectable by the language dropdown — they are static illustrations embedded in the explanation text.

### Collapsible Details Blocks

Use `:::details` when you want to tuck away a derivation, proof, or optional deep-dive without breaking the main flow:

````markdown
:::details Why is this $O(\log n)$?
Extra explanation, lists, code, and math all work here.

$$T(n) = T(n/2) + O(1)$$
:::
````

---

## Complete Example

````markdown
---
time: O(1)
space: O(1)
tutorials:
  - dsa/dsa-big-o-notation | Big O Notation
---

## Overview

Multiply two integers **A** and **B** and return the result.

## Overview (Java)

Given a String `S` and an Integer `N`, print them in a specific format.

## Approach

Apply the `*` operator directly. Maximum product is 100,000,000,
which fits in a 32-bit signed integer.

## Approach (C++)

In C++, we use the `<iostream>` library:

- **Input:** `cin` with the extraction operator `>>`
- **Output:** `cout` with the insertion operator `<<`

## Approach (Python)

Python's `int` is arbitrary-precision, so overflow is not a concern.
Just return `A * B`.

## Concepts

- **Variables:** named containers for values
- **Return statement:** sends the result back to the caller

## Concepts (C++)

- **`cin`:** reads from standard input — `cin >> A >> B;`
- **`cout`:** writes to standard output — `cout << result;`
- **`#include <iostream>`:** required header for cin/cout

## Complexity (Python)

Time: O(1)
Space: O(1)

## Solution

```cpp
int solve(int A, int B) { return A * B; }
```
````

```python
def solve(A, B): return A * B
```

```

```
