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
 * Build the canonical slug for a DSA problem. The slug is derived from the
 * title, so problems can be reordered or inserted without breaking links,
 * resource filenames, or saved progress.
 */
export function problemSlug(problem) {
  return slugify(problem.title);
}
