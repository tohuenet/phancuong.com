/**
 * Converts a string to a URL-friendly slug.
 * Removes Vietnamese diacritics and appends a short unique identifier if requested.
 */
export function slugify(text: string, appendId: boolean = true): string {
  if (!text) return '';

  // 1. Convert to lowercase
  let slug = text.toLowerCase();

  // 2. Remove accents/diacritics
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 3. Replace special characters (đ, Đ)
  slug = slug.replace(/[đ|Đ]/g, 'd');

  // 4. Remove non-alphanumeric characters (keep hyphens and spaces)
  slug = slug.replace(/[^a-z0-9\s-]/g, '');

  // 5. Replace spaces and multiple hyphens with a single hyphen
  slug = slug.replace(/[\s-]+/g, '-');

  // 6. Trim hyphens from start and end
  slug = slug.replace(/^-+|-+$/g, '');

  // 7. Append short unique ID if requested (4-5 characters)
  if (appendId) {
    const shortId = Math.random().toString(36).substring(2, 7);
    slug = slug ? `${slug}-${shortId}` : shortId;
  }

  return slug;
}
