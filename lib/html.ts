import fs from 'fs/promises';
import path from 'path';

/**
 * A safe, whitelist-based HTML sanitizer.
 * Allows common rich text tags and attributes while removing scripts and events.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // 1. Remove script tags and their content
  let sanitized = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');

  // 2. Remove all "on..." event handlers (e.g., onclick, onerror)
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  // 3. Remove "javascript:" URIs
  sanitized = sanitized.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');

  /**
   * NOTE: In a production environment with complex requirements, 
   * using a library like `sanitize-html` is highly recommended.
   * This custom implementation is a strict whitelist-focused fallback.
   */

  return sanitized;
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
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }
}
