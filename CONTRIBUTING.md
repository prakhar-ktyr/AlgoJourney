# Contributing to AlgoJourney

First off, thank you for considering contributing to AlgoJourney!

## Table of Contents

- [General Contribution Guidelines](#general-contribution-guidelines)
- [Adding New Features](#adding-new-features)
- [Adding or Editing a Tutorial Lesson](#adding-or-editing-a-tutorial-lesson)
- [Adding Notes for the DSA Sheet](#adding-notes-for-the-dsa-sheet)

---

## General Contribution Guidelines

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies**: `npm run install:all`
3. **Make your changes**. Ensure you follow the project conventions (e.g. use ES Modules, Tailwind).
4. **Run tests**: `npm test`. Make sure everything passes.
5. **Lint and Format**: The pre-commit hooks will automatically format your code via Prettier and lint via ESLint.
6. **Submit a Pull Request**.

---

## Adding New Features

When adding a new feature, follow this checklist:

1. **Server route/model** — Add to `server/` and create tests in `server/__tests__/`
2. **Client component** — Add to `client/src/` and create a co-located `.test.jsx` file
3. **Documentation** — Update the relevant docs in the `docs/` folder.
4. **Verify** — Run `npm test` from root to ensure nothing is broken

---

## Adding or Editing a Tutorial Lesson

Tutorial lessons are Markdown files rendered by a custom Markdown component. The full authoring reference (every supported syntax feature, tips for authors, etc.) lives in [`client/src/data/courses/AUTHORING.md`](client/src/data/courses/AUTHORING.md). **Please read that file before writing your first lesson.** This section is a quickstart summary.

### File Location & Naming

```
client/src/data/courses/<course-slug>/<NN>-<lesson-slug>.md
```

- `<NN>`: Two-digit numeric prefix (01–99) controlling lesson order in the sidebar.
- `<lesson-slug>`: Appears in the URL path (`/tutorials/<course-slug>/<lesson-slug>`).
- The lowest-numbered lesson is the course landing page.

### Frontmatter

Every lesson must start with YAML frontmatter:

```yaml
---
title: Lesson Title
---
```

The `title` appears in the sidebar navigation, prev/next buttons, and the browser tab.

### Supported Markdown Features

| Feature            | Syntax                                                                    | Notes                                                      |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Headings           | `# H1` through `###### H6`                                                | Distinct styling per level                                 |
| Fenced code blocks | ` ```python `                                                             | Syntax highlighting via Shiki, copy button, language label |
| Lists              | `- item` or `1. item`                                                     | Unordered and ordered                                      |
| Task lists         | `- [x] Done` / `- [ ] Pending`                                            | Read-only styled checkboxes                                |
| GFM tables         | `\| col \| col \|`                                                        | Column alignment via `:---`, `:---:`, `---:`               |
| Blockquotes        | `> text`                                                                  | Styled with left border                                    |
| Alerts             | `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]` | Color-coded callout boxes                                  |
| Collapsible blocks | `:::details Summary text` … `:::`                                         | Collapsed by default, full markdown inside                 |
| Bold / Italic      | `**bold**` / `*italic*`                                                   | —                                                          |
| Inline code        | `` `code` ``                                                              | Rounded pill with monospace font                           |
| Math (KaTeX)       | `$inline$` / `$$block$$`                                                  | LaTeX rendering                                            |
| Links              | `[text](url)`                                                             | Internal = SPA nav, external = new tab                     |
| Tooltip terms      | `{{term\|\|definition}}`                                                  | Dotted underline, hover popover                            |

**Supported code highlighting languages:** `javascript`, `typescript`, `python`, `java`, `cpp`, `c`, `rust`, `go`, `html`, `css`, `json`, `bash`, `sql`, `markdown`, `yaml`, `toml`.

### Language-Specific Content (Multi-Language Courses)

Some courses (DSA, OOP, Discrete Mathematics, Testing & QA) show a language selector. You can make content adapt to the selected language:

**Language-tagged code fences** — only fences matching the selected language (or untagged fences) are shown:

````markdown
```cpp
std::cout << "Hello";
```

```python
print("Hello")
```
````

**Per-language section overrides** — append `(Language)` to a heading to replace the generic version when that language is selected:

```markdown
## Memory Model

Generic explanation shown for all languages.

## Memory Model (C++)

Replaces the generic "Memory Model" when C++ is selected.

## Memory Model (Python)

Replaces the generic "Memory Model" when Python is selected.
```

**Standalone language sections** — a heading tagged with a language that has no generic counterpart appears only for that language:

```markdown
## The GIL (Python)

Only visible when Python is selected.
```

---

## Adding Notes for the DSA Sheet

DSA Sheet problem notes are Markdown files with a specialized structure for multi-language solutions and per-language content overrides. The full authoring reference (every frontmatter field, section type, per-language overrides, multiple solutions, etc.) lives in [`client/src/data/resources/AUTHORING.md`](client/src/data/resources/AUTHORING.md). **Please read that file before writing your first note.** This section is a quickstart summary.

### File Location & Naming

```
client/src/data/resources/<NN-step-slug>/<url-friendly-title>.md
```

The filename (without `.md`) is the slug and must match `slugify(problem.title)`. Files are picked up automatically — just drop one into the matching step folder.

### Quickstart Template

```yaml
---
time: O(n)
space: O(1)
concepts:
  - Two pointers
  - Sliding window
---
```

### Sections (all optional)

| Section         | Purpose                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| `## Overview`   | Introductory prose describing the problem                                       |
| `## Approach`   | Strategy / algorithm explanation                                                |
| `## Concepts`   | Bullet list of key concepts (supports inline markdown)                          |
| `## Complexity` | `Time: O(n)` / `Space: O(1)` format                                             |
| `## Solution`   | Fenced code blocks tagged with language (`cpp`, `java`, `python`, `javascript`) |

### Key Features

- **Language switcher**: Solutions are authored as separate fenced code blocks per language — the UI swaps them based on the user's selection.
- **Per-language overrides**: Append `(Language)` to _any_ section heading (except Solution) to replace it when that language is selected — e.g. `## Approach (C++)`, `## Concepts (Python)`.
- **Multiple solutions**: Use `## Solution: Brute Force` / `## Solution: Optimized` to author alternate approaches, each with their own code fences and optional per-solution complexity.
- **Tutorial links**: Add a `tutorials:` list in frontmatter to link to related lessons (format: `course-slug/lesson-slug`).

See [`client/src/data/resources/AUTHORING.md`](client/src/data/resources/AUTHORING.md) for the complete specification with examples.
