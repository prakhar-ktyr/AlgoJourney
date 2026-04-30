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
