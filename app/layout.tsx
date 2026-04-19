import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AuthProvider from '@/components/Providers/AuthProvider';
import ThemeContextProvider from '@/components/ThemeRegistry/ThemeContextProvider';
import AppShell from '@/components/layout/AppShell';
import FeedbackProvider from '@/components/Providers/FeedbackProvider';
import { Toaster } from 'sonner';
import Box from '@mui/material/Box';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-mono',
});

import type { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com'),
  title: {
    default: 'Technical Blog & Portfolio',
    template: '%s | phancuong.com',
  },
  description: 'Technical articles, engineering insights, and software development tutorials.',
  openGraph: {
    title: 'Technical Blog & Portfolio',
    description: 'Practical software engineering guides and technical insights.',
    url: '/',
    siteName: 'phancuong.com',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
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
