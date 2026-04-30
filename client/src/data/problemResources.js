/**
 * =============================================================================
 * PROBLEM RESOURCE FILE FORMAT
 * =============================================================================
 *
 * Each problem's course material lives in a single Markdown file under
 * `./resources/<NN-step-slug>/`.  Files are organized into per-step
 * subfolders (e.g. `01-learn-the-basics/`) so the file tree mirrors the
 * sheet's logical order.  Lookup is by slug only — the folder is purely
 * for human navigation.
 *
 * FILES ARE PICKED UP AUTOMATICALLY from any subfolder — just drop the
 * file into the matching step folder.
 *
 * -----------------------------------------------------------------------------
 * NAMING CONVENTION
 * -----------------------------------------------------------------------------
 *
 *   resources/<NN-step-slug>/<url-friendly-title>.md
 *   e.g. resources/01-learn-the-basics/user-input-output.md
 *        resources/03-solve-problems-on-arrays-easy-medium-hard/trapping-rain-water.md
 *
 * The slug must match `slugify(problem.title)` from `lib/slugify.js` (which
 * is also what the routing layer uses). The filename (not the folder) is
 * the source of truth for the slug; a frontmatter `slug:` field can
 * override it if a title ever needs to change without renaming the file.
 *
 * -----------------------------------------------------------------------------
 * FULL FILE TEMPLATE
 * -----------------------------------------------------------------------------
 *
 *   ---
 *   time: O(n)
 *   space: O(1)
 *   concepts:
 *     - Two pointers
 *     - Sliding window
 *   ---
 *
 *   ## Overview
 *   One or more paragraphs describing the problem.  Supports **bold**,
 *   *italic*, `inline code`, and fenced code blocks (see below).
 *
 *   ## Approach
 *   Explain the strategy. Newlines are preserved.  Same markdown support
 *   as Overview.
 *
 *   ## Concepts
 *   - First concept
 *   - **`someFunction()`:** explanation with bold + inline code
 *
 *   ## Solution
 *
 *   ```cpp
 *   // C++ reference solution
 *   ```
 *
 *   ```java
 *   // Java reference solution
 *   ```
 *
 *   ```python
 *   # Python reference solution
 *   ```
 *
 *   ```javascript
 *   // JavaScript reference solution
 *   ```
 *
 * -----------------------------------------------------------------------------
 * FRONTMATTER FIELDS
 * -----------------------------------------------------------------------------
 *
 *   slug      (optional) — override the slug derived from the filename
 *   time      (optional) — default time complexity, e.g. "O(n log n)"
 *   space     (optional) — default space complexity, e.g. "O(1)"
 *   concepts  (optional) — YAML list; used as the default Concepts fallback
 *                          when no ## Concepts section is present in the body.
 *                          Inline markdown is NOT supported in frontmatter
 *                          bullets — use ## Concepts in the body instead.
 *
 * -----------------------------------------------------------------------------
 * SECTION NAMES  (all optional, order does not matter)
 * -----------------------------------------------------------------------------
 *
 *   ## Overview     — introductory prose
 *   ## Approach     — strategy / algorithm explanation
 *   ## Concepts     — markdown bullet list of key concepts
 *   ## Complexity   — special syntax (see below)
 *   ## Solution     — fenced code blocks (one per language)
 *
 *   Any section may also appear WITHOUT a section heading as plain prose
 *   inside another section — everything is rendered via the Markdown component
 *   which supports paragraphs, lists, inline code, bold, and fenced blocks.
 *
 *   ## Complexity section syntax (body only, not frontmatter):
 *
 *     ## Complexity
 *     Time: O(n)
 *     Space: O(1)
 *
 *   Frontmatter `time` / `space` fields are the simpler alternative;
 *   use this section form only when you need a per-language override.
 *
 * -----------------------------------------------------------------------------
 * SOLUTION CODE FENCE LANGUAGE TAGS
 * -----------------------------------------------------------------------------
 *
 *   Canonical    Aliases accepted
 *   ----------   ----------------
 *   C++          cpp, c++, cxx
 *   Java         java
 *   Python       python, py
 *   JavaScript   javascript, js
 *
 *   Only the four languages above appear in the language selector.
 *   You don't have to include all four — omitting one language causes the UI
 *   to show "A <lang> solution hasn't been written yet."
 *   Omitting the ## Solution section entirely (or including no code fences)
 *   hides the Solution heading completely — no fallback message is shown.
 *
 * -----------------------------------------------------------------------------
 * MULTIPLE SOLUTIONS  (alternate approaches)
 * -----------------------------------------------------------------------------
 *
 *   You can author more than one ## Solution section per problem. Each one
 *   becomes its own block under the "Solution" heading on the page. Add a
 *   label after `Solution` (separated by `:`, `-`, or whitespace) to title
 *   each approach:
 *
 *     ## Solution: Brute Force
 *     ```cpp
 *     // O(n^2) version
 *     ```
 *
 *     ## Solution: Optimized
 *     ```cpp
 *     // O(n log n) version
 *     ```
 *
 *   Untitled `## Solution` headings get auto-numbered ("Approach 1",
 *   "Approach 2", …) when more than one is present. A single untitled
 *   `## Solution` continues to render exactly as before — no subheading.
 *
 *   Each solution section parses its own code fences per language. A solution
 *   that lacks code for the currently-selected language shows a small
 *   "not written yet" note inline so other approaches stay visible.
 *
 *   Per-solution complexity (optional) — add `Time:` / `Space:` lines at the
 *   very top of a `## Solution` body, before the first code fence:
 *
 *     ## Solution: Brute Force
 *     Time: O(n^2)
 *     Space: O(1)
 *
 *     ```cpp
 *     // ...
 *     ```
 *
 *   They render as a small caption under the approach heading. If EVERY
 *   solution declares its own complexity, the top-level Complexity section
 *   is hidden to avoid duplication. Mixing — some solutions with their own
 *   complexity, others without — keeps the global section visible as the
 *   default for the unannotated ones.
 *
 * -----------------------------------------------------------------------------
 * INLINE MARKDOWN (supported in Overview, Approach, Concepts body text)
 * -----------------------------------------------------------------------------
 *
 *   **bold text**
 *   *italic text*  or  _italic text_
 *   `inline code`
 *   **`bold + inline code`**       ← nesting is supported
 *   **`fn()` (label):**            ← bold wrapping code + plain text
 *
 *   Markdown headings (rendered as styled <h1>–<h6> elements):
 *
 *     ### What is an Array?
 *     #### Sub-heading
 *
 *   Fenced code blocks inside prose sections (e.g. inside ## Approach):
 *
 *     ```python
 *     A, B = map(int, input().split())
 *     print(A * B)
 *     ```
 *
 *   These render as styled CodeBlock components just like the ## Solution
 *   snippets, but they are NOT selectable by the language dropdown — they
 *   are static illustrations embedded in the explanation text.
 *
 * -----------------------------------------------------------------------------
 * PER-LANGUAGE OVERRIDES  (optional)
 * -----------------------------------------------------------------------------
 *
 *   Append a language name in parentheses to any section heading to make that
 *   section appear ONLY when the matching language is selected in the dropdown.
 *   The generic version (no suffix) is always the fallback.
 *
 *   Supported on: Overview, Approach, Concepts, Complexity.
 *   NOT supported on: Solution (language selection there is handled by the
 *   code fence tag).
 *
 *   Language names are case-insensitive and accept the same aliases as fences:
 *
 *     ## Overview (Python)
 *     ## Approach (C++)          ← or (cpp), (c++)
 *     ## Concepts (Java)
 *     ## Complexity (JavaScript) ← or (js)
 *
 *   The per-language section completely REPLACES the generic one for that
 *   language — there is no merging.  If you want to extend the default, copy
 *   the default text into the override and add to it.
 *
 * -----------------------------------------------------------------------------
 * COMPLETE EXAMPLE WITH ALL FEATURES
 * -----------------------------------------------------------------------------
 *
 *   ---
 *   time: O(1)
 *   space: O(1)
 *   ---
 *
 *   ## Overview
 *   Multiply two integers **A** and **B** and return the result.
 *
 *   ## Approach
 *   Apply the `*` operator directly.  Maximum product is 10,000 × 10,000 =
 *   100,000,000, which fits in a 32-bit signed integer.
 *
 *   ## Approach (Python)
 *   Python's `int` is arbitrary-precision, so overflow is not a concern.
 *   Just return `A * B`.
 *
 *   ## Concepts
 *   - **Variables:** named containers for values
 *   - **Return statement:** sends the result back to the caller
 *
 *   ## Concepts (C++)
 *   - **`cin`:** reads from standard input — `cin >> A >> B;`
 *   - **`cout`:** writes to standard output — `cout << result;`
 *   - **`#include <iostream>`:** required header for cin/cout
 *
 *   ## Complexity (Python)
 *   Time: O(1)
 *   Space: O(1)
 *
 *   ## Solution
 *
 *   ```cpp
 *   int solve(int A, int B) { return A * B; }
 *   ```
 *
 *   ```python
 *   def solve(A, B): return A * B
 *   ```
 *
 * =============================================================================
 */

export const SUPPORTED_LANGUAGES = ["C++", "Java", "Python", "JavaScript"];

const LANG_MAP = {
  cpp: "C++",
  "c++": "C++",
  cxx: "C++",
  java: "Java",
  python: "Python",
  py: "Python",
  javascript: "JavaScript",
  js: "JavaScript",
};

function normalizeLanguage(tag) {
  if (!tag) return null;
  const key = tag.trim().toLowerCase();
  if (LANG_MAP[key]) return LANG_MAP[key];
  const direct = SUPPORTED_LANGUAGES.find((lang) => lang.toLowerCase() === key);
  return direct ?? null;
}

const rawModules = import.meta.glob("./resources/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: text };
  const body = text.slice(match[0].length);
  const meta = {};
  let currentListKey = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    if (!rawLine.trim()) {
      currentListKey = null;
      continue;
    }
    const listItem = rawLine.match(/^\s+-\s+(.*)$/);
    if (listItem && currentListKey) {
      meta[currentListKey].push(listItem[1].trim());
      continue;
    }
    const kv = rawLine.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value.trim() === "") {
      meta[key] = [];
      currentListKey = key;
    } else {
      meta[key] = value.trim();
      currentListKey = null;
    }
  }
  return { meta, body };
}

/**
 * Split the markdown body at `##` headings, separating generic sections from
 * per-language ones (identified by a `(Lang)` suffix on the heading).
 *
 * `## Solution` headings are special: they may appear multiple times, each
 * representing an alternate approach. The text after `Solution` (optionally
 * separated by `:` or `-`) is treated as the solution's label. They are
 * collected into an ordered `solutionSections` array rather than being
 * deduplicated into the `generic` map.
 */
function parseSections(body) {
  const generic = {};
  const byLang = {};
  const solutionSections = [];
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)];
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    let title = h[1].trim();
    let lang = null;
    const langMatch = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (langMatch) {
      const normalized = normalizeLanguage(langMatch[2]);
      if (normalized) {
        title = langMatch[1].trim();
        lang = normalized;
      }
    }
    const name = title.toLowerCase();
    const start = h.index + h[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
    const content = body.slice(start, end).trim();
    const solutionMatch = name.match(/^solution\b\s*[:-]?\s*(.*)$/);
    if (solutionMatch && !lang) {
      // Preserve original-case label from the heading text (after "Solution").
      const labelMatch = title.match(/^solution\b\s*[:-]?\s*(.*)$/i);
      const label = labelMatch ? labelMatch[1].trim() : "";
      solutionSections.push({ title: label || null, content });
      continue;
    }
    if (lang) {
      if (!byLang[lang]) byLang[lang] = {};
      byLang[lang][name] = content;
    } else {
      generic[name] = content;
    }
  }
  return { generic, byLang, solutionSections };
}

function parseSolutions(text) {
  const out = {};
  const re = /```([A-Za-z+]+)\r?\n([\s\S]*?)```/g;
  for (const m of text.matchAll(re)) {
    const lang = normalizeLanguage(m[1]);
    if (!lang) continue;
    out[lang] = m[2].replace(/\r?\n$/, "");
  }
  return out;
}

function parseConceptsSection(text) {
  if (!text) return null;
  // Preserve the raw markdown so the page renderer can format inline `code`
  // and **bold** inside each bullet. Strip leading/trailing blank lines only.
  const trimmed = text.replace(/^\s+|\s+$/g, "");
  return trimmed || null;
}

function conceptsListToMarkdown(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function parseComplexitySection(text) {
  if (!text) return null;
  const out = {};
  const time = text.match(/time\s*:\s*(.+)/i);
  const space = text.match(/space\s*:\s*(.+)/i);
  if (time) out.time = time[1].trim();
  if (space) out.space = space[1].trim();
  return out.time || out.space ? out : null;
}

/**
 * Pull leading `Time:` / `Space:` annotation lines off the top of a solution
 * body and return both the parsed complexity (or `null`) and the remaining
 * body for code-fence parsing. Only contiguous lines BEFORE the first code
 * fence are considered — any complexity inside or after code is left alone.
 */
function extractSolutionComplexity(text) {
  if (!text) return { complexity: null, rest: text };
  const lines = text.split(/\r?\n/);
  const meta = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const time = line.match(/^\s*time\s*:\s*(.+?)\s*$/i);
    const space = line.match(/^\s*space\s*:\s*(.+?)\s*$/i);
    if (time && !meta.time) {
      meta.time = time[1].trim();
      i++;
      continue;
    }
    if (space && !meta.space) {
      meta.space = space[1].trim();
      i++;
      continue;
    }
    break;
  }
  const rest = lines.slice(i).join("\n");
  const complexity = meta.time || meta.space ? meta : null;
  return { complexity, rest };
}

// Exported for unit tests. Not part of the public API.
export function __buildResource(raw, path) {
  return buildResource(raw, path);
}

function buildResource(raw, path) {
  const { meta, body } = parseFrontmatter(raw);
  const { generic, byLang, solutionSections } = parseSections(body);
  const slugFromPath = path.match(/\/([^/]+)\.md$/)?.[1] ?? null;
  const slug = (typeof meta.slug === "string" && meta.slug.trim()) || slugFromPath;
  if (!slug) return null;

  // Treat empty placeholder files (no frontmatter, no sections) as if no
  // resource has been authored yet — the UI then shows the "coming soon"
  // state instead of a blank page.
  const hasMeta = Object.keys(meta).length > 0;
  const hasSections =
    Object.keys(generic).length > 0 ||
    Object.keys(byLang).length > 0 ||
    solutionSections.length > 0;
  if (!hasMeta && !hasSections) return null;

  const fallbackComplexity = parseComplexitySection(generic.complexity) || {};
  const complexity = {
    time: (typeof meta.time === "string" ? meta.time : null) || fallbackComplexity.time || null,
    space: (typeof meta.space === "string" ? meta.space : null) || fallbackComplexity.space || null,
  };
  const concepts =
    Array.isArray(meta.concepts) && meta.concepts.length
      ? conceptsListToMarkdown(meta.concepts)
      : parseConceptsSection(generic.concepts);

  const languages = {};
  for (const [lang, sections] of Object.entries(byLang)) {
    const override = {};
    if (sections.overview) override.intro = sections.overview;
    if (sections.approach) override.approach = sections.approach;
    const overrideConcepts = parseConceptsSection(sections.concepts);
    if (overrideConcepts) override.concepts = overrideConcepts;
    const overrideComplexity = parseComplexitySection(sections.complexity);
    if (overrideComplexity) {
      override.complexity = { ...complexity, ...overrideComplexity };
    }
    if (Object.keys(override).length) languages[lang] = override;
  }

  // Each `## Solution` heading becomes its own solution entry. Code fences
  // inside that section are mapped per language. A solution body may begin
  // with `Time:` / `Space:` lines to declare per-approach complexity — those
  // are stripped from the body before code fences are parsed.
  const solutions = solutionSections.map((section) => {
    const { complexity: solComplexity, rest } = extractSolutionComplexity(section.content);
    return {
      title: section.title,
      complexity: solComplexity,
      code: parseSolutions(rest),
    };
  });

  return {
    slug,
    intro: generic.overview || null,
    concepts,
    approach: generic.approach || null,
    complexity,
    solutions,
    languages,
  };
}

export const PROBLEM_RESOURCES = (() => {
  const out = {};
  for (const [path, raw] of Object.entries(rawModules)) {
    const entry = buildResource(raw, path);
    if (entry) out[entry.slug] = entry;
  }
  return out;
})();

/** Look up the raw resource entry for a given problem slug (or `null`). */
export function getProblemResource(slug) {
  return PROBLEM_RESOURCES[slug] ?? null;
}

/**
 * Resolve a problem's content for a specific language, applying any
 * per-language overrides declared in the markdown source. Returns a flat
 * shape that the UI can render without having to reason about fallbacks.
 */
export function resolveProblemResource(slug, language) {
  const resource = getProblemResource(slug);
  if (!resource) return null;
  const override = resource.languages?.[language] ?? {};
  const solutions = (resource.solutions ?? []).map((entry) => ({
    title: entry.title,
    complexity: entry.complexity ?? null,
    code: entry.code?.[language] ?? null,
  }));
  const availableLanguages = Array.from(
    new Set((resource.solutions ?? []).flatMap((entry) => Object.keys(entry.code ?? {}))),
  );
  return {
    slug: resource.slug,
    intro: override.intro ?? resource.intro,
    concepts: override.concepts ?? resource.concepts,
    approach: override.approach ?? resource.approach,
    complexity: override.complexity ?? resource.complexity,
    solutions,
    availableLanguages,
  };
}
