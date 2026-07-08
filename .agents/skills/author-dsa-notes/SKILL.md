---
name: Author DSA Problem Notes
description: How to write problem notes for the DSA sheet, with multi-language solutions and per-language overrides
---

# Authoring DSA Problem Notes

## Quick Reference

Problem notes are Markdown files auto-discovered by Vite's `import.meta.glob`. Just drop a file in the matching step folder.

### File Location

```
client/src/data/resources/<NN-step-slug>/<url-friendly-title>.md
```

- Filename (without `.md`) must match `slugify(problem.title)` from `lib/slugify.js`
- Folder mirrors the sheet's logical step grouping (for human navigation only — lookup is by slug)
- Empty files (no frontmatter, no sections) show a "coming soon" state in the UI

### Frontmatter (all optional)

```yaml
---
time: O(n log n)
space: O(1)
slug: custom-slug-override
concepts:
  - Two pointers
  - Sliding window
tutorials:
  - dsa/dsa-big-o-notation | Big O Notation
---
```

### Sections (all optional, any order)

| Section         | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `## Overview`   | Problem description                                    |
| `## Approach`   | Strategy / algorithm explanation                       |
| `## Concepts`   | Bullet list of key concepts (supports inline markdown) |
| `## Complexity` | `Time: O(n)` / `Space: O(1)` format                    |
| `## Solution`   | Fenced code blocks per language                        |

### Multiple Solutions

Use labeled headings: `## Solution: Brute Force`, `## Solution: Optimized`. Each gets its own code fences and optional `Time:` / `Space:` lines.

### Per-Language Overrides

Append `(Language)` to any section heading (except Solution) to replace the generic version for that language: `## Approach (C++)`, `## Concepts (Python)`.

## Full Authoring Reference

Read `client/src/data/resources/AUTHORING.md` for the complete specification, including per-solution complexity, language aliases, inline formatting support, and a full example file.

## Key Rules

1. **No manual registration needed** — files are auto-discovered via `import.meta.glob`
2. **Slug must match** `slugify(problem.title)` — or use frontmatter `slug:` to override
3. **Four languages supported** in the solution selector: C++ (`cpp`), Java, Python, JavaScript
4. **Omitting a language** shows "not yet written" in the UI — this is fine, not an error
5. **Use only supported markdown syntax** — the renderer is shared with course lessons (`Markdown.jsx`)

## After Writing

1. Verify the note renders correctly: `npm run dev` → navigate to the problem page
2. Run client tests: `npm run test:client`
3. Run `client/src/data/problemResources.test.js` specifically to verify the note is discovered correctly
