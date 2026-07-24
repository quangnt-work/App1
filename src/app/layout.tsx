import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RusSkill — Luyện Nghe & Nói Tiếng Nga',
  description:
    'App luyện nghe và nói tiếng Nga dành cho học sinh từ 12 tuổi trở lên. Phát âm chuẩn, theo dõi tiến độ dễ dàng.',
  keywords: ['tiếng Nga', 'Russian', 'luyện nghe', 'luyện nói', 'phát âm', 'học sinh'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col antialiased">
        <ThemeProvider>
          <QueryProvider>
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <MobileBottomNav />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
