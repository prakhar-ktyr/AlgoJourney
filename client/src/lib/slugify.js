/** Convert an arbitrary string to a URL-safe slug. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build the canonical slug for a DSA problem. Includes the id to guarantee
 * uniqueness even if two problems share a title.
 */
export function problemSlug(problem) {
  return `${problem.id}-${slugify(problem.title)}`;
}
