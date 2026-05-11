import { PostsDB } from '@/lib/storage';

// Latest 20 posts. Most readers (Feedly, Inoreader, NetNewsWire) keep their
// own history; we don't need to re-emit the full archive.
const FEED_ITEM_LIMIT = 20;

// CDATA-safe wrap. The only thing CDATA can't contain is `]]>`; splitting on
// it and emitting the closing brace in a sibling section is the standard fix.
function cdata(s: string): string {
  return `<![CDATA[${s.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

// Minimal XML escape for attribute values and bare text. CDATA handles the
// rest, but the channel-level title/description sit outside CDATA in some
// validators' fast paths, so escape there too.
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Best-effort mime detection for the RSS <enclosure> tag. RSS readers use
// the `type` attribute to decide whether to render the asset inline (image
// reader) or skip it. A fallback of `image/jpeg` is acceptable because most
// blog thumbnails are JPEG and readers tolerate mismatches gracefully.
function inferImageMime(url: string): string {
  const ext = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':  return 'image/png';
    case 'gif':  return 'image/gif';
    case 'webp': return 'image/webp';
    case 'avif': return 'image/avif';
    case 'svg':  return 'image/svg+xml';
    default:     return 'image/jpeg';
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com';
  const allPosts = await PostsDB.getAll();
  const posts = allPosts
    .filter(p => p.published && !p.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, FEED_ITEM_LIMIT);

  const lastBuild = posts[0]?.updatedAt
    ? new Date(posts[0].updatedAt).toUTCString()
    : new Date().toUTCString();

  const items = posts.map((post) => {
    const url = `${baseUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.createdAt).toUTCString();
    const categories = (post.tags || [])
      .map((t) => `    <category>${escapeXml(t.name)}</category>`)
      .join('\n');
    // RSS 2.0 requires `length` on <enclosure>, but readers tolerate `0`
    // when the actual byte count isn't known cheaply. Skip a HEAD request
    // here — keeping the feed handler synchronous to outbound network is
    // a deliberate perf tradeoff.
    const enclosure = post.thumbnailUrl
      ? `\n    <enclosure url="${escapeXml(post.thumbnailUrl)}" type="${inferImageMime(post.thumbnailUrl)}" length="0" />`
      : '';
    return `  <item>
    <title>${cdata(post.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${cdata(post.excerpt || '')}</description>${enclosure}
${categories}
  </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>phancuong.com</title>
  <link>${escapeXml(baseUrl)}</link>
  <description>Technical articles, engineering insights, and software development tutorials.</description>
  <language>vi-VN</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
  <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Public so CDNs can serve the same payload to multiple readers.
      // 1h fresh; stale-while-revalidate keeps reader pulls fast even if
      // the underlying ISR hasn't run yet.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
