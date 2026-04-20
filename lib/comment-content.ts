/**
 * Comment HTML layout: an optional body written in Tiptap followed by an optional
 * trailing attachments block:
 *
 *   <p>...text...</p><div class="comment-attachments">
 *     <img src="/uploads/a.jpg" class="comment-attachment" alt="" />
 *     <img src="/uploads/b.png" class="comment-attachment" alt="" />
 *   </div>
 *
 * Keeping attachments in a dedicated trailing block (instead of inline inside
 * the editor) lets the UI render them as a Facebook-style uniform thumbnail
 * grid while still storing everything in a single `content` string.
 */

const ATTACHMENTS_BLOCK_RE = /<div\s+class=["']comment-attachments["'][^>]*>[\s\S]*?<\/div>\s*$/i;
const IMG_SRC_RE = /<img[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

export function splitCommentContent(html: string): { body: string; attachments: string[] } {
  if (!html) return { body: '', attachments: [] };
  const match = html.match(ATTACHMENTS_BLOCK_RE);
  if (!match || match.index === undefined) {
    return { body: html, attachments: [] };
  }
  const body = html.slice(0, match.index).replace(/\s+$/, '');
  const attachments = [...match[0].matchAll(IMG_SRC_RE)].map((m) => m[1]);
  return { body, attachments };
}

export function combineCommentContent(body: string, attachments: string[]): string {
  if (!attachments.length) return body;
  const imgs = attachments
    .map(
      (src) =>
        `<img src="${escapeAttr(src)}" class="comment-attachment" alt="" />`
    )
    .join('');
  return `${body}<div class="comment-attachments">${imgs}</div>`;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
