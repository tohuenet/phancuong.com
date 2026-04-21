import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    viewTransition: true,
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
  async headers() {
    return [
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
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "media-src 'self'",
              isProd
                ? "connect-src 'self' https: wss:"
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
