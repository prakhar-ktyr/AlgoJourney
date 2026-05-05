# Lesson Markdown Authoring Guide

Course lessons live as `.md` files under `client/src/data/courses/<course-slug>/`. The custom Markdown renderer (`client/src/components/Markdown.jsx`) supports the syntax below.

## File Structure

```
client/src/data/courses/<course-slug>/<NN>-<lesson-slug>.md
```

- `<NN>`: Two-digit numeric prefix (01–99) controlling lesson order in the sidebar.
- `<lesson-slug>`: Appears in the URL path (`/tutorials/<course-slug>/<lesson-slug>`).
- The lowest-numbered lesson is the course landing page (its slug is hidden from the URL when accessed at `/tutorials/<course-slug>`).

## Frontmatter

Every lesson starts with YAML frontmatter:

```markdown
---
title: Lesson Title
---
```

The `title` appears in the sidebar navigation, prev/next pagination buttons, and the browser tab.

---

## Block-Level Features

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

Each level has distinct styling (H1 = 3xl bold white, down to H6 = sm uppercase tracking-wide). Inline formatting (bold, code, math) works inside headings.

### Paragraphs

Plain text separated by blank lines. Manual line breaks within a paragraph are preserved (whitespace-pre-line).

### Fenced Code Blocks

````markdown
```python
def hello():
    print("Hello, world!")
```
````

Features:
- **Syntax highlighting** via Shiki (dual-theme: dark + light, adapts to reader mode).
- **Language header label** displaying the normalized language name (e.g. "C++", "Python").
- **Copy button** with "Copied!" feedback.
- **Untagged fences** (no language) display as "Code" with no syntax highlighting.

Supported languages for highlighting: `javascript`, `typescript`, `python`, `java`, `cpp`, `c`, `rust`, `go`, `html`, `css`, `json`, `bash`, `sql`, `markdown`, `yaml`, `toml`.

Language aliases: `c++`/`cxx` → cpp, `c#`/`cs` → csharp, `js` → javascript, `ts` → typescript, `py` → python, `sh`/`shell`/`zsh` → bash, `yml` → yaml, `md` → markdown.

### Lists

```markdown
- Unordered item
- Another item

1. Ordered item
2. Another item
```

Indented continuation lines join the same item.

### Task Lists

```markdown
- [x] Completed task
- [ ] Pending task
```

Renders styled checkboxes (filled indigo for checked, gray bordered for unchecked). Read-only.

### Tables (GFM)

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| a    | b      | c     |
```

Supports column alignment via `:---`, `:---:`, `---:`. Inline formatting works in cells.

### Blockquotes

```markdown
> Quoted text spanning
> multiple lines.
```

Styled with a left border, italic text, and subtle background. Supports lazy continuation (no `>` prefix on subsequent lines).

### GFM Alerts

```markdown
> [!NOTE]
> Informational callout.

> [!TIP]
> Helpful suggestion.

> [!IMPORTANT]
> Key information.

> [!WARNING]
> Potential pitfall.

> [!CAUTION]
> Dangerous action.
```

| Type | Icon | Color | Use for |
|------|------|-------|---------|
| `NOTE` | ℹ️ | Blue | General information |
| `TIP` | 💡 | Green | Helpful suggestions |
| `IMPORTANT` | ✨ | Purple | Key information |
| `WARNING` | ⚠️ | Yellow | Potential pitfalls |
| `CAUTION` | 🛑 | Red | Dangerous actions |

### Horizontal Rules

```markdown
---
```

Also `***` or `___` (3+ characters). Renders as a gray border separator.

### Collapsible Details Blocks

```markdown
:::details Why does this take O(n log n)?
Full markdown supported inside — code blocks, math, lists, etc.

$$T(n) = 2T(n/2) + O(n)$$

By the Master Theorem, this solves to $O(n \log n)$.
:::
```

Renders as a `<details>/<summary>` element with a chevron icon, collapsed by default. Use for:
- Math derivations and proofs
- Historical context or "why" explanations
- Optional depth that would clutter the main flow

The main lesson should be understandable without expanding these blocks.

---

## Inline Features

### Bold and Italic

```markdown
**bold text**
*italic text* or _italic text_
```

### Inline Code

```markdown
Use `variable_name` in your code.
```

Renders as a rounded pill with monospace font and indigo-tinted background.

### Math (LaTeX via KaTeX)

```markdown
Inline: $O(\log n)$

Block display: $$E = mc^2$$
```

Rules: opening `$` must not be followed by a space; closing `$` must not be preceded by a space. Block `$$…$$` renders with display style.

### Links

```markdown
[Internal page](/tutorials/python/python-intro)
[External site](https://example.com)
[Placeholder](#)
```

- Internal paths → React Router navigation (no page reload).
- External URLs → new tab with `rel="noopener noreferrer"`.
- `[text](#)` placeholder links render as plain text (no link).

### Tooltip Terms

```markdown
Python is a {{high-level||Abstracts away hardware details like memory management.}} language.
```

Renders the term with a dotted underline. On hover (desktop) or tap (mobile), a popover shows the definition.

Guidelines:
- Keep definitions to 1-2 sentences
- Use for jargon on first introduction only
- 3-5 per lesson is plenty — don't overuse

---

## Language-Specific Content

Some courses show a language selector dropdown. When a language is selected, the lesson body is filtered to show only relevant content.

**Courses with language support:**
- `dsa`: C++, Java, Python, JavaScript
- `oop`: C++, C#, Java, Python, JavaScript
- `discrete-mathematics`: C++, C#, Java, Python, JavaScript
- `testing-qa`: Python, JavaScript, Java, C#

### Language-tagged code fences

Only fences matching the selected language (or untagged fences) are kept:

````markdown
```cpp
std::cout << "Hello";
```

```python
print("Hello")
```

```
// Untagged — always shown
```
````

Tag aliases recognized: `cpp`/`c++`/`cxx`, `csharp`/`c#`/`cs`, `java`, `python`/`py`, `javascript`/`js`.

### Per-language section overrides

Append `(Language)` to a heading. It replaces the generic heading of the same name when that language is selected:

```markdown
## Memory Model

Generic explanation shown to all languages.

## Memory Model (C++)

Replaces the generic "Memory Model" when C++ is selected.

## Memory Model (Python)

Replaces the generic "Memory Model" when Python is selected.
```

### Standalone language sections

A heading tagged with a language that has no generic counterpart appears only for that language:

```markdown
## The GIL (Python)

Only visible when Python is selected. No generic equivalent exists.
```

---

## Page-Level Features (for reference)

These are not authored in markdown but affect how lessons are presented:

- **Sidebar navigation**: All lessons listed in order; current lesson highlighted.
- **Previous/Next pagination**: Buttons at the bottom of each lesson.
- **Reader Mode**: Distraction-free reading with configurable theme (Dark/Light/Sepia/Night), font (Sans/Serif/Mono), and size (S/M/L/XL). Activated via button; exited via Escape or toolbar.
- **Language selector**: Dropdown in the course header (only for courses in `COURSE_LANGUAGE_MAP`). Selection persisted in `localStorage`.
- **Mobile responsive**: Sidebar collapses behind a toggle on small screens.

---

## Tips for Authors

- Keep paragraphs short (3-5 sentences)
- Use headings to create scannable structure
- Put the "what" and "why" in the main flow; put the "deep how" in collapsible blocks
- Use tooltip terms for jargon on first use only
- Include code examples early — don't make readers wait
- Use untagged code fences to show expected program output
- Use tables for comparison charts and complexity references
- End lessons with a "Next step" or transition sentence
- For multi-language courses, provide all language variants of each code example
