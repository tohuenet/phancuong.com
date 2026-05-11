import { ImageResponse } from 'next/og';
import { getPostMetaBySlug } from '@/lib/blog';

export const alt = 'phancuong.com';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Re-render after any post edit. Generation is cheap for the text-only path
// (~50ms) and dominated by the remote thumbnail fetch when present (~200ms).
export const dynamic = 'force-dynamic';

// Fetches a single weight of "Be Vietnam Pro" with the Vietnamese subset.
// Without this, Satori falls back to its bundled Latin font and Vietnamese
// diacritics render as tofu boxes. The two-step fetch (CSS → woff2 URL) is
// the canonical pattern Vercel uses in its `next/og` examples — it lets us
// pull the latest font hash without committing a binary to the repo.
async function loadVietnameseFont(weight: 400 | 800): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@${weight}&display=swap&subset=vietnamese`,
      // A modern desktop UA forces Google Fonts to return woff2 with the
      // explicit unicode-range we asked for (vietnamese subset).
      { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' } },
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    // Pick the src URL inside the `vietnamese` unicode-range block. Falling
    // back to the first src means we still get *something* even if Google
    // changes the response format.
    const vietBlock = css.match(/\/\* vietnamese \*\/[\s\S]*?src:\s*url\((https:\/\/[^)]+)\)/i);
    const fallbackUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/i);
    const url = vietBlock?.[1] ?? fallbackUrl?.[1];
    if (!url) return null;
    const fontRes = await fetch(url);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, fontBold, fontRegular] = await Promise.all([
    getPostMetaBySlug(slug),
    loadVietnameseFont(800),
    loadVietnameseFont(400),
  ]);

  const title = post?.title ?? 'phancuong.com';
  const tags = (post?.tags || []).slice(0, 3).map((t) => `#${t.name}`);

  // Satori can <img> remote URLs but needs an absolute path. Local uploads
  // get prefixed with the site origin; remote thumbnails pass through.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com';
  const thumb = post?.thumbnailUrl
    ? post.thumbnailUrl.startsWith('http')
      ? post.thumbnailUrl
      : `${siteUrl}${post.thumbnailUrl.startsWith('/') ? '' : '/'}${post.thumbnailUrl}`
    : null;

  const fonts = [
    fontBold && {
      name: 'Be Vietnam Pro',
      data: fontBold,
      weight: 800 as const,
      style: 'normal' as const,
    },
    fontRegular && {
      name: 'Be Vietnam Pro',
      data: fontRegular,
      weight: 400 as const,
      style: 'normal' as const,
    },
  ].filter(Boolean) as Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 800;
    style: 'normal';
  }>;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          position: 'relative',
          background:
            'linear-gradient(135deg, #0B0B10 0%, #1a1325 50%, #0B0B10 100%)',
          color: '#FBF8FD',
          fontFamily: 'Be Vietnam Pro, sans-serif',
        }}
      >
        {thumb && (
          <>
            <img
              src={thumb}
              alt=""
              width={1200}
              height={630}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(11,11,16,0.45) 0%, rgba(11,11,16,0.92) 90%)',
              }}
            />
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #C9A8FF, #6B5FCC)',
            }}
          />
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C9A8FF',
            }}
          >
            phancuong.com
          </div>
        </div>

        <div
          style={{
            display: '-webkit-box',
            position: 'relative',
            fontSize: title.length > 80 ? 56 : 72,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {tags.map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  fontSize: 26,
                  fontWeight: 400,
                  color: '#C9A8FF',
                  background: 'rgba(201, 168, 255, 0.12)',
                  padding: '8px 20px',
                  borderRadius: 999,
                  border: '1px solid rgba(201, 168, 255, 0.3)',
                }}
              >
                {t}
              </div>
            ))}
          </div>

          {post?.readingTime && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: 'rgba(251, 248, 253, 0.6)',
              }}
            >
              {post.readingTime}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
