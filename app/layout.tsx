import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AuthProvider from '@/components/Providers/AuthProvider';
import ThemeContextProvider from '@/components/ThemeRegistry/ThemeContextProvider';
import AppShell from '@/components/layout/AppShell';
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
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://phancuong.com'),
  title: {
    default: 'Phan Cuong - Senior Fullstack Engineer',
    template: '%s | Phan Cuong',
  },
  description: 'Personal portfolio and technical blog by Phan Cuong',
  openGraph: {
    title: 'Phan Cuong - Senior Fullstack Engineer',
    description: 'Personal portfolio and technical blog by Phan Cuong',
    url: 'https://phancuong.com',
    siteName: 'Phan Cuong Portfolio',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <AppRouterCacheProvider>
            <ThemeContextProvider>
              <AppShell>
                {children}
              </AppShell>
            </ThemeContextProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
