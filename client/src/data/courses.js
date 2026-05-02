/**
 * =============================================================================
 * COURSE FILE FORMAT
 * =============================================================================
 *
 * Each tutorial topic that has full course content lives under
 * `./courses/<topic-slug>/`. Inside that folder, every Markdown file is a
 * single lesson. Files are loaded automatically (Vite's `import.meta.glob`).
 *
 * NAMING
 * ------
 *   ./courses/<topic-slug>/<NN>-<lesson-slug>.md
 *
 *   The two-digit numeric prefix controls lesson order in the sidebar.
 *   The `<lesson-slug>` is what appears in the URL:
 *
 *     ./courses/c/01-c-home.md          → /tutorials/c
 *     ./courses/c/02-c-intro.md         → /tutorials/c/c-intro
 *
 *   The lowest-numbered lesson is the course's landing page (its lesson
 *   slug is hidden from the URL and accessed at `/tutorials/<topic-slug>`).
 *
 * FRONTMATTER
 * -----------
 *   ---
 *   title: C Variables
 *   ---
 *
 *   Only `title` is required. The body below the closing `---` is plain
 *   Markdown rendered by `components/Markdown.jsx` (supports headings,
 *   lists, **bold**, `inline code`, and ```fenced``` code blocks).
 *
 * =============================================================================
 */

const rawModules = import.meta.glob("./courses/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: text };
  const body = text.slice(match[0].length);
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    meta[kv[1]] = kv[2].trim();
  }
  return { meta, body };
}

function buildLesson(raw, path) {
  // path looks like: ./courses/c/02-c-intro.md
  const m = path.match(/\.\/courses\/([^/]+)\/(\d+)-(.+)\.md$/);
  if (!m) return null;
  const [, courseSlug, orderStr, lessonSlug] = m;
  const { meta, body } = parseFrontmatter(raw);
  if (!body.trim()) return null;
  return {
    courseSlug,
    slug: lessonSlug,
    order: parseInt(orderStr, 10),
    title: meta.title || lessonSlug,
    body: body.trim(),
  };
}

function buildCourses() {
  const byCourse = {};
  for (const [path, raw] of Object.entries(rawModules)) {
    const lesson = buildLesson(raw, path);
    if (!lesson) continue;
    if (!byCourse[lesson.courseSlug]) {
      byCourse[lesson.courseSlug] = { slug: lesson.courseSlug, lessons: [] };
    }
    byCourse[lesson.courseSlug].lessons.push(lesson);
  }
  for (const course of Object.values(byCourse)) {
    course.lessons.sort((a, b) => a.order - b.order);
  }
  return byCourse;
}

export const COURSES = buildCourses();

/** Courses that show a language selector (C++, Java, Python, JavaScript). */
export const LANGUAGE_COURSES = new Set(["dsa"]);

export const COURSE_LANGUAGES = ["C++", "Java", "Python", "JavaScript"];

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

function normalizeLang(tag) {
  if (!tag) return null;
  const key = tag.trim().toLowerCase();
  if (LANG_MAP[key]) return LANG_MAP[key];
  return COURSE_LANGUAGES.find((l) => l.toLowerCase() === key) ?? null;
}

/**
 * Filter a lesson body for the selected language:
 * 1. Per-language sections: `## Heading (Python)` replaces the generic `## Heading`.
 * 2. Code fences: only fences matching `language` (or with no tag) are kept.
 */
export function filterLessonBody(body, language) {
  if (!body || !language) return body;

  // --- Step 1: resolve per-language section overrides ---
  const lines = body.split("\n");
  const sections = [];
  let current = { heading: null, lang: null, lines: [] };

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      sections.push(current);
      let title = hMatch[2].trim();
      let lang = null;
      const langMatch = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      if (langMatch) {
        const normalized = normalizeLang(langMatch[2]);
        if (normalized) {
          title = langMatch[1].trim();
          lang = normalized;
        }
      }
      current = {
        heading: title,
        headingRaw: lang ? `${hMatch[1]} ${title}` : line,
        level: hMatch[1].length,
        lang,
        lines: [],
      };
      continue;
    }
    current.lines.push(line);
  }
  sections.push(current);

  // Group sections by heading name; pick language-specific over generic.
  const resolved = [];
  const overrides = new Map();
  for (const sec of sections) {
    if (sec.lang) {
      const key = `${sec.level}:${sec.heading.toLowerCase()}`;
      if (!overrides.has(key)) overrides.set(key, new Map());
      overrides.get(key).set(sec.lang, sec);
    }
  }

  for (const sec of sections) {
    if (sec.lang) continue; // skip language-specific; we merge below
    if (sec.heading) {
      const key = `${sec.level}:${sec.heading.toLowerCase()}`;
      const langVersions = overrides.get(key);
      if (langVersions?.has(language)) {
        const override = langVersions.get(language);
        resolved.push(override.headingRaw);
        resolved.push(...override.lines);
        continue;
      }
    }
    if (sec.headingRaw) resolved.push(sec.headingRaw);
    resolved.push(...sec.lines);
  }

  let filtered = resolved.join("\n");

  // --- Step 2: keep only code fences matching the selected language ---
  const validTags = new Set(
    Object.entries(LANG_MAP)
      .filter(([, v]) => v === language)
      .map(([k]) => k),
  );
  validTags.add(language.toLowerCase());

  filtered = filtered.replace(
    /```([A-Za-z+]*)\r?\n([\s\S]*?)```/g,
    (match, tag) => {
      if (!tag) return match; // untagged fences stay
      return validTags.has(tag.toLowerCase()) ? match : "";
    },
  );

  // Collapse runs of 3+ blank lines into 2.
  filtered = filtered.replace(/\n{3,}/g, "\n\n");

  return filtered.trim();
}

/** Return `true` when a course supports language selection. */
export function hasLanguageSupport(courseSlug) {
  return LANGUAGE_COURSES.has(courseSlug);
}

/** Return the course object for a topic slug, or `null` if none. */
export function getCourse(courseSlug) {
  return COURSES[courseSlug] ?? null;
}

/** Return `true` when full course content exists for a topic. */
export function hasCourse(courseSlug) {
  return Boolean(COURSES[courseSlug]?.lessons?.length);
}

/**
 * Resolve a single lesson within a course. When `lessonSlug` is omitted, the
 * course's first lesson (its landing page) is returned.
 */
export function getLesson(courseSlug, lessonSlug) {
  const course = getCourse(courseSlug);
  if (!course) return null;
  if (!lessonSlug) return course.lessons[0] ?? null;
  return course.lessons.find((l) => l.slug === lessonSlug) ?? null;
}

/** Return `[prev, next]` lessons relative to a given lesson slug. */
export function getAdjacentLessons(courseSlug, lessonSlug) {
  const course = getCourse(courseSlug);
  if (!course) return [null, null];
  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return [null, null];
  return [course.lessons[idx - 1] ?? null, course.lessons[idx + 1] ?? null];
}
