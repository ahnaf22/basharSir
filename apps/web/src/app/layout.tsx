import type { Metadata } from 'next';
import {
  Anek_Bangla,
  Atma,
  Hind_Siliguri,
  JetBrains_Mono,
  Noto_Sans_Bengali,
  Plus_Jakarta_Sans,
} from 'next/font/google';
import { AppQueryProvider } from '@/lib/query-client';
import '@/styles/globals.css';

// Self-hosted at build time: no third-party stylesheet blocks first paint, and
// only the Bengali/Latin subsets each route actually uses are downloaded.
const anek = Anek_Bangla({
  subsets: ['bengali', 'latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--nf-anek',
});
const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--nf-hind',
});
const noto = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  display: 'swap',
  variable: '--nf-noto',
});
const atma = Atma({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--nf-atma',
  preload: false,
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--nf-mono',
  preload: false,
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--nf-jakarta',
  preload: false,
});
const fontVars = [anek, hind, noto, atma, mono, jakarta].map((f) => f.variable).join(' ');

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
    <html lang="bn" className={fontVars}>
      <body className="min-h-screen bg-canvas text-content-primary antialiased font-bangla selection:bg-brand-primary selection:text-[#241600]">
        <div className="board-tex" aria-hidden="true" />
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
