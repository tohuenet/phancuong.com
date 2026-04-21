import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AuthProvider from '@/components/Providers/AuthProvider';
import ThemeContextProvider from '@/components/ThemeRegistry/ThemeContextProvider';
import AppShell from '@/components/layout/AppShell';
import FeedbackProvider from '@/components/Providers/FeedbackProvider';
import DeferredToaster from '@/components/Providers/DeferredToaster';
import Box from '@mui/material/Box';
import { auth } from '@/auth';

// Only the weights actually used across typography + logo + buttons.
// Dropping 100/200/500 cuts ~30% of font payload on mobile without any
// visible regression (logo uses 300/900, body 400, medium 600, bold 700/800).
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '600', '700', '800', '900'],
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
                <DeferredToaster />
              </FeedbackProvider>
            </ThemeContextProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
