import type { Metadata } from 'next';
import { AppQueryProvider } from '@/lib/query-client';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'পড়া হবে! (PORA HOBE) — তোমার নিজের AI Home Tutor',
  description:
    'বাংলাদেশের শিক্ষার্থীদের জন্য ব্যক্তিগত AI Home Tutor। বুঝে শেখো, প্রশ্ন করো, পরীক্ষা দাও আর নিজের গতিতে এগিয়ে যাও।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wdth,wght@75..125,400..800&family=Atma:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-canvas text-content-primary antialiased font-bangla selection:bg-brand-primary selection:text-[#241600]">
        <div className="board-tex" aria-hidden="true" />
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
