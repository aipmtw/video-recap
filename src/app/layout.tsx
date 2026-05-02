import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '影片重點筆記 | Video Recap',
  description: '精選 YouTube 影片的繁體中文重點筆記',
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-lg font-semibold tracking-wide text-stone-900">
              影片重點筆記
            </Link>
            <nav className="flex gap-5 text-sm text-stone-600">
              <Link href="/" className="hover:text-stone-900">首頁</Link>
              <Link href="/video-recap" className="hover:text-stone-900">所有筆記</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-6 text-xs text-stone-500">
            © {new Date().getFullYear()} 影片重點筆記
          </div>
        </footer>
      </body>
    </html>
  );
}
