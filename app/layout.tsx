import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AuthProvider from '@/components/Providers/AuthProvider';
import ThemeContextProvider from '@/components/ThemeRegistry/ThemeContextProvider';
import AppShell from '@/components/layout/AppShell';
import FeedbackProvider from '@/components/Providers/FeedbackProvider';
import { Toaster } from 'sonner';
import { auth } from '@/auth';

// Weights actually used across typography + logo + buttons.
// Dropping 100/200/300/500 cuts ~40% of preloaded font payload on mobile.
// Weight 300 was only used in the logo's "PHAN" — falling back to 400 is
// visually near-identical and removes 1-2 woff2 files from the critical
// path (LCP win ~50-100ms on mobile).
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '600', '700', '800', '900'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam',
  preload: true,
});
const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: false, // only used in code blocks, not above-the-fold
});

import type { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Tints the mobile status-bar / PWA chrome to match each theme.
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B0B10' },
    { media: '(prefers-color-scheme: light)', color: '#FBF8FD' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com'),
  title: {
    default: 'Technical Blog & Portfolio',
    template: '%s | phancuong.com',
  },
  description: 'Technical articles, engineering insights, and software development tutorials.',
  alternates: {
    canonical: '/',
    types: {
      // RSS autodiscovery — emits <link rel="alternate" type="application/rss+xml">
      // so feed readers (Feedly, Inoreader, NetNewsWire) can subscribe via the
      // site URL without the user knowing the feed path.
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: 'Technical Blog & Portfolio',
    description: 'Practical software engineering guides and technical insights.',
    url: '/',
    siteName: 'phancuong.com',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical Blog & Portfolio',
    description: 'Practical software engineering guides and technical insights.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolve session server-side and pass into SessionProvider so the client
  // doesn't fire an extra /api/auth/session XHR during hydration.
  const session = await auth();
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <AuthProvider session={session}>
          <AppRouterCacheProvider>
            <ThemeContextProvider>
              <FeedbackProvider>
                <AppShell>
                  {children}
                </AppShell>
                <Toaster position="top-right" expand={false} />
              </FeedbackProvider>
            </ThemeContextProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
