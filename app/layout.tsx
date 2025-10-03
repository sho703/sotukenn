import './globals.css';
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';
import { Footer } from './components/footer';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  variable: '--font-noto-serif-jp',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata = {
  title: "麻雀練習アプリ",
  description: "麻雀の手牌練習ができるアプリケーション",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
