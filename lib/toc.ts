export interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

const HEADING_RE = /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi;

// Common named entities the editor emits. Numeric (&#x...; / &#...;) are
// handled separately. Keeping this small on purpose — anything more exotic
// in a heading is surprising; we'd rather slug it as-is than build a full
// HTML decoder server-side.
const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, (m) => ENTITY_MAP[m] ?? m)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Walks the post HTML, extracts H2/H3 headings into a flat ToC list, and
 * returns the same HTML with `id="..."` injected on each heading so anchor
 * links work. Idempotent: if a heading already has an `id`, that id is
 * reused (so editor-supplied anchors aren't clobbered).
 */
export function extractHeadings(html: string): { html: string; headings: TocEntry[] } {
  if (!html) return { html: '', headings: [] };

  const headings: TocEntry[] = [];
  const seen = new Map<string, number>();

  const transformed = html.replace(HEADING_RE, (full, tag: string, attrs: string, inner: string) => {
    const level = tag.toLowerCase() === 'h2' ? 2 : 3;
    // Strip nested tags first (e.g. <h2><code>foo</code></h2>), then decode
    // entities so `&amp;` doesn't become `amp` in the slug.
    const text = decodeEntities(inner.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
    if (!text) return full;

    const existingId = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1];
    if (existingId) {
      headings.push({ level, text, id: existingId });
      return full;
    }

    const baseId = slugifyHeading(text);
    if (!baseId) return full;

    const count = seen.get(baseId) || 0;
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
    seen.set(baseId, count + 1);

    headings.push({ level, text, id });
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });

  return { html: transformed, headings };
}
