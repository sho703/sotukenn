import './globals.css';
import { Inter } from 'next/font/google';
import { Footer } from './components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "麻雀練習アプリ",
  description: "麻雀の手牌練習ができるアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
