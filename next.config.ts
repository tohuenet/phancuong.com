import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Tree-shake named imports from heavy packages into per-symbol imports so
  // unused Lucide icons / date-fns locales / framer-motion exports don't end
  // up in the client bundle. MUI is omitted: it's optimized by default in
  // Next, and explicit per-symbol rewrites split @emotion/react across
  // module paths, which triggers a Turbopack dev-mode hydration mismatch
  // (different mui-{hash} classes on SSR vs CSR).
  experimental: {
    viewTransition: true,
    // Inline small CSS chunks into the HTML `<head>` so there's no render-
    // blocking <link rel="stylesheet"> waterfall on first paint. Our CSS
    // stays tiny (~1KB) because MUI uses runtime CSS-in-JS — the bulk of
    // styling never shows up as a stylesheet. Prod-only, per Next docs.
    inlineCss: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Whitelist hosts we actually serve avatars/thumbnails from.
    // `hostname: '**'` would open an image proxy to the whole internet.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google auth avatars
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async redirects() {
    return [
      // Old /blog index used to mirror the home page; now home owns the
      // blog list. 308 (permanent + method-preserving) so search engines
      // collapse duplicate-content signals onto `/`.
      { source: '/blog', destination: '/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Page routes: override Next's default `Cache-Control: no-store` (set
        // for dynamic responses) with `private, no-cache` so Chrome's bfcache
        // can keep the page alive on back/forward nav. `no-cache` still forces
        // revalidation on a fresh visit; `private` keeps it out of CDN caches.
        // Excludes API routes, `_next/`, static assets, and feed/sitemap XML
        // (those routes set their own SWR-friendly Cache-Control headers
        // and shouldn't be marked `private` — RSS readers and search-engine
        // crawlers expect them to be cacheable).
        source: '/((?!api/|_next/|feed\\.xml|sitemap\\.xml|robots\\.txt|.*\\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg|css|js|woff2?|ttf|otf|mp4|webm)$).*)',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, must-revalidate' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // HSTS only in prod — Safari caches it even for localhost which
          // forces http://localhost:3000 to upgrade to HTTPS and breaks dev.
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
          },
          // CSP is additive: `connect-src` allows http: + ws: in dev so HMR
          // and chunk fetches over localhost work. `upgrade-insecure-requests`
          // is prod-only so the dev server (HTTP) isn't forced to HTTPS.
          // Cloudflare Web Analytics (auto-injected when proxying through CF):
          // script at static.cloudflareinsights.com, RUM telemetry posts to
          // cloudflareinsights.com. `script-src-elem` is the modern per-tag
          // variant and fallbacks to `script-src`, but some browsers split
          // enforcement — set both so the Chrome warning goes away too.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' static.cloudflareinsights.com",
              "script-src-elem 'self' 'unsafe-inline' static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "media-src 'self'",
              isProd
                ? "connect-src 'self' https: wss: cloudflareinsights.com"
                : "connect-src 'self' http: https: ws: wss:",
              "frame-src 'self' www.youtube.com www.youtube-nocookie.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              ...(isProd ? ['upgrade-insecure-requests'] : []),
            ].join('; '),
          },
          // `allow-popups` keeps Google OAuth sign-in working while still
          // isolating the main origin from cross-origin window handles.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
