---
name: Author Tutorial Lesson
description: How to write or edit a course lesson in Markdown, following the supported syntax and file conventions
---

# Authoring a Tutorial Lesson

## Quick Reference

Lessons are Markdown files auto-discovered by Vite's `import.meta.glob`. Just drop a file in the right folder.

### File Location

```
client/src/data/courses/<course-slug>/<NN>-<lesson-slug>.md
```

- `<NN>`: Two-digit prefix controlling sidebar order (01–99)
- `<lesson-slug>`: Appears in the URL (`/tutorials/<course-slug>/<lesson-slug>`)
- Lowest-numbered lesson = course landing page (slug hidden from URL)

### Required Frontmatter

```yaml
---
title: Lesson Title
---
```

## Full Authoring Reference

Read `client/src/data/courses/AUTHORING.md` for the complete specification. It covers:

- All supported block-level features (code blocks, tables, alerts, collapsible details, task lists)
- All inline features (bold, italic, inline code, KaTeX math, tooltip terms, links)
- Language-specific content (tagged code fences, per-language section overrides)
- Which courses support language selectors (DSA, OOP, Discrete Mathematics, Testing & QA)
- Tips for authors (paragraph length, heading structure, collapsible blocks usage)

## Key Rules

1. **No manual registration needed** — files are auto-discovered via `import.meta.glob`
2. **Folder structure must match** `courses/<course-slug>/` exactly
3. **Use only supported markdown syntax** — `Markdown.jsx` is a custom renderer, not a standard library. Check AUTHORING.md if unsure whether a feature is supported
4. **Tooltip terms**: Use `{{term||definition}}` syntax, 3-5 per lesson max
5. **Code fences**: Tag with language for syntax highlighting; untagged = always shown
6. **Collapsible blocks**: Use `:::details Summary text` ... `:::` for optional depth

## After Writing

1. Verify the lesson renders correctly: `npm run dev` → navigate to the lesson
2. Run client tests: `npm run test:client`
3. If the lesson introduces new interactive behavior, add Playwright E2E tests in `client/e2e/`
