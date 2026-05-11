/**
 * Converts a string to a URL-friendly slug. Removes Vietnamese diacritics
 * and reduces to a-z, 0-9, and single hyphens. The result is *not*
 * guaranteed to be unique — callers that persist must run it through
 * `ensureUniquePostSlug` (or equivalent) to disambiguate collisions.
 */
export function slugify(text: string): string {
  if (!text) return '';

  let slug = text.toLowerCase();
  slug = slug.normalize('NFD').replace(/[̀-ͯ]/g, '');
  slug = slug.replace(/[đ|Đ]/g, 'd');
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s-]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');

  // Cap at 80 chars on a word boundary so very long titles don't produce
  // unwieldy URLs. 80 keeps the slug under most aggregators' truncation
  // and well inside the 2048-byte URL practical ceiling.
  if (slug.length > 80) {
    const cut = slug.slice(0, 80);
    const lastDash = cut.lastIndexOf('-');
    slug = lastDash > 40 ? cut.slice(0, lastDash) : cut;
  }

  return slug;
}
