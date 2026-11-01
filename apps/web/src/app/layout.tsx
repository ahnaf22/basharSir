import type { Metadata } from 'next';
import {
  Hind_Siliguri,
  Noto_Sans_Bengali,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import { AppQueryProvider } from '@/lib/query-client';
import '@/styles/globals.css';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-bengali',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Home Tutor Bangladesh — ব্যক্তিগতকৃত ডিজিটাল গৃহশিক্ষক (NCTB)',
  description:
    'বাংলাদেশের ষষ্ঠ থেকে দশম শ্রেণির শিক্ষার্থীদের জন্য এনসিটিবি (NCTB) শিক্ষাক্রমভিত্তিক কৃত্রিম বুদ্ধিমত্তাসম্পন্ন ব্যক্তিগত গৃহশিক্ষক।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${notoSansBengali.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-content-primary antialiased">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}

