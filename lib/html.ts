import fs from 'fs/promises';
import path from 'path';
import DOMPurify from 'isomorphic-dompurify';

// Whitelist-based sanitizer backed by DOMPurify. Scoped to the rich-text
// tags Tiptap emits plus our comment-attachment grid. DOMPurify strips
// scripts, event handlers, and javascript: URIs by default.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'hr',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'span', 'div', 'figure', 'figcaption',
  'mark', 'kbd',
  'iframe', // src restricted to known embed origins via the hook below
];

// Only allow iframes whose src points at a known embed endpoint. Without
// this, a commenter could embed a phishing page or tracking pixel via a
// hand-crafted <iframe>. DOMPurify by itself permits the tag once it's in
// ALLOWED_TAGS — origin filtering has to be enforced manually.
const IFRAME_SRC_WHITELIST = /^https:\/\/(?:www\.)?(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/i;

// `addHook` registers globally on the shared DOMPurify instance — fine here
// because no other module uses isomorphic-dompurify in this codebase.
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return;
  const src = (node as Element).getAttribute?.('src') || '';
  if (!IFRAME_SRC_WHITELIST.test(src)) {
    node.parentNode?.removeChild(node);
  }
});

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
  'width', 'height', 'loading', 'allowfullscreen', 'frameborder',
  'colspan', 'rowspan', 'data-language', 'data-theme', 'data-highlighted-line',
  'data-line', 'data-rehype-pretty-code-figure',
];

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target'],
    FORBID_ATTR: ['style'],
    // NB: omit USE_PROFILES — when set alongside ALLOWED_TAGS it intersects
    // with the profile's tag list, which silently drops `iframe` (the html
    // profile doesn't include it). ALLOWED_TAGS is already an explicit
    // whitelist, so the profile adds no value here.
  });
}

/**
 * Extracts all image source paths that point to local uploads.
 */
export function extractImagePaths(html: string): string[] {
  if (!html) return [];
  const imgRegex = /src=["']\/uploads\/([^"']+)["']/g;
  const matches = [...html.matchAll(imgRegex)];
  return matches.map(match => match[1]);
}

/**
 * Deletes uploaded images found in the given HTML from the filesystem.
 */
export async function cleanupImages(html: string): Promise<void> {
  const images = extractImagePaths(html);
  await deleteUploadedFiles(images);
}

/**
 * Removes uploaded images that were present in `oldHtml` but no longer appear
 * in `newHtml`. Used after an edit to release orphaned resources.
 */
export async function diffRemovedImages(oldHtml: string, newHtml: string): Promise<void> {
  const oldImages = new Set(extractImagePaths(oldHtml));
  const newImages = new Set(extractImagePaths(newHtml));
  const removed = [...oldImages].filter(p => !newImages.has(p));
  await deleteUploadedFiles(removed);
}

async function deleteUploadedFiles(fileNames: string[]): Promise<void> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  for (const fileName of fileNames) {
    // Prevent path traversal
    const resolved = path.resolve(uploadDir, fileName);
    if (!resolved.startsWith(path.resolve(uploadDir) + path.sep)) continue;
    try {
      await fs.unlink(resolved);
      console.log(`Resource released: ${fileName}`);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
